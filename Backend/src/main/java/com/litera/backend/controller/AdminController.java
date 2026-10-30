package com.litera.backend.controller;

import com.litera.backend.model.Book;
import com.litera.backend.model.BookStatus;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.BookService;
import com.litera.backend.service.OrderService;
import com.litera.backend.service.PaymentService;
import com.litera.backend.model.OrderStatus;
import com.litera.backend.model.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final BookService bookService;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;

    public AdminController(BookService bookService, UserRepository userRepository,
                           OrderService orderService, PaymentService paymentService) {
        this.bookService = bookService;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @GetMapping("/books/pending")
    public List<Book> pendingBooks() {
        return bookService.getPendingBooks();
    }

    @GetMapping("/books/pending/count")
    public long pendingBookCount() {
        return bookService.getPendingBookCount();
    }

    @PutMapping("/books/{id}/status")
    public Book updateBookStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return bookService.updateBookStatus(id, request.status());
    }

    @GetMapping("/users")
    public List<UserView> users() {
        return userRepository.findAll().stream()
                .map(user -> new UserView(user.getId(), user.getName(), user.getEmail(),
                        user.getRole().name(), user.getCreatedAt()))
                .toList();
    }

    @GetMapping("/orders")
    public List<OrderService.OrderView> orders() {
        return orderService.allOrders();
    }

    @PutMapping("/orders/{id}/status")
    public OrderService.OrderView updateOrderStatus(@PathVariable Long id,
                                                    @Valid @RequestBody OrderStatusRequest request) {
        return orderService.updateAdminOrderStatus(id, request.status());
    }

    @GetMapping("/payments")
    public List<PaymentService.PaymentView> payments() {
        return paymentService.adminHistory();
    }

    @PutMapping("/payments/{id}/status")
    public PaymentService.PaymentView updatePaymentStatus(@PathVariable Long id,
                                                          @Valid @RequestBody PaymentStatusRequest request) {
        return paymentService.updateStatus(id, request.status());
    }

    public record StatusRequest(@NotNull BookStatus status) {
    }

    public record OrderStatusRequest(@NotNull OrderStatus status) {
    }

    public record PaymentStatusRequest(@NotNull PaymentStatus status) {
    }

    public record UserView(Long id, String name, String email, String role, java.time.LocalDateTime createdAt) {
    }

}
