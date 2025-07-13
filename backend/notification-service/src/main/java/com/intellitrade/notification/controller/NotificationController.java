package com.intellitrade.notification.controller;

import com.intellitrade.event.dto.NotificationEvent;
import com.intellitrade.notification.dto.request.SendEmailRequest;
import com.intellitrade.notification.dto.request.SendGridEmailRequest;
import com.intellitrade.notification.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
public class NotificationController {
    EmailService emailService;

    @KafkaListener(topics = "notification-delivery")
    public void listenToNotificationDelivery(NotificationEvent notificationEvent) {
        log.info("Message received: {}", notificationEvent);

        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .to(SendGridEmailRequest.To.builder()
                        .email(notificationEvent.getRecipient())
                        .build())
                .subject(notificationEvent.getSubject())
                .content(SendGridEmailRequest.Content.builder()
                        .type("text/plain")
                        .value(notificationEvent.getBody())
                        .build())
                .build();

        emailService.sendEmail(sendEmailRequest);
    }
}
