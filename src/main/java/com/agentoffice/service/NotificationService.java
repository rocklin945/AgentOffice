package com.agentoffice.service;

import com.agentoffice.entity.NotificationMessage;
import com.agentoffice.mapper.NotificationMessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private NotificationMessageMapper notificationMapper;

    public List<Map<String, Object>> getList(Long userId, Integer readStatus, String category) {
        return notificationMapper.findList(userId, readStatus, category).stream()
                .map(this::toMap)
                .toList();
    }

    public void markRead(Long userId, Long id) {
        notificationMapper.markRead(id, userId);
    }

    public void markAllRead(Long userId) {
        notificationMapper.markAllRead(userId);
    }

    public void delete(Long userId, Long id) {
        notificationMapper.deleteById(id, userId);
    }

    private Map<String, Object> toMap(NotificationMessage message) {
        return Map.of(
                "id", message.getId(),
                "category", value(message.getCategory(), "system"),
                "title", value(message.getTitle(), "-"),
                "content", value(message.getContent(), ""),
                "sourceType", value(message.getSourceType(), ""),
                "sourceId", message.getSourceId() == null ? "" : message.getSourceId(),
                "readStatus", message.getReadStatus() != null && message.getReadStatus() == 1,
                "priority", value(message.getPriority(), "normal"),
                "createTime", message.getCreateTime() == null ? "" : message.getCreateTime().format(TIME)
        );
    }

    private String value(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }
}
