package com.vedansh.smssyncserver.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PythonParseRequest {

    @JsonProperty("sms_id")
    private Long smsId;

    private String sender;

    private String message;

    private Long timestamp;
}
