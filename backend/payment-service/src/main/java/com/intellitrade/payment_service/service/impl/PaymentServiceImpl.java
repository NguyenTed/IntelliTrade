package com.intellitrade.payment_service.service.impl;

import com.intellitrade.payment_service.data.Payment;
import com.intellitrade.payment_service.dto.request.VNPayOrderDTO;
import com.intellitrade.payment_service.enums.PaymentStatus;
import com.intellitrade.payment_service.enums.SubscriptionType;
import com.intellitrade.payment_service.repository.PaymentRepository;
import com.intellitrade.payment_service.service.PaymentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl  implements PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }


    @Override
    public String createPayment(String userId, SubscriptionType subscriptionType) {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(subscriptionType.getMonthlyPrice());
        payment.setUserId(userId);
        payment = paymentRepository.save(payment);
        return payment.getId();

    }

    @Transactional
    @Override
    public boolean updatePayment(VNPayOrderDTO vnPayOrderDTO) {
        Payment payment = paymentRepository.findById(vnPayOrderDTO.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        if(!payment.getStatus().equals(PaymentStatus.PENDING)) return false;
        if(vnPayOrderDTO.getTransactionStatus().equals("00")){
            payment.setTransactionNo(vnPayOrderDTO.getTransactionNo());
            payment.setTransactionTime(vnPayOrderDTO.getTransactionTime());
            payment.setStatus(PaymentStatus.SUCCESS);
            return true;
        }
        else{
            payment.setTransactionNo(vnPayOrderDTO.getTransactionNo());
            payment.setTransactionTime(vnPayOrderDTO.getTransactionTime());
            payment.setStatus(PaymentStatus.FAIL);
            return true;
        }
    }

}
