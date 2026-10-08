package com.vedansh.smssyncserver.service;

import com.vedansh.smssyncserver.dto.PythonParseRequest;
import com.vedansh.smssyncserver.dto.PythonParseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Service
@Slf4j
public class PythonParserClient {

    private final RestClient restClient;
    private final String mlServiceUrl;

    public PythonParserClient(
            @Value("${ml.service.url:http://localhost:8000}") String mlServiceUrl) {
        this.mlServiceUrl = mlServiceUrl;
        this.restClient = RestClient.builder()
                .baseUrl(mlServiceUrl)
                .build();
    }

    public Optional<PythonParseResponse> parseSms(PythonParseRequest request) {
        try {
            log.info("Sending SMS ID {} to Python ML Parser at {}", request.getSmsId(), mlServiceUrl);
            PythonParseResponse response = restClient.post()
                    .uri("/internal/parser/parse")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(PythonParseResponse.class);

            return Optional.ofNullable(response);
        } catch (Exception ex) {
            log.warn("Python ML parser service unreachable or returned error for SMS ID {}: {}", request.getSmsId(), ex.getMessage());
            return Optional.empty();
        }
    }
}
