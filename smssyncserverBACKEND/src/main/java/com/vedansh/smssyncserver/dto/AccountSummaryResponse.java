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
public class AccountSummaryResponse {
    private String accountLastFour;
    private String bankName;
    private Double latestBalance;
    private Double totalSpent;
    private Double totalReceived;
    private Double netFlow;
    private Long transactionCount;
    private LocalDateTime lastTransactionDate;
}
