package com.intellitrade.payment_service.controller;

import com.intellitrade.payment_service.dto.response.ApiResponse;
import com.intellitrade.payment_service.enums.SubscriptionType;
import com.intellitrade.payment_service.service.PaymentService;
import com.intellitrade.payment_service.vnpay.VNPayConfig;
import com.intellitrade.payment_service.vnpay.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {
    private final VNPayService vnPayService;
    private final PaymentService paymentService;

    public PaymentController(VNPayService vnPayService, PaymentService paymentService) {
        this.vnPayService = vnPayService;
        this.paymentService = paymentService;
    }


    @GetMapping("/vnpay/url/{subscriptionType}/{userId}")
    public ResponseEntity<String> getVNPayUrl(@PathVariable("subscriptionType")SubscriptionType subscriptionType, @PathVariable("userId") String userId){
        String paymentId = paymentService.createPayment(userId,subscriptionType);
        String url = vnPayService.generatePaymentUrl(subscriptionType,paymentId);
        return ResponseEntity.ok(url);
    }



}
