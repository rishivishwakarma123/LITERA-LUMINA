package com.litera.backend.controller;

import com.litera.backend.model.User;
import com.litera.backend.repository.UserRepository;
import com.litera.backend.service.PaymentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService payments;
    private final UserRepository users;

    public PaymentController(PaymentService payments, UserRepository users) {
        this.payments = payments;
        this.users = users;
    }

    @GetMapping("/mine")
    public List<PaymentService.PaymentView> history(@AuthenticationPrincipal String email) {
        User user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
        return payments.history(user);
    }
}
