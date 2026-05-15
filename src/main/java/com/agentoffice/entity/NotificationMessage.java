package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationMessage {
    private Long id;
    private Long userId;
    private String category;
    private String title;
    private String content;
    private String sourceType;
    private Long sourceId;
    private Integer readStatus;
    private String priority;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
