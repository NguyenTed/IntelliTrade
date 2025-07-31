package com.intellitrade.payment_service.dto.request;

import com.intellitrade.payment_service.enums.SubscriptionType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VNPayOrderDTO {
    private String paymentId;
    private String transactionNo;
    private String transactionStatus;
    private Date transactionTime;
    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;
}
