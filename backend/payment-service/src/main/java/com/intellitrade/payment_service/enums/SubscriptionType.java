package com.intellitrade.payment_service.enums;

public enum SubscriptionType {
    NORMAL(0L),
    COMMUNITY(50000L),
    PRO(100000L);

    private final Long monthlyPrice;

    SubscriptionType(Long monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public Long getMonthlyPrice() {
        return monthlyPrice;
    }
}
