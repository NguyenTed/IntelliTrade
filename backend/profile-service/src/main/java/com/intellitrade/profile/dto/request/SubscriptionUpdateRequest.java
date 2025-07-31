package com.intellitrade.profile.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionUpdateRequest {
    private String userId;
    private Date startDate;
    private Date endDate;
    private String subscriptionType;
}
