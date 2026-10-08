package com.vedansh.smssyncserver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;

    private Double amount;

    private LocalDateTime paymentDate;

    private String rrn;

    private String accountLastFour;

    private String transactionType;

    private Double bankBalance;

    private String bankName;

    private String merchant;

    private String upiId;

    private Long rawSmsId;

    private Double extractionConfidence;

    private String parserVersion;

    private String validationStatus;

    private LocalDateTime createdAt;
}
