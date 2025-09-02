package com.intellitrade.profile.dto.request;

import java.util.Date;

public record UpsertPremiumRequest (
    String userId,
    Date startDate,
    Date endDate,
    String subscriptionType
) {}
