package com.intellitrade.payment_service.controller.internal;

import com.intellitrade.payment_service.dto.response.ApiResponse;
import com.intellitrade.payment_service.dto.response.SubscriptionResponse;
import com.intellitrade.payment_service.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
public class InternalSubscriptionController {

    private final SubscriptionService subscriptionService;

    public InternalSubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/subscription/expiration/{userId}")
    public ApiResponse<SubscriptionResponse> updateExpiredSubscription(@PathVariable String userId) {
        return ApiResponse.<SubscriptionResponse>builder()
                .result(subscriptionService.updateExpiredSubscription(userId))
                .build();
    }

}
