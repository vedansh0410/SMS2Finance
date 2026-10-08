package com.vedansh.smssyncserver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryResponse {

    private Double totalSpent;

    private Double totalReceived;

    private Double netFlow;

    private Long totalTransactions;

    private Long totalRawSms;
}
