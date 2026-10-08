package com.vedansh.smssyncserver.controller;

import com.vedansh.smssyncserver.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final TransactionService transactionService;

    @GetMapping("/spending")
    public ResponseEntity<List<Map<String, Object>>> getSpendingTrends(
            @RequestParam(required = false) String account) {
        return ResponseEntity.ok(transactionService.getSpendingAnalytics(account));
    }

    @GetMapping("/merchants")
    public ResponseEntity<List<Map<String, Object>>> getTopMerchants(
            @RequestParam(required = false) String account) {
        return ResponseEntity.ok(transactionService.getTopMerchants(account));
    }

    @GetMapping("/banks")
    public ResponseEntity<List<Map<String, Object>>> getBankDistribution(
            @RequestParam(required = false) String account) {
        return ResponseEntity.ok(transactionService.getBankDistribution(account));
    }
}
