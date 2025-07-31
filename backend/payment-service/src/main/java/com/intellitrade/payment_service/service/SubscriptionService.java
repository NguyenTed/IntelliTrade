package com.intellitrade.payment_service.service;

import com.intellitrade.payment_service.dto.request.VNPayOrderDTO;
import com.intellitrade.payment_service.dto.response.SubscriptionResponse;

public interface SubscriptionService {
    public SubscriptionResponse createSubscription(VNPayOrderDTO vnPayOrderDTO);
    public SubscriptionResponse updateExpiredSubscription(String userId);
}
