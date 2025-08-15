package com.intellitrade.payment_service.data;

import com.intellitrade.payment_service.enums.PaymentStatus;
import com.intellitrade.payment_service.enums.SubscriptionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Table(name ="payments")
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    private String userId;
    private Date transactionTime;
    private double amount;
    private String transactionNo;
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;





}
