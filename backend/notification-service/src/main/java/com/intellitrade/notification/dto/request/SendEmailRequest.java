package com.intellitrade.notification.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendEmailRequest {
    SendGridEmailRequest.To to;
    String subject;
    SendGridEmailRequest.Content content;
}
