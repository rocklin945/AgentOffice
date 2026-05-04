package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatSession {
    private Long id;
    private String sessionId;
    private Long userId;
    private Long agentId;
    private String sessionType;
    private String title;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
