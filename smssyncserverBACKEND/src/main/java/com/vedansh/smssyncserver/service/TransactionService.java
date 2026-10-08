package com.vedansh.smssyncserver.service;

import com.vedansh.smssyncserver.dto.AccountSummaryResponse;
import com.vedansh.smssyncserver.dto.FinancialSummaryResponse;
import com.vedansh.smssyncserver.dto.TransactionResponse;
import com.vedansh.smssyncserver.entity.TransactionEntity;
import com.vedansh.smssyncserver.repository.SmsRepository;
import com.vedansh.smssyncserver.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SmsRepository smsRepository;

    public List<AccountSummaryResponse> getAccounts() {
        List<TransactionEntity> list = transactionRepository.findAllByOrderByPaymentDateDesc();

        // Group transactions by accountLastFour (use "UNKNOWN" if null or empty)
        Map<String, List<TransactionEntity>> grouped = new LinkedHashMap<>();
        for (TransactionEntity t : list) {
            String acc = (t.getAccountLastFour() != null && !t.getAccountLastFour().isBlank())
                    ? t.getAccountLastFour().trim()
                    : "UNKNOWN";
            grouped.computeIfAbsent(acc, k -> new ArrayList<>()).add(t);
        }

        List<AccountSummaryResponse> accounts = new ArrayList<>();
        for (Map.Entry<String, List<TransactionEntity>> entry : grouped.entrySet()) {
            String accNum = entry.getKey();
            List<TransactionEntity> txns = entry.getValue();

            // Find inferred bank name
            String bankName = null;
            for (TransactionEntity t : txns) {
                if (t.getBankName() != null && !t.getBankName().isBlank()) {
                    bankName = t.getBankName();
                    break;
                }
            }
            if (bankName == null) {
                bankName = "Bank A/c ••" + accNum;
            }

            // Find latest available bank balance
            Double latestBal = null;
            LocalDateTime lastDate = null;
            for (TransactionEntity t : txns) {
                if (lastDate == null && t.getPaymentDate() != null) {
                    lastDate = t.getPaymentDate();
                }
                if (latestBal == null && t.getBankBalance() != null) {
                    latestBal = t.getBankBalance();
                }
                if (lastDate != null && latestBal != null) break;
            }

            double totalSpent = 0.0;
            double totalReceived = 0.0;
            for (TransactionEntity t : txns) {
                double amt = t.getAmount() != null ? t.getAmount() : 0.0;
                if ("DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                    totalSpent += amt;
                } else if ("CREDIT".equalsIgnoreCase(t.getTransactionType())) {
                    totalReceived += amt;
                }
            }

            double netFlow = totalReceived - totalSpent;

            accounts.add(AccountSummaryResponse.builder()
                    .accountLastFour(accNum)
                    .bankName(bankName)
                    .latestBalance(latestBal != null ? Math.round(latestBal * 100.0) / 100.0 : null)
                    .totalSpent(Math.round(totalSpent * 100.0) / 100.0)
                    .totalReceived(Math.round(totalReceived * 100.0) / 100.0)
                    .netFlow(Math.round(netFlow * 100.0) / 100.0)
                    .transactionCount((long) txns.size())
                    .lastTransactionDate(lastDate)
                    .build());
        }

        // Sort accounts by transaction count descending, keeping real accounts first
        accounts.sort((a, b) -> {
            if ("UNKNOWN".equals(a.getAccountLastFour())) return 1;
            if ("UNKNOWN".equals(b.getAccountLastFour())) return -1;
            return Long.compare(b.getTransactionCount(), a.getTransactionCount());
        });

        return accounts;
    }

    public List<TransactionResponse> getTransactions(String bank, String type, String search, String account) {
        List<TransactionEntity> list = transactionRepository.findAllByOrderByPaymentDateDesc();

        return list.stream()
                .filter(t -> {
                    // Account filter
                    if (account != null && !account.isBlank() && !account.equalsIgnoreCase("ALL")) {
                        if ("UNKNOWN".equalsIgnoreCase(account)) {
                            if (t.getAccountLastFour() != null && !t.getAccountLastFour().isBlank()) {
                                return false;
                            }
                        } else {
                            if (t.getAccountLastFour() == null || !t.getAccountLastFour().equalsIgnoreCase(account)) {
                                return false;
                            }
                        }
                    }

                    // Bank filter
                    if (bank != null && !bank.isBlank() && !bank.equalsIgnoreCase("ALL")) {
                        if (t.getBankName() == null || !t.getBankName().equalsIgnoreCase(bank)) {
                            return false;
                        }
                    }

                    // Type filter
                    if (type != null && !type.isBlank() && !type.equalsIgnoreCase("ALL")) {
                        if (t.getTransactionType() == null || !t.getTransactionType().equalsIgnoreCase(type)) {
                            return false;
                        }
                    }

                    // Search filter
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        boolean matchMerchant = t.getMerchant() != null && t.getMerchant().toLowerCase().contains(s);
                        boolean matchRrn = t.getRrn() != null && t.getRrn().toLowerCase().contains(s);
                        boolean matchUpi = t.getUpiId() != null && t.getUpiId().toLowerCase().contains(s);
                        boolean matchBank = t.getBankName() != null && t.getBankName().toLowerCase().contains(s);
                        boolean matchAcc = t.getAccountLastFour() != null && t.getAccountLastFour().toLowerCase().contains(s);
                        if (!matchMerchant && !matchRrn && !matchUpi && !matchBank && !matchAcc) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<TransactionResponse> getTransactionById(Long id) {
        return transactionRepository.findById(id).map(this::mapToResponse);
    }

    public FinancialSummaryResponse getFinancialSummary(String account) {
        if (account != null && !account.isBlank() && !account.equalsIgnoreCase("ALL")) {
            Double totalDebit = transactionRepository.getTotalDebitAmountByAccount(account);
            Double totalCredit = transactionRepository.getTotalCreditAmountByAccount(account);
            long totalTxns = transactionRepository.countByAccountLastFour(account);

            double spent = totalDebit != null ? totalDebit : 0.0;
            double received = totalCredit != null ? totalCredit : 0.0;
            double net = received - spent;

            return FinancialSummaryResponse.builder()
                    .totalSpent(Math.round(spent * 100.0) / 100.0)
                    .totalReceived(Math.round(received * 100.0) / 100.0)
                    .netFlow(Math.round(net * 100.0) / 100.0)
                    .totalTransactions(totalTxns)
                    .totalRawSms(smsRepository.count())
                    .build();
        }

        Double totalDebit = transactionRepository.getTotalDebitAmount();
        Double totalCredit = transactionRepository.getTotalCreditAmount();
        long totalTxns = transactionRepository.count();
        long totalRaw = smsRepository.count();

        double spent = totalDebit != null ? totalDebit : 0.0;
        double received = totalCredit != null ? totalCredit : 0.0;
        double net = received - spent;

        return FinancialSummaryResponse.builder()
                .totalSpent(Math.round(spent * 100.0) / 100.0)
                .totalReceived(Math.round(received * 100.0) / 100.0)
                .netFlow(Math.round(net * 100.0) / 100.0)
                .totalTransactions(totalTxns)
                .totalRawSms(totalRaw)
                .build();
    }

    public List<Map<String, Object>> getSpendingAnalytics(String account) {
        List<TransactionEntity> list = transactionRepository.findAllByOrderByPaymentDateDesc();
        if (account != null && !account.isBlank() && !account.equalsIgnoreCase("ALL")) {
            list = list.stream()
                    .filter(t -> t.getAccountLastFour() != null && t.getAccountLastFour().equalsIgnoreCase(account))
                    .collect(Collectors.toList());
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Double> debitsByDate = new TreeMap<>();
        Map<String, Double> creditsByDate = new TreeMap<>();

        for (TransactionEntity t : list) {
            if (t.getPaymentDate() == null) continue;
            String dateKey = t.getPaymentDate().format(fmt);
            if ("DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                debitsByDate.put(dateKey, debitsByDate.getOrDefault(dateKey, 0.0) + (t.getAmount() != null ? t.getAmount() : 0.0));
            } else if ("CREDIT".equalsIgnoreCase(t.getTransactionType())) {
                creditsByDate.put(dateKey, creditsByDate.getOrDefault(dateKey, 0.0) + (t.getAmount() != null ? t.getAmount() : 0.0));
            }
        }

        Set<String> allDates = new TreeSet<>();
        allDates.addAll(debitsByDate.keySet());
        allDates.addAll(creditsByDate.keySet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (String date : allDates) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", date);
            map.put("debit", Math.round(debitsByDate.getOrDefault(date, 0.0) * 100.0) / 100.0);
            map.put("credit", Math.round(creditsByDate.getOrDefault(date, 0.0) * 100.0) / 100.0);
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getTopMerchants(String account) {
        List<TransactionEntity> list = transactionRepository.findAllByOrderByPaymentDateDesc();
        if (account != null && !account.isBlank() && !account.equalsIgnoreCase("ALL")) {
            list = list.stream()
                    .filter(t -> t.getAccountLastFour() != null && t.getAccountLastFour().equalsIgnoreCase(account))
                    .collect(Collectors.toList());
        }

        Map<String, Long> countMap = new HashMap<>();
        Map<String, Double> sumMap = new HashMap<>();

        for (TransactionEntity t : list) {
            if (t.getMerchant() == null || t.getMerchant().isBlank()) continue;
            String m = t.getMerchant();
            countMap.put(m, countMap.getOrDefault(m, 0L) + 1);
            sumMap.put(m, sumMap.getOrDefault(m, 0.0) + (t.getAmount() != null ? t.getAmount() : 0.0));
        }

        List<Map<String, Object>> listResult = new ArrayList<>();
        for (String m : countMap.keySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("merchant", m);
            item.put("count", countMap.get(m));
            item.put("totalAmount", Math.round(sumMap.get(m) * 100.0) / 100.0);
            listResult.add(item);
        }

        listResult.sort((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")));
        return listResult;
    }

    public List<Map<String, Object>> getBankDistribution(String account) {
        List<TransactionEntity> list = transactionRepository.findAllByOrderByPaymentDateDesc();
        if (account != null && !account.isBlank() && !account.equalsIgnoreCase("ALL")) {
            list = list.stream()
                    .filter(t -> t.getAccountLastFour() != null && t.getAccountLastFour().equalsIgnoreCase(account))
                    .collect(Collectors.toList());
        }

        Map<String, Long> countMap = new HashMap<>();
        Map<String, Double> sumMap = new HashMap<>();

        for (TransactionEntity t : list) {
            String b = t.getBankName() != null ? t.getBankName() : "Other / Unspecified";
            countMap.put(b, countMap.getOrDefault(b, 0L) + 1);
            sumMap.put(b, sumMap.getOrDefault(b, 0.0) + (t.getAmount() != null ? t.getAmount() : 0.0));
        }

        List<Map<String, Object>> listResult = new ArrayList<>();
        for (String b : countMap.keySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("bankName", b);
            item.put("count", countMap.get(b));
            item.put("totalAmount", Math.round(sumMap.get(b) * 100.0) / 100.0);
            listResult.add(item);
        }

        listResult.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        return listResult;
    }

    private TransactionResponse mapToResponse(TransactionEntity t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .paymentDate(t.getPaymentDate())
                .rrn(t.getRrn())
                .accountLastFour(t.getAccountLastFour())
                .transactionType(t.getTransactionType())
                .bankBalance(t.getBankBalance())
                .bankName(t.getBankName())
                .merchant(t.getMerchant())
                .upiId(t.getUpiId())
                .rawSmsId(t.getRawSmsId())
                .extractionConfidence(t.getExtractionConfidence())
                .parserVersion(t.getParserVersion())
                .validationStatus(t.getValidationStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
