package com.intellitrade.payment_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RestResponse<K> {
    @Builder.Default
    private int statusCode = 200;

    private String error;
    // message is string or list.
    private Object message;
    private K data;
}