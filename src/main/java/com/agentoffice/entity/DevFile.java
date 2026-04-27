package com.agentoffice.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DevFile {
    private Long id;
    private Long projectId;
    private String fileName;
    private String filePath;
    private String fileType;
    private String content;
    private Long parentId;
    private Integer isDirectory;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<DevFile> children;
}
