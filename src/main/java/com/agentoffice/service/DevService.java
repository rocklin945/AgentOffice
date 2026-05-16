package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.mapper.DevFileMapper;
import com.agentoffice.mapper.DevProjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.CRC32;
import java.util.stream.Stream;

@Service
public class DevService {

    @Autowired
    private DevProjectMapper projectMapper;

    @Autowired
    private DevFileMapper fileMapper;

    private static final Long CODE_PROJECT_ID = 1L;
    private static final String WORKSPACE_ROOT = "workspace_artifacts";
    private static final String CODE_DIR = "code";

    public List<DevProject> getProjectList() {
        ensureCodeRoot();
        return List.of(codeProject());
    }

    public DevProject getProjectById(Long id) {
        ensureCodeRoot();
        return codeProject();
    }

    @Transactional
    public DevProject createProject(DevProject project) {
        if (project.getStatus() == null) {
            project.setStatus(1);
        }
        projectMapper.insert(project);

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
        if (CODE_PROJECT_ID.equals(id)) {
            throw new BusinessException(400, "云端开发代码目录不能删除");
        }
        fileMapper.deleteByProjectId(id);
        projectMapper.deleteById(id);
    }

    public List<DevFile> getFileTree(Long projectId) {
        Path root = ensureCodeRoot();
        try (Stream<Path> stream = Files.list(root)) {
            return stream.sorted(fileOrder())
                    .map(path -> toDevFile(path, null))
                    .toList();
        } catch (IOException e) {
            throw new BusinessException(500, "读取代码目录失败: " + e.getMessage());
        }
    }

    public DevFile getFileById(Long id) {
        DevFile file = findFileById(id);
        if (file == null) {
            throw new BusinessException(404, "文件不存在");
        }
        return file;
    }

    public Map<String, Object> getFileWithContent(Long id) {
        DevFile file = getFileById(id);
        Map<String, Object> result = fileToMap(file);

        if (file.getIsDirectory() == null || file.getIsDirectory() == 0) {
            Path path = resolveCodePath(file.getFilePath());
            try {
                result.put("content", Files.exists(path) ? Files.readString(path, StandardCharsets.UTF_8) : "");
            } catch (IOException e) {
                throw new BusinessException(500, "读取文件失败: " + e.getMessage());
            }
        }
        return result;
    }

    @Transactional
    public DevFile createFile(Long projectId, DevFile file, String content) {
        if (file.getFilePath() == null || file.getFilePath().isBlank()) {
            throw new BusinessException(400, "文件路径为空");
        }

        Path path = resolveCodePath(file.getFilePath());
        try {
            if (file.getIsDirectory() != null && file.getIsDirectory() == 1) {
                Files.createDirectories(path);
            } else {
                Files.createDirectories(path.getParent());
                Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new BusinessException(500, "创建文件失败: " + e.getMessage());
        }

        return toDevFile(path, parentId(path));
    }

    @Transactional
    public DevFile updateFileContent(Long id, String content) {
        DevFile exist = getFileById(id);
        if (exist.getIsDirectory() != null && exist.getIsDirectory() == 1) {
            throw new BusinessException(400, "目录不能写入内容");
        }

        Path path = resolveCodePath(exist.getFilePath());
        try {
            Files.createDirectories(path.getParent());
            Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BusinessException(500, "文件写入失败: " + e.getMessage());
        }
        return toDevFile(path, parentId(path));
    }

    @Transactional
    public void deleteFile(Long id) {
        DevFile file = getFileById(id);
        Path path = resolveCodePath(file.getFilePath());
        try {
            if (Files.isDirectory(path)) {
                try (Stream<Path> stream = Files.walk(path)) {
                    List<Path> paths = stream.sorted(Comparator.reverseOrder()).toList();
                    for (Path item : paths) {
                        Files.deleteIfExists(item);
                    }
                }
            } else {
                Files.deleteIfExists(path);
            }
        } catch (IOException e) {
            throw new BusinessException(500, "删除文件失败: " + e.getMessage());
        }
    }

    public String runCode(Long fileId, String language) {
        DevFile file = getFileById(fileId);
        if (file.getIsDirectory() != null && file.getIsDirectory() == 1) {
            throw new BusinessException(400, "目录不能运行");
        }

        String content = "";
        try {
            Path path = resolveCodePath(file.getFilePath());
            if (Files.exists(path)) {
                content = Files.readString(path, StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            content = "";
        }
        return "文件：" + file.getFilePath() + "\n语言：" + language + "\n字符数：" + content.length() + "\n";
    }

    private DevProject codeProject() {
        DevProject project = new DevProject();
        project.setId(CODE_PROJECT_ID);
        project.setProjectName("workspace_artifacts/code");
        project.setDescription("AI 员工真实写入的代码工作区");
        project.setLanguage("Mixed");
        project.setStatus(1);
        return project;
    }

    private Path ensureCodeRoot() {
        Path root = codeRoot();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new BusinessException(500, "创建代码目录失败: " + e.getMessage());
        }
        return root;
    }

    private Path codeRoot() {
        return Paths.get(System.getProperty("user.dir"), WORKSPACE_ROOT, CODE_DIR).toAbsolutePath().normalize();
    }

    private Path resolveCodePath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new BusinessException(400, "文件路径为空");
        }

        String normalized = filePath.replace("\\", "/").trim();
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith(WORKSPACE_ROOT + "/")) {
            normalized = normalized.substring((WORKSPACE_ROOT + "/").length());
        }
        if (normalized.equals(CODE_DIR)) {
            normalized = "";
        } else if (normalized.startsWith(CODE_DIR + "/")) {
            normalized = normalized.substring((CODE_DIR + "/").length());
        }

