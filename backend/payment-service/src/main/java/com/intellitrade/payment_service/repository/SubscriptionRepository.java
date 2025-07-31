package com.intellitrade.payment_service.repository;

import com.intellitrade.payment_service.data.Subscription;
import com.intellitrade.payment_service.enums.SubscriptionStatus;
import com.intellitrade.payment_service.service.SubscriptionService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription,String> {
    public Subscription findByPaymentId(String id);
    public Subscription findByUserIdAndSubscriptionStatus(String userId, SubscriptionStatus subscriptionStatus);
}
