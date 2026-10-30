package com.litera.backend.service;

import com.litera.backend.model.*;
import com.litera.backend.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository payments;
    private final BookService books;

    public PaymentService(PaymentRepository payments, BookService books) {
        this.payments = payments;
        this.books = books;
    }

    @Transactional(readOnly = true)
    public List<PaymentView> history(User user) {
        List<PaymentView> result = new ArrayList<>();
        for (Payment payment : payments.findAllByOrderByTimestampDesc()) {
            PurchaseOrder order = payment.getOrder();
            if (user.getRole() == Role.ADMIN) {
                result.add(PaymentView.from(payment, order.getTotalAmount(), "PLATFORM", true));
                continue;
            }

            boolean buyer = order.getUser().getId().equals(user.getId());
            BigDecimal sales = BigDecimal.ZERO;
            for (OrderItem item : order.getItems()) {
                if (item.getSeller().getId().equals(user.getId())) {
                    sales = sales.add(item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
            if (buyer) {
                result.add(PaymentView.from(payment, payment.getAmount(),
                        sales.signum() > 0 ? "PURCHASE_AND_SALE" : "OUTGOING", true));
            } else if (sales.signum() > 0) {
                result.add(PaymentView.from(payment, sales, "INCOMING", false));
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<PaymentView> adminHistory() {
        return payments.findAllByOrderByTimestampDesc().stream()
                .map(payment -> PaymentView.from(payment, payment.getAmount(), "PLATFORM", true))
                .toList();
    }

    @Transactional
    public PaymentView updateStatus(Long paymentId, PaymentStatus status) {
        if (status != PaymentStatus.SUCCESS && status != PaymentStatus.FAILED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment status must be SUCCESS or FAILED");
        }
        Payment payment = payments.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only pending payments can be verified");
        }

        PurchaseOrder order = payment.getOrder();
        for (OrderItem item : order.getItems()) {
            Book book = books.getBookForUpdate(item.getBook().getId());
            if (book.getReservedQuantity() < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Inventory reservation is inconsistent; payment status was not changed");
            }
            book.setReservedQuantity(book.getReservedQuantity() - item.getQuantity());
            if (status == PaymentStatus.SUCCESS) {
                if (book.getStockQuantity() < item.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Insufficient inventory to confirm this payment");
                }
                int remaining = book.getStockQuantity() - item.getQuantity();
                book.setStockQuantity(remaining);
                if (remaining == 0) {
                    book.setStatus(BookStatus.SOLD_OUT);
                }
            } else if (book.getStatus() == BookStatus.SOLD_OUT && book.getStockQuantity() > 0) {
                book.setStatus(BookStatus.APPROVED);
            }
        }
        payment.setPaymentStatus(status);
        if (status == PaymentStatus.FAILED) {
            order.setOrderStatus(OrderStatus.CANCELLED);
        }
        return PaymentView.from(payment, payment.getAmount(), "PLATFORM", true);
    }

    public record PaymentView(Long id, Long orderId, String payerName, String payerEmail,
                              String transactionRefNo, BigDecimal amount, String paymentStatus,
                              String paymentMethod, String direction,
                              java.time.LocalDateTime timestamp) {
        static PaymentView from(Payment payment, BigDecimal amount, String direction, boolean includePayerEmail) {
            return new PaymentView(payment.getId(), payment.getOrder().getId(),
                    payment.getPayer().getName(),
                    includePayerEmail ? payment.getPayer().getEmail() : null,
                    payment.getTransactionRefNo(), amount, payment.getPaymentStatus().name(),
                    payment.getPaymentMethod(), direction, payment.getTimestamp());
        }
    }
}
