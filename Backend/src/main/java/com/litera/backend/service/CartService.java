package com.litera.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import com.litera.backend.model.CartItem;
import com.litera.backend.model.User;
import com.litera.backend.repository.CartItemRepository;

@Service
public class CartService {
    private final CartItemRepository cartItems;
    private final BookService books;

    public CartService(CartItemRepository cartItems, BookService books) {
        this.cartItems = cartItems;
        this.books = books;
    }

    @Transactional(readOnly = true)
    public List<CartItemView> getItems(User user) {
        return cartItems.findByUserIdOrderById(user.getId()).stream()
                .map(CartItemView::from)
                .toList();
    }

    @Transactional
    public CartItemView addItem(User user, Long productId, Integer quantity) {
        Book book = requireAvailableBook(productId);
        CartItem item = cartItems.findByUserIdAndBookId(user.getId(), productId)
                .orElseGet(() -> new CartItem(user, book, 0));
        int newQuantity = item.getQuantity() + quantity;
        validateAvailable(book, newQuantity);
        item.setQuantity(newQuantity);
        return CartItemView.from(cartItems.save(item));
    }

    @Transactional
    public CartItemView updateItem(User user, Long itemId, Integer quantity) {
        CartItem item = cartItems.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        Book book = requireAvailableBook(item.getBook().getId());
        validateAvailable(book, quantity);
        item.setQuantity(quantity);
        return CartItemView.from(cartItems.save(item));
    }

    @Transactional
    public void removeItem(User user, Long itemId) {
        CartItem item = cartItems.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        cartItems.delete(item);
    }

    @Transactional
    public void clear(User user) {
        cartItems.deleteAll(cartItems.findByUserIdOrderById(user.getId()));
    }

    private Book requireAvailableBook(Long id) {
        Book book = books.getBookForUpdate(id);
        if (book.getStatus() != BookStatus.APPROVED || book.getAvailableQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This book is not available");
        }
        return book;
    }

    private void validateAvailable(Book book, Integer quantity) {
        if (quantity == null || quantity < 1 || quantity > book.getAvailableQuantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Requested quantity exceeds the available stock");
        }
    }

    public record CartItemView(Long id, Long productId, String title, String author,
                               Double price, Integer quantity, Integer availableQuantity,
                               String imageUrl) {
        static CartItemView from(CartItem item) {
            Book book = item.getBook();
            return new CartItemView(item.getId(), book.getId(), book.getTitle(), book.getAuthor(),
                    book.getPrice(), item.getQuantity(), book.getAvailableQuantity(), book.getImageUrl());
        }
    }
}
