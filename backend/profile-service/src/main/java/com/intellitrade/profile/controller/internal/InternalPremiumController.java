package com.intellitrade.profile.controller.internal;

import com.intellitrade.profile.dto.request.UpsertPremiumRequest;
import com.intellitrade.profile.dto.response.ApiResponse;
import com.intellitrade.profile.service.PremiumService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/premium") // protect this!
@RequiredArgsConstructor
public class InternalPremiumController {
    private final PremiumService premiumService;

    @PostMapping("/upsert")
    public ApiResponse<Void> upsert(@RequestBody UpsertPremiumRequest req) {
        return ApiResponse.<Void>builder().result(premiumService.apply(req)).build();
    }
}
