package com.vedansh.smssyncserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "financial_transactions", indexes = {
        @Index(name = "idx_txn_rrn", columnList = "rrn"),
        @Index(name = "idx_txn_payment_date", columnList = "paymentDate"),
        @Index(name = "idx_txn_bank_name", columnList = "bankName"),
        @Index(name = "idx_txn_raw_sms_id", columnList = "rawSmsId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;

    private LocalDateTime paymentDate;

    private String rrn;

    private String accountLastFour;

    private String transactionType; // DEBIT, CREDIT, UNKNOWN

    private Double bankBalance;

    private String bankName;

    private String merchant;

    private String upiId;

    private Long rawSmsId;

    private Double extractionConfidence;

    private String parserVersion;

    private String validationStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
