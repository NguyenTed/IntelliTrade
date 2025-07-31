package com.intellitrade.payment_service.service.impl;

import com.intellitrade.payment_service.data.Payment;
import com.intellitrade.payment_service.data.Subscription;
import com.intellitrade.payment_service.dto.request.SubscriptionUpdateRequest;
import com.intellitrade.payment_service.dto.request.VNPayOrderDTO;
import com.intellitrade.payment_service.dto.response.SubscriptionResponse;
import com.intellitrade.payment_service.enums.SubscriptionStatus;
import com.intellitrade.payment_service.enums.SubscriptionType;
import com.intellitrade.payment_service.external.ProfileClient;
import com.intellitrade.payment_service.repository.PaymentRepository;
import com.intellitrade.payment_service.repository.SubscriptionRepository;
import com.intellitrade.payment_service.service.SubscriptionService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ModelMapper modelMapper;
    private final ProfileClient profileClient;

    public SubscriptionServiceImpl(PaymentRepository paymentRepository, SubscriptionRepository subscriptionRepository, ModelMapper modelMapper, ProfileClient profileClient) {
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.modelMapper = modelMapper;
        this.profileClient = profileClient;
    }


    @Transactional
    @Override
    public SubscriptionResponse createSubscription(VNPayOrderDTO vnPayOrderDTO) {
        Payment payment = paymentRepository.findById(vnPayOrderDTO.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        // Check payment is only used by a subscription
        Optional<Subscription> existing = Optional.ofNullable(subscriptionRepository.findByPaymentId(payment.getId()));
        if (existing.isPresent()) {
            throw new RuntimeException("Subscription already exists for this paymentId");
        }

        // Check the active subscription in database
        Subscription existedActiveSubscription = subscriptionRepository.findByUserIdAndSubscriptionStatus(payment.getUserId(),SubscriptionStatus.ACTIVE);
        if(existedActiveSubscription!=null){
            existedActiveSubscription.setSubscriptionStatus(SubscriptionStatus.CANCELED);
            subscriptionRepository.saveAndFlush(existedActiveSubscription);
        }
        Subscription subscription = new Subscription();
        subscription.setPayment(payment);
        subscription.setUserId(payment.getUserId());
        subscription.setStartDate(payment.getTransactionTime());
        subscription.setSubscriptionType(vnPayOrderDTO.getSubscriptionType());
        Date payDate = vnPayOrderDTO.getTransactionTime();
        LocalDateTime payDateTime =
                payDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime endDateTime = payDateTime.plusDays(30);
        Date endDate = Date.from(endDateTime.atZone(ZoneId.systemDefault()).toInstant());
        subscription.setEndDate(endDate);
        subscription=subscriptionRepository.save(subscription);
        // send request to profile service to update profile
        SubscriptionUpdateRequest subscriptionUpdateRequest = new SubscriptionUpdateRequest();
        subscriptionUpdateRequest.setSubscriptionType(subscription.getSubscriptionType().toString());
        subscriptionUpdateRequest.setStartDate(payDate);
        subscriptionUpdateRequest.setEndDate(endDate);
        subscriptionUpdateRequest.setUserId(payment.getUserId());
        //profileClient.updateProfileSubscription(subscriptionUpdateRequest);

        //send email to inform that the success subscription



        SubscriptionResponse subscriptionResponse = modelMapper.map(subscription,SubscriptionResponse.class);
        return subscriptionResponse;

    }

    @Override
    public SubscriptionResponse updateExpiredSubscription(String userId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndSubscriptionStatus(userId,SubscriptionStatus.ACTIVE);
        subscription.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
        subscriptionRepository.save(subscription);
        SubscriptionResponse subscriptionResponse = new SubscriptionResponse();
        subscriptionResponse.setUserId(userId);
        subscriptionResponse.setSubscriptionType(SubscriptionType.NORMAL);
        subscriptionResponse.setStartDate(null);
        subscriptionResponse.setEndDate(null);

        return subscriptionResponse;
    }
}
