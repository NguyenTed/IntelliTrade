package com.intellitrade.notification.controller;

import com.intellitrade.notification.dto.request.SendEmailRequest;
import com.intellitrade.notification.dto.response.ApiResponse;
import com.intellitrade.notification.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
public class EmailController {
    EmailService emailService;

    @PostMapping("/email/send")
    ApiResponse<String> sendEmail(@RequestBody SendEmailRequest sendEmailRequest) {
        log.info("In EmailController");
        emailService.sendEmail(sendEmailRequest);
        return ApiResponse.<String>builder()
                .message("Email sent successfully!")
                .build();
    }
}
