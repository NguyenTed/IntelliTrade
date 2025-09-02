package com.intellitrade.payment_service.external;


import com.intellitrade.payment_service.dto.request.SubscriptionUpdateRequest;
import com.intellitrade.payment_service.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", url = "${app.services.profile}")
public interface ProfileClient {
    @PostMapping(value = "/profiles/internal/premium", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ApiResponse> updateProfileSubscription(@RequestBody SubscriptionUpdateRequest request);
}
