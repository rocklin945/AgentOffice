package com.agentoffice.llm;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "llm")
public class LlmConfig {
    private String apiKey;
    private String apiBase;
    private String model = "MiniMax-M2.7";
}
