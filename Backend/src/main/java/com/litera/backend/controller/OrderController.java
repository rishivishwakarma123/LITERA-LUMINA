package com.litera.backend.controller;

import com.litera.backend.model.User;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orders;
    private final UserRepository users;

    public OrderController(OrderService orders, UserRepository users) {
        this.orders = orders;
        this.users = users;
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderService.OrderView checkout(@AuthenticationPrincipal String email,
                                           @Valid @RequestBody CheckoutRequest request) {
        return orders.checkout(currentUser(email), request.shippingAddress(), request.transactionRefNo());
    }

    @GetMapping("/mine")
    public List<OrderService.OrderView> mine(@AuthenticationPrincipal String email) {
        return orders.buyerOrders(currentUser(email));
    }

    @PostMapping("/{id}/cancel")
    public OrderService.OrderView cancel(@AuthenticationPrincipal String email, @PathVariable Long id) {
        return orders.cancelOrder(currentUser(email), id);
    }

    private User currentUser(String email) {
        return users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
    }

    public record CheckoutRequest(
            @NotBlank @Size(max = 1000) String shippingAddress,
            @NotBlank @Size(max = 100) String transactionRefNo) {
    }
}
