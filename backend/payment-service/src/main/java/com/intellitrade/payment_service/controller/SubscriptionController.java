package com.intellitrade.payment_service.controller;

import com.intellitrade.payment_service.dto.request.VNPayOrderDTO;
import com.intellitrade.payment_service.dto.response.RestResponse;
import com.intellitrade.payment_service.dto.response.SubscriptionResponse;
import com.intellitrade.payment_service.service.PaymentService;
import com.intellitrade.payment_service.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final PaymentService paymentService;

    public SubscriptionController(SubscriptionService subscriptionService, PaymentService paymentService) {
        this.subscriptionService = subscriptionService;
        this.paymentService = paymentService;
    }
    @PostMapping
    public ResponseEntity<RestResponse> createSubscription(@RequestBody VNPayOrderDTO vnPayOrderDTO) {
        if (paymentService.updatePayment(vnPayOrderDTO)&&vnPayOrderDTO.getTransactionStatus().equals("00")) {
            SubscriptionResponse subscriptionResponse = subscriptionService.createSubscription(vnPayOrderDTO);
            return ResponseEntity.ok().body(new RestResponse(200, "", "",subscriptionResponse));
        }
        return ResponseEntity.ok()
                .body(new RestResponse(401, "", "Transaction failed!! Please check the credit card!!", ""));
    }


}
