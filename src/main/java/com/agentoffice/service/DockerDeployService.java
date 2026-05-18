package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.dto.DeployRequest;
import com.agentoffice.dto.DockerProjectResponse;
import com.agentoffice.dto.DockerStatusResponse;
import com.agentoffice.entity.DeployService;
import com.agentoffice.mapper.DeployServiceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Service
public class DockerDeployService {
    private static final String MANAGED_LABEL = "agentoffice.managed=true";
    private static final Duration QUICK_TIMEOUT = Duration.ofSeconds(15);
    private static final Duration BUILD_TIMEOUT = Duration.ofMinutes(8);
    private static final Duration RUN_TIMEOUT = Duration.ofSeconds(45);

    private final Path workspaceRoot = Path.of(System.getProperty("user.dir"));
    private final Path codeRoot = workspaceRoot.resolve("workspace_artifacts").resolve("code").normalize();
    private final Path deployRoot = workspaceRoot.resolve("workspace_artifacts").resolve("deploy").normalize();

    @Autowired
    private DeployServiceMapper deployServiceMapper;

    public DockerStatusResponse getDockerStatus() {
        CommandResult result = runDocker(false, QUICK_TIMEOUT, "version", "--format", "{{.Server.Version}}");
        if (result.exitCode() == 0) {
            return new DockerStatusResponse(true, result.output().trim(), "Docker is ready");
        }
        return new DockerStatusResponse(false, "", trimOutput(result.output(), 500));
    }

    public List<DockerProjectResponse> listProjects() {
        ensureCodeRoot();
        try (Stream<Path> paths = Files.list(codeRoot)) {
            return paths
                    .filter(Files::isDirectory)
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .map(this::buildProjectResponse)
                    .peek(this::syncProjectRecord)
                    .toList();
        } catch (IOException e) {
            throw BusinessException.serverError("Failed to list code projects: " + e.getMessage());
        }
    }

    public DockerProjectResponse getProject(String projectName) {
        DockerProjectResponse response = buildProjectResponse(resolveProject(projectName));
        syncProjectRecord(response);
        return response;
    }

    @Transactional
    public void syncProjectsToDatabase() {
        listProjects();
    }

