package com.intellitrade.payment_service.service;

import com.intellitrade.payment_service.dto.request.VNPayOrderDTO;
import com.intellitrade.payment_service.enums.SubscriptionType;

public interface PaymentService {
    public String createPayment(String userId, SubscriptionType subscriptionType);
    public boolean updatePayment(VNPayOrderDTO vnPayOrderDTO);
}
