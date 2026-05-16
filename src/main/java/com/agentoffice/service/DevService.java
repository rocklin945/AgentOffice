package com.agentoffice.service;

import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.mapper.DevFileMapper;
import com.agentoffice.mapper.DevProjectMapper;
import com.agentoffice.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DevService {

    @Autowired
    private DevProjectMapper projectMapper;

    @Autowired
    private DevFileMapper fileMapper;

    private static final String WORKSPACE_ROOT = "workspace_artifacts";

    private Path getFileSystemPath(DevFile file) {
        String filePath = file.getFilePath();
        if (filePath == null || filePath.isBlank()) {
            throw new BusinessException(400, "文件路径为空");
        }
        // 清理路径
        filePath = filePath.replace("\\", "/");
        if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
        }
        return Paths.get(System.getProperty("user.dir"), WORKSPACE_ROOT, filePath).toAbsolutePath().normalize();
    }

    public List<DevProject> getProjectList() {
        return projectMapper.findAll();
    }

    public DevProject getProjectById(Long id) {
        DevProject project = projectMapper.findById(id);
        if (project == null) {
            throw new BusinessException(404, "项目不存在");
        }
        return project;
    }

    @Transactional
    public DevProject createProject(DevProject project) {
        if (project.getStatus() == null) {
            project.setStatus(1);
        }
        projectMapper.insert(project);

        // 创建默认项目结构
        DevFile srcDir = new DevFile();
        srcDir.setProjectId(project.getId());
        srcDir.setFileName("src");
        srcDir.setFilePath("/src");
        srcDir.setFileType("directory");
        srcDir.setParentId(null);
        srcDir.setIsDirectory(1);
        fileMapper.insert(srcDir);

        return project;
    }

    @Transactional
    public DevProject updateProject(Long id, DevProject project) {
        DevProject exist = projectMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "项目不存在");
        }
        project.setId(id);
        projectMapper.update(project);
        return project;
    }

    @Transactional
    public void deleteProject(Long id) {
        fileMapper.deleteByProjectId(id);
        projectMapper.deleteById(id);
    }

    public List<DevFile> getFileTree(Long projectId) {
        List<DevFile> allFiles = fileMapper.findByProjectId(projectId);
        return buildTree(allFiles, null);
    }

    private List<DevFile> buildTree(List<DevFile> allFiles, Long parentId) {
        List<DevFile> result = new ArrayList<>();
        for (DevFile file : allFiles) {
            if ((parentId == null && file.getParentId() == null) ||
                (parentId != null && parentId.equals(file.getParentId()))) {
                if (file.getIsDirectory() != null && file.getIsDirectory() == 1) {
                    file.setChildren(buildTree(allFiles, file.getId()));
                }
                result.add(file);
            }
        }
        return result;
    }

    public DevFile getFileById(Long id) {
        DevFile file = fileMapper.findById(id);
        if (file == null) {
            throw new BusinessException(404, "文件不存在");
        }
        return file;
    }

    public Map<String, Object> getFileWithContent(Long id) {
        DevFile file = fileMapper.findById(id);
        if (file == null) {
            throw new BusinessException(404, "文件不存在");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", file.getId());
        result.put("projectId", file.getProjectId());
        result.put("fileName", file.getFileName());
        result.put("filePath", file.getFilePath());
        result.put("fileType", file.getFileType());
        result.put("parentId", file.getParentId());
        result.put("isDirectory", file.getIsDirectory());
        result.put("createTime", file.getCreateTime());
        result.put("updateTime", file.getUpdateTime());

        if (file.getIsDirectory() == null || file.getIsDirectory() == 0) {
            try {
                Path path = getFileSystemPath(file);
                if (Files.exists(path)) {
                    result.put("content", Files.readString(path, StandardCharsets.UTF_8));
                } else {
                    result.put("content", "");
                }
            } catch (IOException e) {
                result.put("content", "");
            }
        }
        return result;
    }

    @Transactional
    public DevFile createFile(Long projectId, DevFile file, String content) {
        file.setProjectId(projectId);
        if (file.getIsDirectory() == null) {
            file.setIsDirectory(0);
        }
        fileMapper.insert(file);

        // 如果是文件，创建实际文件
        if (file.getIsDirectory() == 0 && file.getFilePath() != null) {
            try {
                Path path = getFileSystemPath(file);
                Files.createDirectories(path.getParent());
                Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
            } catch (IOException e) {
                // 忽略，创建后DB已有记录
            }
        }
        return file;
    }

    @Transactional
    public DevFile updateFileContent(Long id, String content) {
        DevFile exist = fileMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "文件不存在");
        }

        // 直接写入文件系统
        if (exist.getIsDirectory() == null || exist.getIsDirectory() == 0) {
            try {
                Path path = getFileSystemPath(exist);
                Files.createDirectories(path.getParent());
                Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new BusinessException(500, "文件写入失败: " + e.getMessage());
            }
        }
        return exist;
    }

    @Transactional
    public void deleteFile(Long id) {
        fileMapper.deleteById(id);
    }

    public String runCode(Long fileId, String language) {
        DevFile file = fileMapper.findById(fileId);
        if (file == null) {
            throw new BusinessException(404, "文件不存在");
        }

        String content = "";
        try {
            Path path = getFileSystemPath(file);
            if (Files.exists(path)) {
                content = Files.readString(path, StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            content = "";
        }
        return "文件：" + file.getFilePath() + "\n语言：" + language + "\n字符数：" + content.length() + "\n";
    }
}