    public DockerProjectResponse deploy(String projectName, DeployRequest request) {
        Path projectPath = resolveProject(projectName);
        AppPlan plan = detectApp(projectPath);
        if (!plan.deployable()) {
            throw BusinessException.badRequest("Project is not deployable: " + plan.message());
        }

        int internalPort = firstPositive(request == null ? null : request.getInternalPort(), plan.internalPort());
        int hostPort = firstPositive(request == null ? null : request.getPort(), findAvailablePort());
        String containerName = containerName(projectName);
        String imageName = imageName(projectName);

        Path projectDeployDir = deployRoot.resolve(projectName).normalize();
        ensureInside(deployRoot, projectDeployDir);
        try {
            Files.createDirectories(projectDeployDir);
            Path dockerfile = prepareDockerfile(projectPath, projectDeployDir, plan);
            CommandResult build = runDocker(true, BUILD_TIMEOUT, "build", "-t", imageName, "-f",
                    dockerfile.toString(), projectPath.toString());
            Files.writeString(projectDeployDir.resolve("last-build.log"), build.output(), StandardCharsets.UTF_8);
            if (build.exitCode() != 0) {
                throw BusinessException.serverError("Docker build failed:\n" + trimOutput(build.output(), 4000));
            }

            removeContainerIfExists(containerName);
            CommandResult run = runDocker(true, RUN_TIMEOUT, "run", "-d",
                    "--name", containerName,
                    "--label", MANAGED_LABEL,
                    "--label", "agentoffice.project=" + projectName,
                    "-p", hostPort + ":" + internalPort,
                    imageName);
            if (run.exitCode() != 0) {
                throw BusinessException.serverError("Docker run failed:\n" + trimOutput(run.output(), 4000));
            }
        } catch (IOException e) {
            throw BusinessException.serverError("Failed to prepare deployment: " + e.getMessage());
        }

        DockerProjectResponse response = buildProjectResponse(projectPath);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse start(String projectName) {
        String containerName = containerName(projectName);
        CommandResult result = runDocker(true, RUN_TIMEOUT, "start", containerName);
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker start failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse stop(String projectName) {
        String containerName = containerName(projectName);
        CommandResult result = runDocker(true, RUN_TIMEOUT, "stop", containerName);
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker stop failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse restart(String projectName) {
        String containerName = containerName(projectName);
        CommandResult result = runDocker(true, RUN_TIMEOUT, "restart", containerName);
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker restart failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public void remove(String projectName) {
        removeContainerIfExists(containerName(projectName));
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
    }

    public String getLogs(String projectName, Integer lines) {
        Path projectPath = resolveProject(projectName);
        String containerName = containerName(projectPath.getFileName().toString());
        int lineCount = Math.max(20, Math.min(Optional.ofNullable(lines).orElse(200), 1000));
        StringBuilder logs = new StringBuilder();

        Path buildLog = deployRoot.resolve(projectName).resolve("last-build.log").normalize();
        if (buildLog.startsWith(deployRoot) && Files.exists(buildLog)) {
            logs.append("===== docker build =====\n");
            try {
                logs.append(tail(Files.readString(buildLog, StandardCharsets.UTF_8), lineCount));
            } catch (IOException ignored) {
                logs.append("Failed to read build log\n");
            }
            logs.append("\n");
        }

        if (containerExists(containerName)) {
            logs.append("===== docker logs =====\n");
            CommandResult result = runDocker(false, QUICK_TIMEOUT, "logs", "--tail", String.valueOf(lineCount), containerName);
            logs.append(result.output());
        } else if (logs.length() == 0) {
            logs.append("No deployment logs yet.");
        }
        return logs.toString();
    }

    private DockerProjectResponse buildProjectResponse(Path projectPath) {
        String projectName = projectPath.getFileName().toString();
        AppPlan plan = detectApp(projectPath);
        ContainerInfo container = inspectContainer(containerName(projectName));

        DockerProjectResponse response = new DockerProjectResponse();
        response.setProjectName(projectName);
        response.setDisplayName(toDisplayName(projectName));
        response.setAppType(plan.appType());
        response.setStatus(container.status() == null ? "NOT_DEPLOYED" : container.status().toUpperCase(Locale.ROOT));
        response.setPath(projectPath.toString());
        response.setImageName(imageName(projectName));
        response.setContainerName(containerName(projectName));
        response.setContainerId(container.containerId());
        response.setPort(container.port());
        response.setInternalPort(plan.internalPort());
        response.setUrl(container.port() == null ? "" : "http://localhost:" + container.port());
        response.setDeployable(plan.deployable());
        response.setMessage(plan.message());
        return response;
    }

    private void syncProjectRecord(DockerProjectResponse project) {
        if (project == null || project.getImageName() == null) {
            return;
        }
        DeployService service = deployServiceMapper.findByImage(project.getImageName());
        if (service == null) {
            service = new DeployService();
            service.setServiceName(project.getDisplayName());
            service.setImage(project.getImageName());
            service.setVersion("latest");
            service.setStatus(toServiceStatus(project.getStatus()));
            service.setPort(project.getPort());
            deployServiceMapper.insert(service);
        } else {
            service.setServiceName(project.getDisplayName());
            service.setImage(project.getImageName());
            service.setVersion("latest");
            service.setStatus(toServiceStatus(project.getStatus()));
            service.setPort(project.getPort());
            deployServiceMapper.update(service);
        }
        deployServiceMapper.updateContainerId(service.getId(), shortContainerId(project.getContainerId()));
        deployServiceMapper.updateMetrics(
                service.getId(),
                project.getStatus() != null && project.getStatus().equals("RUNNING") ? new BigDecimal("0.00") : BigDecimal.ZERO,
                project.getStatus() != null && project.getStatus().equals("RUNNING") ? new BigDecimal("0.00") : BigDecimal.ZERO,
                project.getStatus() != null && project.getStatus().equals("RUNNING") ? 1L : 0L
        );
    }

    private String toServiceStatus(String dockerStatus) {
        if (dockerStatus == null) {
            return "未部署";
        }
        return switch (dockerStatus) {
            case "RUNNING" -> "运行中";
            case "EXITED", "CREATED", "PAUSED", "RESTARTING" -> "已停止";
            case "NOT_DEPLOYED" -> "未部署";
            default -> "异常";
        };
    }

    private String shortContainerId(String containerId) {
        if (containerId == null || containerId.isBlank()) {
            return "";
        }
        return containerId.length() > 12 ? containerId.substring(0, 12) : containerId;
    }

    private AppPlan detectApp(Path projectPath) {
        if (Files.exists(projectPath.resolve("Dockerfile"))) {
            return new AppPlan("CUSTOM_DOCKERFILE", true, 80, "Use project Dockerfile");
        }
        if (Files.exists(projectPath.resolve("frontend").resolve("package.json"))) {
            return new AppPlan("NODE_FRONTEND", true, 80, "Build frontend with npm and serve dist with nginx");
        }
        if (Files.exists(projectPath.resolve("frontend").resolve("index.html"))) {
            return new AppPlan("STATIC_FRONTEND", true, 80, "Serve frontend directory with nginx");
        }
        if (Files.exists(projectPath.resolve("package.json"))) {
            return new AppPlan("NODE_APP", true, 3000, "Run root Node project with npm start");
        }
        if (Files.exists(projectPath.resolve("index.html"))) {
            return new AppPlan("STATIC_SITE", true, 80, "Serve project root with nginx");
        }
        if (Files.exists(projectPath.resolve("backend").resolve("package.json"))) {
            return new AppPlan("NODE_BACKEND", true, 3000, "Run backend Node project with npm start");
        }
        return new AppPlan("UNKNOWN", false, 80, "No Dockerfile, package.json, or index.html found");
    }

    private Path prepareDockerfile(Path projectPath, Path projectDeployDir, AppPlan plan) throws IOException {
        if ("CUSTOM_DOCKERFILE".equals(plan.appType())) {
            return projectPath.resolve("Dockerfile");
        }

        String dockerfile = switch (plan.appType()) {
            case "NODE_FRONTEND" -> """
                    FROM node:22-alpine AS build
                    WORKDIR /app
                    COPY frontend/package*.json ./
                    RUN npm ci || npm install
                    COPY frontend/ ./
                    RUN npm run build

                    FROM nginx:1.27-alpine
                    COPY --from=build /app/dist/ /usr/share/nginx/html/
                    EXPOSE 80
                    """;
            case "STATIC_FRONTEND" -> """
                    FROM nginx:1.27-alpine
                    COPY frontend/ /usr/share/nginx/html/
                    EXPOSE 80
                    """;
            case "NODE_APP" -> """
                    FROM node:22-alpine
                    WORKDIR /app
                    COPY package*.json ./
                    RUN npm ci --omit=dev || npm install --omit=dev
                    COPY . ./
                    ENV PORT=3000
                    EXPOSE 3000
                    CMD ["npm", "start"]
                    """;
            case "STATIC_SITE" -> """
                    FROM nginx:1.27-alpine
                    COPY . /usr/share/nginx/html/
                    EXPOSE 80
                    """;
            case "NODE_BACKEND" -> """
                    FROM node:22-alpine
                    WORKDIR /app
                    COPY backend/package*.json ./
                    RUN npm ci --omit=dev || npm install --omit=dev
                    COPY backend/ ./
                    ENV PORT=3000
                    EXPOSE 3000
                    CMD ["npm", "start"]
                    """;
            default -> throw BusinessException.badRequest("Unsupported app type: " + plan.appType());
        };

        Path dockerfilePath = projectDeployDir.resolve("Dockerfile");
        Files.writeString(dockerfilePath, dockerfile, StandardCharsets.UTF_8);
        return dockerfilePath;
    }

    private ContainerInfo inspectContainer(String containerName) {
        CommandResult inspect = runDocker(false, QUICK_TIMEOUT, "inspect", "--format",
                "{{.Id}}\t{{.State.Status}}\t{{.Config.Image}}", containerName);
        if (inspect.exitCode() != 0) {
            return new ContainerInfo(null, null, null, null);
        }
        String[] parts = inspect.output().trim().split("\t");
        String id = parts.length > 0 ? parts[0] : null;
        String status = parts.length > 1 ? parts[1] : null;
        String image = parts.length > 2 ? parts[2] : null;
        Integer port = inspectPort(containerName);
        return new ContainerInfo(id, status, image, port);
    }

    private Integer inspectPort(String containerName) {
        CommandResult result = runDocker(false, QUICK_TIMEOUT, "port", containerName);
        if (result.exitCode() != 0) {
            return null;
        }
        for (String line : result.output().split("\\R")) {
            int index = line.lastIndexOf(':');
            if (index >= 0 && index + 1 < line.length()) {
                try {
                    return Integer.parseInt(line.substring(index + 1).trim());
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private void removeContainerIfExists(String containerName) {
        if (!containerExists(containerName)) {
            return;
        }
        CommandResult result = runDocker(true, RUN_TIMEOUT, "rm", "-f", containerName);
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker remove failed:\n" + trimOutput(result.output(), 3000));
        }
    }

    private boolean containerExists(String containerName) {
        return runDocker(false, QUICK_TIMEOUT, "inspect", containerName).exitCode() == 0;
    }

    private Path resolveProject(String projectName) {
        ensureCodeRoot();
        if (projectName == null || projectName.isBlank()) {
            throw BusinessException.badRequest("Project name is required");
        }
        Path projectPath = codeRoot.resolve(projectName).normalize();
        ensureInside(codeRoot, projectPath);
        if (!Files.isDirectory(projectPath)) {
            throw BusinessException.notFound("Project not found: " + projectName);
        }
        return projectPath;
    }

    private void ensureCodeRoot() {
        if (!Files.isDirectory(codeRoot)) {
            throw BusinessException.notFound("Code directory not found: " + codeRoot);
        }
    }

    private void ensureInside(Path root, Path child) {
        if (!child.normalize().startsWith(root.normalize())) {
            throw BusinessException.badRequest("Invalid path");
        }
    }

    private CommandResult runDocker(boolean requireAvailable, Duration timeout, String... args) {
        List<String> command = new ArrayList<>();
        command.add("docker");
        command.addAll(List.of(args));
        CommandResult result = runCommand(command, timeout);
        if (requireAvailable && result.exitCode() != 0 && result.output().toLowerCase(Locale.ROOT).contains("not recognized")) {
            throw BusinessException.serverError("Docker CLI is not available");
        }
        return result;
    }

    private CommandResult runCommand(List<String> command, Duration timeout) {
        Path outputFile = null;
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        try {
            outputFile = Files.createTempFile("agentoffice-docker-", ".log");
            builder.redirectOutput(outputFile.toFile());
            Process process = builder.start();
            boolean completed = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
            String output = Files.readString(outputFile, StandardCharsets.UTF_8);
            if (!completed) {
                process.destroyForcibly();
                return new CommandResult(124, output + "\nCommand timed out.");
            }
            return new CommandResult(process.exitValue(), output);
        } catch (IOException e) {
            return new CommandResult(127, e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new CommandResult(130, "Command interrupted");
        } finally {
            if (outputFile != null) {
                try {
                    Files.deleteIfExists(outputFile);
                } catch (IOException ignored) {
                }
            }
        }
    }

    private int findAvailablePort() {
        try (ServerSocket socket = new ServerSocket(0)) {
            return socket.getLocalPort();
        } catch (IOException e) {
            return 18080;
        }
    }

    private int firstPositive(Integer first, Integer fallback) {
        if (first != null && first > 0) {
            return first;
        }
        return fallback;
    }

    private String imageName(String projectName) {
        return "agentoffice/" + slug(projectName) + ":latest";
    }

    private String containerName(String projectName) {
        return "agentoffice-" + slug(projectName);
    }

    private String slug(String value) {
        String slug = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_.-]+", "-");
        slug = slug.replaceAll("^-+", "").replaceAll("-+$", "");
        return slug.isBlank() ? "app" : slug;
    }

    private String toDisplayName(String projectName) {
        String[] parts = projectName.split("[-_]+");
        List<String> words = new ArrayList<>();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            words.add(part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1));
        }
        return words.isEmpty() ? projectName : String.join(" ", words);
    }

    private String trimOutput(String output, int maxLength) {
        if (output == null) {
            return "";
        }
        if (output.length() <= maxLength) {
            return output;
        }
        return output.substring(output.length() - maxLength);
    }

    private String tail(String text, int lines) {
        String[] all = text.split("\\R");
        int start = Math.max(0, all.length - lines);
        return String.join("\n", List.of(all).subList(start, all.length));
    }

    private record AppPlan(String appType, boolean deployable, Integer internalPort, String message) {
    }

    private record ContainerInfo(String containerId, String status, String image, Integer port) {
    }

    private record CommandResult(int exitCode, String output) {
    }
}
