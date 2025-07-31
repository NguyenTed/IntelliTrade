package com.intellitrade.payment_service.dto.response;

import com.intellitrade.payment_service.enums.SubscriptionStatus;
import com.intellitrade.payment_service.enums.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionResponse {
    private String userId;
    private Date startDate;
    private Date endDate;
    private SubscriptionType subscriptionType;
}
