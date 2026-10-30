package com.litera.backend.service;

import com.litera.backend.model.*;
import com.litera.backend.repository.CartItemRepository;
import com.litera.backend.repository.PaymentRepository;
import com.litera.backend.repository.PurchaseOrderRepository;
import com.litera.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class OrderService {
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500.00");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("40.00");

    private final CartItemRepository cartItems;
    private final PurchaseOrderRepository orders;
    private final PaymentRepository payments;
    private final UserRepository users;
    private final BookService books;
    private final BigDecimal taxRate;

    public OrderService(CartItemRepository cartItems, PurchaseOrderRepository orders,
                        PaymentRepository payments, UserRepository users, BookService books,
                        @Value("${app.checkout.tax-rate:0.05}") BigDecimal taxRate) {
        this.cartItems = cartItems;
        this.orders = orders;
        this.payments = payments;
        this.users = users;
        this.books = books;
        if (taxRate.signum() < 0 || taxRate.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("app.checkout.tax-rate must be between 0 and 1");
        }
        this.taxRate = taxRate;
    }

    @Transactional
    public OrderView checkout(User buyer, String shippingAddress, String transactionRefNo) {
        String normalizedReference = transactionRefNo.trim();
        if (payments.existsByTransactionRefNoIgnoreCase(normalizedReference)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That transaction reference was already submitted");
        }
        List<CartItem> items = cartItems.findByUserIdOrderById(buyer.getId()).stream()
                .sorted(Comparator.comparing(item -> item.getBook().getId()))
                .toList();
        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Your cart is empty");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : items) {
            Book book = books.getBookForUpdate(cartItem.getBook().getId());
            if (book.getStatus() != BookStatus.APPROVED
                    || cartItem.getQuantity() > book.getAvailableQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "A cart item is no longer available in the requested quantity");
            }
            book.setReservedQuantity(book.getReservedQuantity() + cartItem.getQuantity());
            BigDecimal unitPrice = BigDecimal.valueOf(book.getPrice()).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            User seller = users.findById(book.getSellerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                            "The seller account for a cart item no longer exists"));
            orderItems.add(new OrderItem(book, seller, book.getTitle(), unitPrice, cartItem.getQuantity()));
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) < 0
                ? SHIPPING_FEE : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).add(shipping).setScale(2, RoundingMode.HALF_UP);
        PurchaseOrder savedOrder = orders.saveAndFlush(
                new PurchaseOrder(buyer, shippingAddress.trim(), subtotal, tax, shipping, total));

        for (OrderItem item : orderItems) {
            savedOrder.addItem(item);
        }
        savedOrder = orders.save(savedOrder);
        Payment payment = payments.save(new Payment(savedOrder, buyer, normalizedReference, total));
        cartItems.deleteAll(items);
        return OrderView.from(savedOrder, payment);
    }

    @Transactional(readOnly = true)
    public List<OrderView> buyerOrders(User user) {
        return orders.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(order -> OrderView.from(order, payments.findByOrderId(order.getId()).orElse(null)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderView> allOrders() {
        return orders.findAllByOrderByCreatedAtDesc().stream()
                .map(order -> OrderView.from(order, payments.findByOrderId(order.getId()).orElse(null)))
                .toList();
    }

    @Transactional
    public OrderView cancelOrder(User buyer, Long orderId) {
        PurchaseOrder order = orders.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        Payment payment = payments.findByOrderIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Order has no payment"));
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only orders awaiting payment verification can be cancelled");
        }
        releaseReservation(order);
        payment.setPaymentStatus(PaymentStatus.FAILED);
        order.setOrderStatus(OrderStatus.CANCELLED);
        return OrderView.from(order, payment);
    }

    @Transactional
    public OrderView updateAdminOrderStatus(Long orderId, OrderStatus nextStatus) {
        PurchaseOrder order = orders.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Payment payment = payments.findByOrderIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Order has no payment"));
        if (nextStatus == OrderStatus.CANCELLED) {
            if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "A paid order cannot be cancelled without a verified refund");
            }
            releaseReservation(order);
            payment.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.CANCELLED);
        } else if (nextStatus == OrderStatus.SHIPPED
                && order.getOrderStatus() == OrderStatus.PLACED
                && payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            order.setOrderStatus(OrderStatus.SHIPPED);
        } else if (nextStatus == OrderStatus.DELIVERED
                && order.getOrderStatus() == OrderStatus.SHIPPED
                && payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            order.setOrderStatus(OrderStatus.DELIVERED);
        } else {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Invalid order status transition");
        }
        return OrderView.from(order, payment);
    }

    private void releaseReservation(PurchaseOrder order) {
        for (OrderItem item : order.getItems()) {
            Book book = books.getBookForUpdate(item.getBook().getId());
            book.setReservedQuantity(Math.max(0, book.getReservedQuantity() - item.getQuantity()));
        }
    }

    public record OrderView(Long id, String buyerName, String buyerEmail,
                            BigDecimal subtotal, BigDecimal taxAmount, BigDecimal shippingAmount,
                            BigDecimal totalAmount, String shippingAddress, String orderStatus,
                            String paymentStatus, String transactionRefNo, String paymentMethod,
                            java.time.LocalDateTime createdAt, List<OrderLineView> items) {
        static OrderView from(PurchaseOrder order, Payment payment) {
            return new OrderView(order.getId(), order.getUser().getName(), order.getUser().getEmail(),
                    order.getSubtotal(), order.getTaxAmount(), order.getShippingAmount(),
                    order.getTotalAmount(), order.getShippingAddress(), order.getOrderStatus().name(),
                    payment == null ? null : payment.getPaymentStatus().name(),
                    payment == null ? null : payment.getTransactionRefNo(),
                    payment == null ? null : payment.getPaymentMethod(), order.getCreatedAt(),
                    order.getItems().stream().map(OrderLineView::from).toList());
        }
    }

    public record OrderLineView(Long productId, String title, String author, String sellerName,
                                BigDecimal unitPrice, Integer quantity) {
        static OrderLineView from(OrderItem item) {
            return new OrderLineView(item.getBook().getId(), item.getBookTitle(),
                    item.getBook().getAuthor(), item.getSeller().getName(),
                    item.getUnitPrice(), item.getQuantity());
        }
    }
}
