package com.litera.backend.controller;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import com.litera.backend.model.User;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.BookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;
    private final UserRepository userRepository;

    public BookController(BookService bookService, UserRepository userRepository) {
        this.bookService = bookService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Book> searchBooks(@RequestParam(required = false) String q,
                                  @RequestParam(required = false) String category,
                                  @RequestParam(required = false) Double minPrice,
                                  @RequestParam(required = false) Double maxPrice,
                                  @RequestParam(defaultValue = "false") boolean inStock) {
        if ((minPrice != null && minPrice < 0) || (maxPrice != null && maxPrice < 0)
                || (minPrice != null && maxPrice != null && minPrice > maxPrice)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid price range");
        }
        return bookService.searchMarketplace(q, category, minPrice, maxPrice, inStock);
    }

    @PostMapping({"", "/upload"})
    public ResponseEntity<Book> uploadBook(@Valid @RequestBody BookUploadRequest request,
                                           @AuthenticationPrincipal String email) {
        User seller = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
        Book book = new Book();
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setDescription(request.description());
        book.setCategory(request.category().trim());
        book.setPrice(request.price());
        book.setOriginalPrice(request.originalPrice());
        book.setQuantity(request.quantity());
        book.setImageUrl(request.imageUrl());
        book.setConditionLevel(request.conditionLevel());
        book.setConditionDetails(request.conditionDetails());
        book.setSeller(seller);
        book.setSellerName(seller.getName());
        book.setSellerEmail(seller.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.saveBook(book));
    }

    @GetMapping("/approved")
    public List<Book> getApprovedBooks() {
        return bookService.searchMarketplace(null, null, null, null, false);
    }

    @GetMapping("/seller/mine")
    public List<Book> getSellerBooks(@AuthenticationPrincipal String email) {
        User seller = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
        return bookService.getSellerBooks(seller.getId());
    }

    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        if (book.getStatus() != BookStatus.APPROVED || book.getAvailableQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found");
        }
        return book;
    }

    public record BookUploadRequest(
            @NotBlank @Size(max = 250) String title,
            @NotBlank @Size(max = 150) String author,
            @Size(max = 2000) String description,
            @NotBlank @Size(max = 100) String category,
            @DecimalMin("0.01") Double price,
            @DecimalMin("0.00") Double originalPrice,
            @Min(1) Integer quantity,
            @Size(max = 1000) String imageUrl,
            @Size(max = 50) String conditionLevel,
            @Size(max = 500) String conditionDetails) {
    }
}
