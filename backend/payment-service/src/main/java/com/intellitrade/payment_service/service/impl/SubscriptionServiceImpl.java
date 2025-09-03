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
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
@Slf4j
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
        Date payDate = vnPayOrderDTO.getTransactionTime();
        Instant provider = (payDate != null) ? payDate.toInstant() : Instant.now();
        Instant now      = Instant.now();
        Instant startInstant = now.isAfter(provider) ? now : provider;   // pick the later of the two
        Instant endInstant   = startInstant.plus(30, ChronoUnit.DAYS);

        Date startDate = Date.from(startInstant);
        Date endDate   = Date.from(endInstant);

        ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
        log.info("start UTC: {}", startInstant);
        log.info("start VN : {}", startInstant.atZone(VN));
        log.info("end   UTC: {}", endInstant);
        log.info("end   VN : {}", endInstant.atZone(VN));

        Subscription subscription = new Subscription();
        subscription.setPayment(payment);
        subscription.setUserId(payment.getUserId());
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setSubscriptionType(vnPayOrderDTO.getSubscriptionType());
        subscription=subscriptionRepository.saveAndFlush(subscription);

        // send request to profile service to update profile
        SubscriptionUpdateRequest subscriptionUpdateRequest = new SubscriptionUpdateRequest();
        subscriptionUpdateRequest.setSubscriptionType(subscription.getSubscriptionType().toString());
        subscriptionUpdateRequest.setStartDate(payDate);
        subscriptionUpdateRequest.setEndDate(endDate);
        subscriptionUpdateRequest.setUserId(payment.getUserId());
        profileClient.updateProfileSubscription(subscriptionUpdateRequest);

        //send email to inform that the success subscription

        System.out.println("Now: " + Instant.now());
        System.out.println("Subscription start date: " + subscription.getStartDate());
        System.out.println("Subscription end date: " + subscription.getEndDate());

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
