package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessage {
    private Long id;
    private Long sessionId;
    private String role;
    private String sender;
    private Long employeeId;
    private String content;
    private LocalDateTime createTime;
}
