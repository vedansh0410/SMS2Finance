package com.vedansh.smssyncserver.service;

import com.vedansh.smssyncserver.dto.PythonParseRequest;
import com.vedansh.smssyncserver.dto.PythonParseResponse;
import com.vedansh.smssyncserver.dto.SmsRequest;
import com.vedansh.smssyncserver.entity.SmsEntity;
import com.vedansh.smssyncserver.entity.TransactionEntity;
import com.vedansh.smssyncserver.mapper.SmsMapper;
import com.vedansh.smssyncserver.repository.SmsRepository;
import com.vedansh.smssyncserver.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SmsRepository smsRepository;
    private final TransactionRepository transactionRepository;
    private final PythonParserClient pythonParserClient;

    public SmsEntity save(SmsRequest request) {
        SmsEntity entity = SmsMapper.toEntity(request);
        entity.setProcessingStatus("PENDING");
        SmsEntity savedEntity = smsRepository.save(entity);

        // Process extraction
        processRawSms(savedEntity);

        return savedEntity;
    }

    public void processRawSms(SmsEntity sms) {
        try {
            PythonParseRequest parseReq = PythonParseRequest.builder()
                    .smsId(sms.getId())
                    .sender(sms.getSender())
                    .message(sms.getMessage())
                    .timestamp(sms.getTimestamp())
                    .build();

            Optional<PythonParseResponse> optRes = pythonParserClient.parseSms(parseReq);
            if (optRes.isPresent()) {
                PythonParseResponse res = optRes.get();

                if (res.getAmount() != null && ("VALID".equalsIgnoreCase(res.getValidationStatus()) || "INCOMPLETE".equalsIgnoreCase(res.getValidationStatus()))) {
                    // Check if already parsed for this raw SMS ID
                    List<TransactionEntity> existingForThisSms = transactionRepository.findAll().stream()
                            .filter(t -> t.getRawSmsId() != null && t.getRawSmsId().equals(sms.getId()))
                            .toList();

                    // Check duplicate via RRN (Algorithm 3 Level 1) if from another SMS
                    if (existingForThisSms.isEmpty() && res.getRrn() != null && !res.getRrn().isBlank() && transactionRepository.existsByRrn(res.getRrn().trim())) {
                        log.info("Duplicate transaction detected for RRN {}. Dropping duplicate.", res.getRrn());
                        sms.setProcessingStatus("DUPLICATE_DROPPED");
                        smsRepository.save(sms);
                        return;
                    }

                    LocalDateTime paymentDateTime = null;
                    if (sms.getTimestamp() != null && sms.getTimestamp() > 0) {
                        paymentDateTime = LocalDateTime.ofInstant(
                                Instant.ofEpochMilli(sms.getTimestamp()),
                                ZoneId.systemDefault()
                        );
                    } else {
                        paymentDateTime = LocalDateTime.now();
                    }

                    TransactionEntity transaction = existingForThisSms.isEmpty()
                            ? new TransactionEntity()
                            : existingForThisSms.get(0);

                    transaction.setAmount(res.getAmount());
                    transaction.setPaymentDate(paymentDateTime);
                    transaction.setRrn(res.getRrn());
                    transaction.setAccountLastFour(res.getAccountLastFour());
                    transaction.setTransactionType(res.getTransactionType() != null ? res.getTransactionType() : "UNKNOWN");
                    transaction.setBankBalance(res.getBankBalance());
                    transaction.setBankName(res.getBankName());
                    transaction.setMerchant(TransactionService.sanitizeMerchant(res.getMerchant()));
                    transaction.setUpiId(res.getUpiId());
                    transaction.setRawSmsId(sms.getId());
                    transaction.setExtractionConfidence(res.getExtractionConfidence());
                    transaction.setParserVersion(res.getParserVersion());
                    transaction.setValidationStatus(res.getValidationStatus());

                    transactionRepository.save(transaction);
                    sms.setProcessingStatus("PARSED");
                } else {
                    sms.setProcessingStatus("SKIPPED_NON_TXN");
                }
            } else {
                sms.setProcessingStatus("PENDING");
            }
            smsRepository.save(sms);
        } catch (Exception ex) {
            log.error("Error processing raw SMS ID {}: {}", sms.getId(), ex.getMessage());
            sms.setProcessingStatus("FAILED");
            sms.setProcessingError(ex.getMessage());
            smsRepository.save(sms);
        }
    }

    public int reprocessAllPending() {
        List<SmsEntity> allList = smsRepository.findAll();
        int count = 0;
        for (SmsEntity sms : allList) {
            processRawSms(sms);
            count++;
        }
        return count;
    }
}