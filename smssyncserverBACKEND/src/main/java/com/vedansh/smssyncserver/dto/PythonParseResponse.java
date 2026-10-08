package com.vedansh.smssyncserver.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PythonParseResponse {

    @JsonProperty("sms_id")
    private Long smsId;

    private String sender;

    private Double amount;

    @JsonProperty("payment_date")
    private String paymentDate;

    private String rrn;

    @JsonProperty("account_last_four")
    private String accountLastFour;

    @JsonProperty("transaction_type")
    private String transactionType;

    @JsonProperty("bank_balance")
    private Double bankBalance;

    @JsonProperty("bank_name")
    private String bankName;

    private String merchant;

    @JsonProperty("upi_id")
    private String upiId;

    @JsonProperty("extraction_confidence")
    private Double extractionConfidence;

    @JsonProperty("parser_version")
    private String parserVersion;

    @JsonProperty("validation_status")
    private String validationStatus;
}
