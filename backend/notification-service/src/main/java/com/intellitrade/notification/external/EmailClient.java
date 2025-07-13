package com.intellitrade.notification.external;

import com.intellitrade.notification.dto.request.SendGridEmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "email-client", url = "${notification.email.sendgrid-url}")
public interface EmailClient {
    @PostMapping(value = "/v3/mail/send", produces = MediaType.APPLICATION_JSON_VALUE)
    void sendEmail(@RequestHeader("Authorization") String apiKey, @RequestBody SendGridEmailRequest sendGridEmailRequest);
}
