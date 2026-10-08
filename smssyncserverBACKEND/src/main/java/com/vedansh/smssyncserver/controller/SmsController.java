package com.vedansh.smssyncserver.controller;

import com.vedansh.smssyncserver.dto.SmsRequest;
import com.vedansh.smssyncserver.dto.SmsResponse;
import com.vedansh.smssyncserver.entity.SmsEntity;
import com.vedansh.smssyncserver.repository.SmsRepository;
import com.vedansh.smssyncserver.service.SmsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmsController {

    private final SmsService service;
    private final SmsRepository smsRepository;

    @PostMapping
    public ResponseEntity<SmsResponse> save(
            @RequestBody SmsRequest request) {

        service.save(request);

        return ResponseEntity.ok(
                new SmsResponse(
                        true,
                        "SMS Saved"
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<SmsEntity>> getAllRawSms() {
        return ResponseEntity.ok(smsRepository.findAllByOrderByIdDesc());
    }
}