package com.vedansh.smssyncserver.controller;

import com.vedansh.smssyncserver.dto.AccountSummaryResponse;
import com.vedansh.smssyncserver.dto.FinancialSummaryResponse;
import com.vedansh.smssyncserver.dto.TransactionResponse;
import com.vedansh.smssyncserver.service.SmsService;
import com.vedansh.smssyncserver.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;
    private final SmsService smsService;

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountSummaryResponse>> getAccounts() {
        return ResponseEntity.ok(transactionService.getAccounts());
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false) String bank,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String account) {
        return ResponseEntity.ok(transactionService.getTransactions(bank, type, search, account));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryResponse> getSummary(
            @RequestParam(required = false) String account) {
        return ResponseEntity.ok(transactionService.getFinancialSummary(account));
    }

    @PostMapping("/reparse-all")
    public ResponseEntity<Map<String, Object>> reprocessAll() {
        int count = smsService.reprocessAllPending();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reprocessedCount", count,
                "message", "Pending raw SMS messages processed"
        ));
    }
}