        Path root = ensureCodeRoot();
        Path resolved = root.resolve(normalized).normalize();
        if (!resolved.startsWith(root)) {
            throw new BusinessException(400, "非法文件路径");
        }
        return resolved;
    }

    private Comparator<Path> fileOrder() {
        return Comparator
                .comparing((Path path) -> !Files.isDirectory(path))
                .thenComparing(path -> path.getFileName().toString().toLowerCase());
    }

    private DevFile toDevFile(Path path, Long parentId) {
        Path normalized = path.toAbsolutePath().normalize();
        String relative = artifactRelative(normalized);
        boolean directory = Files.isDirectory(normalized);

        DevFile file = new DevFile();
        file.setId(stableId(relative));
        file.setProjectId(CODE_PROJECT_ID);
        file.setFileName(normalized.getFileName().toString());
        file.setFilePath(relative);
        file.setFileType(directory ? "directory" : fileType(normalized));
        file.setParentId(parentId);
        file.setIsDirectory(directory ? 1 : 0);

        if (directory) {
            try (Stream<Path> stream = Files.list(normalized)) {
                file.setChildren(stream.sorted(fileOrder())
                        .map(child -> toDevFile(child, file.getId()))
                        .toList());
            } catch (IOException e) {
                file.setChildren(List.of());
            }
        }
        return file;
    }

    private String fileType(Path path) {
        String fileName = path.getFileName().toString();
        int index = fileName.lastIndexOf('.');
        return index >= 0 && index < fileName.length() - 1 ? fileName.substring(index + 1) : "text";
    }

    private String artifactRelative(Path path) {
        Path root = codeRoot();
        if (path.equals(root)) {
            return CODE_DIR;
        }
        return CODE_DIR + "/" + root.relativize(path).toString().replace("\\", "/");
    }

    private Long parentId(Path path) {
        Path parent = path.toAbsolutePath().normalize().getParent();
        Path root = codeRoot();
        if (parent == null || parent.equals(root) || !parent.startsWith(root)) {
            return null;
        }
        return stableId(artifactRelative(parent));
    }

    private Long stableId(String relativePath) {
        CRC32 crc32 = new CRC32();
        crc32.update(relativePath.getBytes(StandardCharsets.UTF_8));
        return 10_000L + crc32.getValue();
    }

    private DevFile findFileById(Long id) {
        return findInTree(getFileTree(CODE_PROJECT_ID), id);
    }

    private DevFile findInTree(List<DevFile> files, Long id) {
        for (DevFile file : files) {
            if (file.getId().equals(id)) {
                return file;
            }
            if (file.getChildren() != null && !file.getChildren().isEmpty()) {
                DevFile found = findInTree(file.getChildren(), id);
                if (found != null) {
                    return found;
                }
            }
        }
        return null;
    }

    private Map<String, Object> fileToMap(DevFile file) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", file.getId());
        result.put("projectId", file.getProjectId());
        result.put("fileName", file.getFileName());
        result.put("filePath", file.getFilePath());
        result.put("fileType", file.getFileType());
        result.put("parentId", file.getParentId());
        result.put("isDirectory", file.getIsDirectory());
        result.put("directory", file.getIsDirectory() != null && file.getIsDirectory() == 1);
        return result;
    }
}
