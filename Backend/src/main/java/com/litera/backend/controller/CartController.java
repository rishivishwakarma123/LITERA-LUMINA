package com.litera.backend.controller;

import com.litera.backend.model.User;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final UserRepository users;

    public CartController(CartService cartService, UserRepository users) {
        this.cartService = cartService;
        this.users = users;
    }

    @GetMapping
    public List<CartService.CartItemView> items(@AuthenticationPrincipal String email) {
        return cartService.getItems(currentUser(email));
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartService.CartItemView add(@AuthenticationPrincipal String email,
                                        @Valid @RequestBody AddItemRequest request) {
        return cartService.addItem(currentUser(email), request.productId(), request.quantity());
    }

    @PutMapping("/items/{id}")
    public CartService.CartItemView update(@AuthenticationPrincipal String email,
                                           @PathVariable Long id,
                                           @Valid @RequestBody UpdateItemRequest request) {
        return cartService.updateItem(currentUser(email), id, request.quantity());
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal String email, @PathVariable Long id) {
        cartService.removeItem(currentUser(email), id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@AuthenticationPrincipal String email) {
        cartService.clear(currentUser(email));
    }

    private User currentUser(String email) {
        return users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
    }

    public record AddItemRequest(@NotNull Long productId, @NotNull @Min(1) Integer quantity) {
    }

    public record UpdateItemRequest(@NotNull @Min(1) Integer quantity) {
    }
}
