package com.litera.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
public class CheckoutConfigController {
    private final BigDecimal taxRate;
    private final String upiReceiverPhone;

    public CheckoutConfigController(@Value("${app.checkout.tax-rate:0.05}") BigDecimal taxRate,
                                    @Value("${app.payment.upi-receiver-phone:7905873589}") String upiReceiverPhone) {
        this.taxRate = taxRate;
        this.upiReceiverPhone = upiReceiverPhone;
    }

    @GetMapping("/api/checkout/config")
    public CheckoutConfig configuration() {
        return new CheckoutConfig(taxRate.doubleValue(), 40.0, 500.0, upiReceiverPhone);
    }

    public record CheckoutConfig(double taxRate, double shippingFee,
                                 double freeShippingThreshold, String upiReceiverPhone) {
    }
}
