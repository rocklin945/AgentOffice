package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.entity.ModelConfig;
import com.agentoffice.llm.LlmMessage;
import com.agentoffice.llm.LlmRequest;
import com.agentoffice.llm.LlmResponse;
import com.agentoffice.llm.LlmService;
import com.agentoffice.mapper.ModelConfigMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.CRC32;
import java.util.stream.Stream;

@Service
public class CodeReviewService {

    @Autowired
    private LlmService llmService;

    @Autowired
    private ModelConfigMapper modelConfigMapper;

    private static final String WORKSPACE_ROOT = "workspace_artifacts";
    private static final String CODE_DIR = "code";
    private static final String REVIEW_DIR = "review";
    private static final int MAX_FILE_CHARS = 12_000;
    private static final int MAX_TOTAL_CHARS = 60_000;
    private static final Pattern BACKTICK_PATH = Pattern.compile("`([^`]+)`");

    public Map<String, Object> getReports(Long projectId) {
        Path projectRoot = findProjectRoot(projectId);
        Path reviewRoot = reviewRoot(projectRoot);
        Path legacyReviewRoot = projectRoot.resolve(REVIEW_DIR).normalize();
        List<Map<String, Object>> reports = new ArrayList<>();

        if (Files.isDirectory(reviewRoot) || Files.isDirectory(legacyReviewRoot)) {
            try (Stream<Path> primaryStream = Files.isDirectory(reviewRoot) ? Files.list(reviewRoot) : Stream.empty();
                 Stream<Path> legacyStream = Files.isDirectory(legacyReviewRoot) ? Files.list(legacyReviewRoot) : Stream.empty()) {
                reports = Stream.concat(primaryStream, legacyStream)
                        .filter(Files::isRegularFile)
                        .filter(path -> isMarkdown(path.getFileName().toString()))
                        .sorted(Comparator.comparing(this::lastModified).reversed())
                        .map(path -> reportMap(projectRoot, path))
                        .toList();
            } catch (IOException e) {
                throw new BusinessException(500, "Failed to read review reports: " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reports", reports);
        result.put("latest", reports.isEmpty() ? emptyReport() : reports.get(0));
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> reviewProjectFiles(Long projectId, Map<String, Object> body) {
        Path projectRoot = findProjectRoot(projectId);
        List<String> filePaths = ((List<Object>) body.getOrDefault("filePaths", List.of())).stream()
                .map(String::valueOf)
                .filter(item -> item != null && !item.isBlank())
                .distinct()
                .toList();
        if (filePaths.isEmpty()) {
            throw new BusinessException(400, "Please select at least one file to review");
        }

        Long modelConfigId = body.get("modelConfigId") == null ? null : Long.valueOf(body.get("modelConfigId").toString());
        ModelConfig modelConfig = modelConfigId == null ? modelConfigMapper.findDefault() : modelConfigMapper.findById(modelConfigId);
        if (modelConfig == null) {
            throw new BusinessException(404, "Model config does not exist");
        }

        List<FileSnapshot> snapshots = readSnapshots(projectRoot, filePaths);
        String report = callReviewer(modelConfig, projectRoot.getFileName().toString(), snapshots);
        Path reportPath = writeReport(projectRoot, report, snapshots, modelConfig);
        return reportMap(projectRoot, reportPath);
    }

    private List<FileSnapshot> readSnapshots(Path projectRoot, List<String> filePaths) {
        List<FileSnapshot> snapshots = new ArrayList<>();
        int total = 0;
        for (String filePath : filePaths) {
            Path path = resolveProjectPath(projectRoot, filePath);
            if (!Files.isRegularFile(path) || path.startsWith(projectRoot.resolve(REVIEW_DIR).normalize())) {
                continue;
            }
            try {
                String content = Files.readString(path, StandardCharsets.UTF_8);
                if (content.length() > MAX_FILE_CHARS) {
                    content = content.substring(0, MAX_FILE_CHARS) + "\n\n[File truncated for review input]";
                }
                total += content.length();
                if (total > MAX_TOTAL_CHARS) {
                    throw new BusinessException(400, "Selected files are too large for one review. Please select fewer files.");
                }
                snapshots.add(new FileSnapshot(artifactRelative(path), content));
            } catch (IOException e) {
                throw new BusinessException(500, "Failed to read file for review: " + filePath);
            }
        }
        if (snapshots.isEmpty()) {
            throw new BusinessException(400, "No readable code files selected");
        }
        return snapshots;
    }

    private String callReviewer(ModelConfig modelConfig, String projectName, List<FileSnapshot> snapshots) {
        StringBuilder user = new StringBuilder();
        user.append("Project: ").append(projectName).append("\n\n");
        user.append("Review these files and produce a Markdown code review report. ");
        user.append("Include an executive summary, risk level, findings with file paths, suggestions, and a final verdict.\n\n");
        for (FileSnapshot snapshot : snapshots) {
            user.append("## File: ").append(snapshot.path()).append("\n");
            user.append("```").append(languageFor(snapshot.path())).append("\n");
            user.append(snapshot.content()).append("\n");
            user.append("```\n\n");
        }

        LlmResponse response = llmService.chatCompletion(LlmRequest.builder()
                .model(modelConfig.getModelName())
                .apiBase(modelConfig.getApiBase())
                .apiKey(modelConfig.getApiKey())
                .messages(List.of(
                        LlmMessage.builder()
                                .role("system")
                                .content("You are a senior code reviewer. Be specific, practical, and concise. Write the report in Chinese. Do not invent files that were not provided.")
                                .build(),
                        LlmMessage.builder()
                                .role("user")
                                .content(user.toString())
                                .build()
                ))
                .temperature(0.2)
                .maxTokens(4096)
                .build());
        return cleanLlmReply(response.getContent());
    }

    private Path writeReport(Path projectRoot, String content, List<FileSnapshot> snapshots, ModelConfig modelConfig) {
        Path reviewRoot = reviewRoot(projectRoot);
        try {
            Files.createDirectories(reviewRoot);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            Path reportPath = reviewRoot.resolve("code-review-" + timestamp + ".md");
            String report = "# Code Review Report\n\n"
                    + "- Project: `" + projectRoot.getFileName() + "`\n"
                    + "- Model: `" + modelConfig.getConfigName() + " / " + modelConfig.getModelName() + "`\n"
                    + "- Reviewed At: `" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "`\n\n"
                    + "## Reviewed Files\n\n"
                    + snapshots.stream().map(snapshot -> "- `" + snapshot.path() + "`").reduce("", (a, b) -> a + b + "\n")
                    + "\n## AI Review\n\n"
                    + content.trim()
                    + "\n";
            Files.writeString(reportPath, report, StandardCharsets.UTF_8);
            return reportPath;
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to write review report: " + e.getMessage());
        }
    }

    private Map<String, Object> reportMap(Path projectRoot, Path reportPath) {
        String content = "";
        try {
            content = Files.readString(reportPath, StandardCharsets.UTF_8);
        } catch (IOException ignored) {
        }

        Map<String, Object> item = new HashMap<>();
        item.put("found", true);
        item.put("title", reportPath.getFileName().toString());
        item.put("content", content);
        item.put("filePath", artifactRelative(reportPath));
        item.put("reviewedAt", lastModified(reportPath).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        item.put("verdict", verdict(content));
        item.put("reviewedFiles", reviewedFiles(content, projectRoot));
        return item;
    }

    private Map<String, Object> emptyReport() {
        Map<String, Object> item = new HashMap<>();
        item.put("found", false);
        item.put("title", "暂无 Review 报告");
        item.put("content", "当前项目的 review 文件夹下还没有报告。");
        item.put("filePath", "");
        item.put("reviewedAt", "-");
        item.put("verdict", "未开始");
        item.put("reviewedFiles", List.of());
        return item;
    }

    private List<String> reviewedFiles(String content, Path projectRoot) {
        List<String> files = new ArrayList<>();
        Matcher matcher = BACKTICK_PATH.matcher(content == null ? "" : content);
        while (matcher.find()) {
            String path = matcher.group(1);
            if (!looksLikeReviewedFilePath(path, projectRoot)) {
                continue;
            }
            try {
                Path resolved = resolveProjectPath(projectRoot, path);
                if (Files.isRegularFile(resolved) && !resolved.startsWith(projectRoot.resolve(REVIEW_DIR).normalize())) {
                    String relative = artifactRelative(resolved);
                    if (!files.contains(relative)) {
                        files.add(relative);
                    }
                }
            } catch (RuntimeException ignored) {
            }
        }
        return files;
    }

    private boolean looksLikeReviewedFilePath(String path, Path projectRoot) {
        if (path == null || path.isBlank() || path.contains("\n") || path.contains("\r")) {
            return false;
        }
        String normalized = path.replace("\\", "/").trim();
        String projectName = projectRoot.getFileName().toString();
        return normalized.startsWith(CODE_DIR + "/" + projectName + "/")
                || normalized.startsWith(projectName + "/");
    }

    private Path findProjectRoot(Long projectId) {
        return listProjectRoots().stream()
                .filter(path -> stableId(artifactRelative(path)).equals(projectId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(404, "Project does not exist"));
    }

    private List<Path> listProjectRoots() {
        Path root = ensureCodeRoot();
        try (Stream<Path> stream = Files.list(root)) {
            return stream.filter(Files::isDirectory)
                    .sorted(Comparator.comparing(path -> path.getFileName().toString().toLowerCase()))
                    .toList();
        } catch (IOException e) {
            throw new BusinessException(500, "Failed to read code directory: " + e.getMessage());
        }
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
        return workspaceRoot().resolve(CODE_DIR).normalize();
    }

    private Path workspaceRoot() {
        return Paths.get(System.getProperty("user.dir"), WORKSPACE_ROOT).toAbsolutePath().normalize();
    }

    private Path reviewRoot(Path projectRoot) {
        return workspaceRoot().resolve(REVIEW_DIR).resolve(projectRoot.getFileName().toString()).normalize();
    }

    private Path resolveProjectPath(Path projectRoot, String filePath) {
        String normalized = filePath.replace("\\", "/").trim();
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith(WORKSPACE_ROOT + "/")) {
            normalized = normalized.substring((WORKSPACE_ROOT + "/").length());
        }
        if (normalized.startsWith(CODE_DIR + "/")) {
            normalized = normalized.substring((CODE_DIR + "/").length());
        }
        String projectName = projectRoot.getFileName().toString();
        if (normalized.equals(projectName)) {
            normalized = "";
        } else if (normalized.startsWith(projectName + "/")) {
            normalized = normalized.substring((projectName + "/").length());
        }

        Path resolved = projectRoot.resolve(normalized).normalize();
        if (!resolved.startsWith(projectRoot) || resolved.equals(projectRoot)) {
            throw new BusinessException(400, "Invalid project file path");
        }
        return resolved;
    }

    private String artifactRelative(Path path) {
        Path normalized = path.toAbsolutePath().normalize();
        Path root = workspaceRoot();
        if (normalized.startsWith(root)) {
            return root.relativize(normalized).toString().replace("\\", "/");
        }
        return normalized.toString().replace("\\", "/");
    }

    private Long stableId(String relativePath) {
        CRC32 crc32 = new CRC32();
        crc32.update(relativePath.getBytes(StandardCharsets.UTF_8));
        return 10_000L + crc32.getValue();
    }

    private LocalDateTime lastModified(Path path) {
        try {
            return LocalDateTime.ofInstant(Files.getLastModifiedTime(path).toInstant(), java.time.ZoneId.systemDefault());
        } catch (IOException e) {
            return LocalDateTime.MIN;
        }
    }

    private boolean isMarkdown(String fileName) {
        String lower = fileName.toLowerCase();
        return lower.endsWith(".md") || lower.endsWith(".markdown");
    }

    private String verdict(String content) {
        String lower = content == null ? "" : content.toLowerCase();
        if (lower.contains("block") || content.contains("阻塞")) return "阻塞";
        if (lower.contains("pass") || content.contains("通过")) return "通过";
        return "需修改";
    }

    private String languageFor(String path) {
        int index = path.lastIndexOf('.');
        if (index < 0 || index == path.length() - 1) {
            return "";
        }
        return path.substring(index + 1);
    }

    private String cleanLlmReply(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    private record FileSnapshot(String path, String content) {
    }
}
