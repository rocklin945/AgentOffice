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
import java.nio.file.StandardCopyOption;
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

    private static final String WORKSPACE_ROOT = "workspace_artifacts";
    private static final String CODE_DIR = "code";

    public List<DevProject> getProjectList() {
        return listProjectRoots().stream()
                .map(this::toProject)
                .toList();
    }

    public DevProject getProjectById(Long id) {
        return toProject(findProjectRoot(id));
    }

    @Transactional
    public DevProject createProject(DevProject project) {
        String projectName = validateProjectName(project.getProjectName());
        Path root = ensureCodeRoot();
        Path projectRoot = root.resolve(projectName).normalize();
        if (!projectRoot.startsWith(root)) {
            throw new BusinessException(400, "Invalid project name");
        }

        try {
            Files.createDirectories(projectRoot);
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to create project directory: " + e.getMessage());
        }

        return toProject(projectRoot);
    }

    @Transactional
    public DevProject updateProject(Long id, DevProject project) {
        Path existingRoot = findProjectRoot(id);
        String nextName = project.getProjectName();
        if (nextName == null || nextName.isBlank() || existingRoot.getFileName().toString().equals(nextName.trim())) {
            return toProject(existingRoot);
        }

        String projectName = validateProjectName(nextName);
        Path root = ensureCodeRoot();
        Path targetRoot = root.resolve(projectName).normalize();
        if (!targetRoot.startsWith(root)) {
            throw new BusinessException(400, "Invalid project name");
        }
        if (Files.exists(targetRoot)) {
            throw new BusinessException(400, "Project directory already exists");
        }

        try {
            Files.move(existingRoot, targetRoot, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            try {
                Files.move(existingRoot, targetRoot);
            } catch (IOException fallback) {
                throw new BusinessException(500, "Failed to rename project directory: " + fallback.getMessage());
            }
        }

        return toProject(targetRoot);
    }

    @Transactional
    public void deleteProject(Long id) {
        Path projectRoot = findProjectRoot(id);
        try (Stream<Path> stream = Files.walk(projectRoot)) {
            List<Path> paths = stream.sorted(Comparator.reverseOrder()).toList();
            for (Path item : paths) {
                Files.deleteIfExists(item);
            }
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to delete project directory: " + e.getMessage());
        }
    }

    private static final java.util.Set<String> EXCLUDED_DIRS = java.util.Set.of(
            "target", "node_modules", ".git", ".mvn", ".idea", "__pycache__", ".gradle", "build");

    public List<DevFile> getFileTree(Long projectId) {
        Path projectRoot = findProjectRoot(projectId);
        try (Stream<Path> stream = Files.list(projectRoot)) {
            return stream.sorted(fileOrder())
                    .filter(p -> !EXCLUDED_DIRS.contains(p.getFileName().toString()))
                    .map(path -> toDevFile(path, null, projectId, projectRoot))
                    .toList();
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to read project files: " + e.getMessage());
        }
    }

    public DevFile getFileById(Long id) {
        DevFile file = findFileById(id);
        if (file == null) {
            throw new BusinessException(404, "File does not exist");
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
                throw new BusinessException(500, "Failed to read file: " + e.getMessage());
            }
        }
        return result;
    }

    @Transactional
    public DevFile createFile(Long projectId, DevFile file, String content) {
        if (file.getFilePath() == null || file.getFilePath().isBlank()) {
            throw new BusinessException(400, "File path is empty");
        }

        Path projectRoot = findProjectRoot(projectId);
        Path path = resolveProjectPath(projectRoot, file.getFilePath());
        try {
            if (file.getIsDirectory() != null && file.getIsDirectory() == 1) {
                Files.createDirectories(path);
            } else {
                Files.createDirectories(path.getParent());
                Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to create file: " + e.getMessage());
        }

        return toDevFile(path, parentId(path, projectRoot), projectId, projectRoot);
    }

    @Transactional
    public DevFile updateFileContent(Long id, String content) {
        DevFile exist = getFileById(id);
        if (exist.getIsDirectory() != null && exist.getIsDirectory() == 1) {
            throw new BusinessException(400, "Cannot write content to a directory");
        }

        Path path = resolveCodePath(exist.getFilePath());
        Path projectRoot = projectRootForPath(path);
        try {
            Files.createDirectories(path.getParent());
            Files.writeString(path, content != null ? content : "", StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to write file: " + e.getMessage());
        }
        return toDevFile(path, parentId(path, projectRoot), exist.getProjectId(), projectRoot);
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
            throw new BusinessException(500, "Failed to delete file: " + e.getMessage());
        }
    }

    public String runCode(Long fileId, String language) {
        DevFile file = getFileById(fileId);
        if (file.getIsDirectory() != null && file.getIsDirectory() == 1) {
            throw new BusinessException(400, "Cannot run a directory");
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
        return "File: " + file.getFilePath() + "\nLanguage: " + language + "\nCharacters: " + content.length() + "\n";
    }

    private DevProject toProject(Path projectRoot) {
        Path normalized = projectRoot.toAbsolutePath().normalize();
        String projectName = normalized.getFileName().toString();

        DevProject project = new DevProject();
        project.setId(stableId(artifactRelative(normalized)));
        project.setProjectName(projectName);
        project.setDescription(WORKSPACE_ROOT + "/" + CODE_DIR + "/" + projectName);
        project.setLanguage("Mixed");
        project.setStatus(1);
        return project;
    }

    private List<Path> listProjectRoots() {
        Path root = ensureCodeRoot();
        try (Stream<Path> stream = Files.list(root)) {
            return stream.filter(Files::isDirectory)
                    .sorted(fileOrder())
                    .toList();
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to read code directory: " + e.getMessage());
        }
    }

    private Path findProjectRoot(Long projectId) {
        return listProjectRoots().stream()
                .filter(path -> stableId(artifactRelative(path)).equals(projectId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "Project does not exist"));
    }

    private Path ensureCodeRoot() {
        Path root = codeRoot();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to create code directory: " + e.getMessage());
        }
        return root;
    }

    private Path codeRoot() {
        return Paths.get(System.getProperty("user.dir"), WORKSPACE_ROOT, CODE_DIR).toAbsolutePath().normalize();
    }

    private Path resolveCodePath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new BusinessException(400, "File path is empty");
        }

        String normalized = stripVirtualRoot(filePath);
        Path root = ensureCodeRoot();
        Path resolved = root.resolve(normalized).normalize();
        if (!resolved.startsWith(root)) {
            throw new BusinessException(400, "Invalid file path");
        }
        return resolved;
    }

    private Path resolveProjectPath(Path projectRoot, String filePath) {
        String normalized = stripVirtualRoot(filePath);
        Path root = ensureCodeRoot();
        Path resolved = root.resolve(normalized).normalize();
        if (!resolved.startsWith(projectRoot)) {
            resolved = projectRoot.resolve(normalized).normalize();
        }
        if (!resolved.startsWith(projectRoot) || resolved.equals(projectRoot)) {
            throw new BusinessException(400, "Invalid project file path");
        }
        return resolved;
    }

    private String stripVirtualRoot(String filePath) {
        String normalized = filePath.replace("\\", "/").trim();
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith(WORKSPACE_ROOT + "/")) {
            normalized = normalized.substring((WORKSPACE_ROOT + "/").length());
        }
        if (normalized.equals(CODE_DIR)) {
            return "";
        }
        if (normalized.startsWith(CODE_DIR + "/")) {
            return normalized.substring((CODE_DIR + "/").length());
        }
        return normalized;
    }

    private Path projectRootForPath(Path path) {
        Path root = codeRoot();
        Path relative = root.relativize(path.toAbsolutePath().normalize());
        if (relative.getNameCount() == 0) {
            throw new BusinessException(400, "Invalid project file path");
        }
        Path projectRoot = root.resolve(relative.getName(0)).normalize();
        if (!Files.isDirectory(projectRoot)) {
            throw new BusinessException(404, "Project does not exist");
        }
        return projectRoot;
    }

    private Comparator<Path> fileOrder() {
        return Comparator
                .comparing((Path path) -> !Files.isDirectory(path))
                .thenComparing(path -> path.getFileName().toString().toLowerCase());
    }

    private DevFile toDevFile(Path path, Long parentId, Long projectId, Path projectRoot) {
        Path normalized = path.toAbsolutePath().normalize();
        String relative = artifactRelative(normalized);
        boolean directory = Files.isDirectory(normalized);

        DevFile file = new DevFile();
        file.setId(stableId(relative));
        file.setProjectId(projectId);
        file.setFileName(normalized.getFileName().toString());
        file.setFilePath(relative);
        file.setFileType(directory ? "directory" : fileType(normalized));
        file.setParentId(parentId);
        file.setIsDirectory(directory ? 1 : 0);

        if (directory) {
            try (Stream<Path> stream = Files.list(normalized)) {
                file.setChildren(stream.sorted(fileOrder())
                        .filter(p -> !EXCLUDED_DIRS.contains(p.getFileName().toString()))
                        .map(child -> toDevFile(child, file.getId(), projectId, projectRoot))
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

    private Long parentId(Path path, Path projectRoot) {
        Path parent = path.toAbsolutePath().normalize().getParent();
        if (parent == null || parent.equals(projectRoot) || !parent.startsWith(projectRoot)) {
            return null;
        }
        return stableId(artifactRelative(parent));
    }

    private Long stableId(String relativePath) {
        CRC32 crc32 = new CRC32();
        crc32.update(relativePath.getBytes(StandardCharsets.UTF_8));
        return 10_000L + crc32.getValue();
    }

    private String validateProjectName(String projectName) {
        if (projectName == null || projectName.isBlank()) {
            throw new BusinessException(400, "Project name is empty");
        }
        String trimmed = projectName.trim();
        if (trimmed.contains("/") || trimmed.contains("\\") || trimmed.equals(".") || trimmed.equals("..")) {
            throw new BusinessException(400, "Invalid project name");
        }
        return trimmed;
    }

    private DevFile findFileById(Long id) {
        for (DevProject project : getProjectList()) {
            DevFile found = findInTree(getFileTree(project.getId()), id);
            if (found != null) {
                return found;
            }
        }
        return null;
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
