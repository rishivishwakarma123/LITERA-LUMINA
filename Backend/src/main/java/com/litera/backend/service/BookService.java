package com.litera.backend.service;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import com.litera.backend.repository.BookRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Book saveBook(Book book) {
        book.setId(null);
        book.setStatus(BookStatus.PENDING);
        book.setReservedQuantity(0);
        if (book.getPrice() == null || book.getPrice() <= 0 || book.getQuantity() == null
                || book.getQuantity() < 1 || book.getSellerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid price, quantity, and seller are required");
        }
        return bookRepository.save(book);
    }

    public List<Book> getApprovedBooks() {
        return bookRepository.findByStatus(BookStatus.APPROVED);
    }

    public List<Book> getPendingBooks() {
        return bookRepository.findByStatus(BookStatus.PENDING);
    }

    public long getPendingBookCount() {
        return bookRepository.countByStatus(BookStatus.PENDING);
    }

    public List<Book> searchMarketplace(String query, String category, Double minPrice,
                                        Double maxPrice, boolean inStock) {
        return bookRepository.searchMarketplace(
                BookStatus.APPROVED,
                query == null || query.isBlank() ? null : query.trim(),
                category == null || category.isBlank() ? null : category.trim(),
                minPrice,
                maxPrice,
                inStock);
    }

    public List<Book> getSellerBooks(Long sellerId) {
        return bookRepository.findBySeller_Id(sellerId);
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    public Book getBookForUpdate(Long id) {
        return bookRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    public Book updateBookStatus(Long id, BookStatus status) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        if (status != BookStatus.APPROVED && status != BookStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only APPROVED or REJECTED are valid moderation decisions");
        }
        if (status == BookStatus.REJECTED && book.getReservedQuantity() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A book with pending orders cannot be rejected");
        }
        book.setStatus(status);
        return bookRepository.save(book);
    }
}