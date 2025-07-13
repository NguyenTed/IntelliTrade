package com.intellitrade.notification.service;

import com.intellitrade.notification.dto.request.SendEmailRequest;
import com.intellitrade.notification.dto.request.SendGridEmailRequest;
import com.intellitrade.notification.exception.AppException;
import com.intellitrade.notification.exception.ErrorCode;
import com.intellitrade.notification.external.EmailClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class EmailService {
    EmailClient emailClient;

    @Value("${notification.email.sendgrid-apikey}")
    @NonFinal
    String apiKey;

    @Value("${notification.email.sender-email}")
    @NonFinal
    String senderEmail;

    public void sendEmail(SendEmailRequest request) {
        SendGridEmailRequest sendGridEmailRequest = SendGridEmailRequest.builder()
                .from(SendGridEmailRequest.From.builder()
                        .email(senderEmail)
                        .name("Intelli Trade")
                        .build())
                .personalizations(List.of(
                        SendGridEmailRequest.Personalization.builder()
                                .to(List.of(SendGridEmailRequest.To.builder()
                                        .email(request.getTo().getEmail())
                                        .name(request.getTo().getName())
                                        .build()))
                                .subject(request.getSubject())
                                .build()))
                .content(List.of(SendGridEmailRequest.Content.builder()
                        .type(request.getContent().getType())
                        .value(request.getContent().getValue())
                        .build()))
                .build();

        try {
            emailClient.sendEmail("Bearer " + apiKey, sendGridEmailRequest);
        } catch (FeignException e) {
            log.error(e.getMessage(), e);
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
