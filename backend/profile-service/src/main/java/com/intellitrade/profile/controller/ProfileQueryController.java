package com.intellitrade.profile.controller;

import com.intellitrade.profile.dto.response.PremiumStatusResponse;
import com.intellitrade.profile.service.ProfileQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileQueryController {
    private final ProfileQueryService queries;

    @GetMapping("/{userId}/premium-status")
    public ResponseEntity<PremiumStatusResponse> status(@PathVariable String userId) {
        var temp = queries.getPremiumStatus(userId);
        System.out.println("Api hit, " + temp);
        return ResponseEntity.ok(temp);
    }
}
