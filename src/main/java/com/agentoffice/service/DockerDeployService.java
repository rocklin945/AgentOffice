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
import java.net.URI;
import java.net.ServerSocket;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Service
public class DockerDeployService {
    private static final String MANAGED_LABEL = "agentoffice.managed=true";
    private static final String SHARED_NETWORK = "agentoffice-net";
    private static final String SHARED_MYSQL_CONTAINER = "agentoffice-mysql";
    private static final int SHARED_MYSQL_HOST_PORT = 13306;
    private static final String MYSQL_ROOT_PASSWORD = "root_password";
    private static final String MYSQL_APP_USER = "app_user";
    private static final String MYSQL_APP_PASSWORD = "app_password";
    private static final Duration QUICK_TIMEOUT = Duration.ofSeconds(15);
    private static final Duration BUILD_TIMEOUT = Duration.ofMinutes(8);
    private static final Duration RUN_TIMEOUT = Duration.ofSeconds(45);

    private final Path workspaceRoot = Path.of(System.getProperty("user.dir"));
    private final Path codeRoot = workspaceRoot.resolve("workspace_artifacts").resolve("code").normalize();
    private final Path deployRoot = workspaceRoot.resolve("workspace_artifacts").resolve("deploy").normalize();

    @Autowired
    private DeployServiceMapper deployServiceMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

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

        int hostPort = firstPositive(request == null ? null : request.getPort(), findAvailablePort());
        Path projectDeployDir = deployRoot.resolve(projectName).normalize();
        ensureInside(deployRoot, projectDeployDir);
        try {
            Files.createDirectories(projectDeployDir);
            if (plan.compose()) {
                int backendHostPort = firstPositive(request == null ? null : request.getBackendPort(), findAvailablePort());
                Path composeFile = prepareComposeFiles(projectName, projectPath, projectDeployDir, plan, hostPort, backendHostPort);
                // 先强制删除可能存在的同名容器,避免名称冲突
                removeContainerIfExists(frontendContainerName(projectName));
                removeContainerIfExists(backendContainerName(projectName));
                // 再执行 compose down 清理应用容器和网络，数据库使用独立共享容器，不随项目删除
                runDocker(false, RUN_TIMEOUT, "compose", "-p", composeProjectName(projectName),
                        "-f", composeFile.toString(), "down", "--remove-orphans");
                CommandResult up = runDocker(true, BUILD_TIMEOUT, "compose", "-p", composeProjectName(projectName),
                        "-f", composeFile.toString(), "up", "-d", "--build");
                Files.writeString(projectDeployDir.resolve("last-build.log"), up.output(), StandardCharsets.UTF_8);
                if (up.exitCode() != 0) {
                    throw BusinessException.serverError("Docker compose deploy failed:\n" + trimOutput(up.output(), 4000));
                }
            } else {
                int internalPort = firstPositive(request == null ? null : request.getInternalPort(), plan.internalPort());
                String containerName = containerName(projectName);
                String imageName = imageName(projectName);
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
            }
        } catch (IOException e) {
            throw BusinessException.serverError("Failed to prepare deployment: " + e.getMessage());
        }

        DockerProjectResponse response = buildProjectResponse(projectPath);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse start(String projectName) {
        AppPlan plan = detectApp(resolveProject(projectName));
        CommandResult result = plan.compose()
                ? runDocker(true, RUN_TIMEOUT, "compose", "-p", composeProjectName(projectName), "-f", composeFile(projectName).toString(), "start")
                : runDocker(true, RUN_TIMEOUT, "start", containerName(projectName));
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker start failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse stop(String projectName) {
        AppPlan plan = detectApp(resolveProject(projectName));
        CommandResult result = plan.compose()
                ? runDocker(true, RUN_TIMEOUT, "compose", "-p", composeProjectName(projectName), "-f", composeFile(projectName).toString(), "stop")
                : runDocker(true, RUN_TIMEOUT, "stop", containerName(projectName));
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker stop failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public DockerProjectResponse restart(String projectName) {
        AppPlan plan = detectApp(resolveProject(projectName));
        CommandResult result = plan.compose()
                ? runDocker(true, RUN_TIMEOUT, "compose", "-p", composeProjectName(projectName), "-f", composeFile(projectName).toString(), "restart")
                : runDocker(true, RUN_TIMEOUT, "restart", containerName(projectName));
        if (result.exitCode() != 0) {
            throw BusinessException.serverError("Docker restart failed:\n" + trimOutput(result.output(), 3000));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
        return response;
    }

    public void remove(String projectName) {
        AppPlan plan = detectApp(resolveProject(projectName));
        if (plan.compose() && Files.exists(composeFile(projectName))) {
            CommandResult result = runDocker(true, RUN_TIMEOUT, "compose", "-p", composeProjectName(projectName),
                    "-f", composeFile(projectName).toString(), "down", "--remove-orphans");
            if (result.exitCode() != 0) {
                throw BusinessException.serverError("Docker compose down failed:\n" + trimOutput(result.output(), 3000));
            }
        } else {
            removeContainerIfExists(containerName(projectName));
        }
        DockerProjectResponse response = getProject(projectName);
        syncProjectRecord(response);
    }

    public String getLogs(String projectName, Integer lines) {
        Path projectPath = resolveProject(projectName);
        AppPlan plan = detectApp(projectPath);
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

        if (plan.compose() && Files.exists(composeFile(projectName))) {
            logs.append("===== docker compose logs =====\n");
            CommandResult result = runDocker(false, QUICK_TIMEOUT, "compose", "-p", composeProjectName(projectName),
                    "-f", composeFile(projectName).toString(), "logs", "--tail", String.valueOf(lineCount));
            logs.append(result.output());
        } else if (containerExists(containerName)) {
            logs.append("===== docker logs =====\n");
            CommandResult result = runDocker(false, QUICK_TIMEOUT, "logs", "--tail", String.valueOf(lineCount), containerName);
            logs.append(result.output());
        } else if (logs.length() == 0) {
            logs.append("No deployment logs yet.");
        }
        return logs.toString();
    }

    public Map<String, Object> checkBackendHealth(String projectName) {
        Path projectPath = resolveProject(projectName);
        AppPlan plan = detectApp(projectPath);
        DockerProjectResponse project = buildProjectResponse(projectPath);
        String baseUrl = project.getBackendUrl();
        if ((baseUrl == null || baseUrl.isBlank()) && plan.hasBackend()) {
            baseUrl = project.getUrl();
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            throw BusinessException.badRequest("Backend service is not deployed");
        }

        String healthUrl = baseUrl.replaceAll("/+$", "") + "/api/health";
        return checkHealthUrl(healthUrl);
    }

    public Map<String, Object> checkHealthUrl(String healthUrl) {
        if (healthUrl == null || healthUrl.isBlank()) {
            throw BusinessException.badRequest("Health check URL is required");
        }
        URI uri;
        try {
            uri = URI.create(healthUrl.trim());
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("Invalid health check URL");
        }
        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (scheme == null || host == null
                || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))
                || (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host) && !"::1".equals(host))) {
            throw BusinessException.badRequest("Only local health check URLs are allowed");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("url", uri.toString());
        try {
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            boolean healthy = response.statusCode() >= 200 && response.statusCode() < 300;
            result.put("healthy", healthy);
            result.put("statusCode", response.statusCode());
            result.put("message", healthy ? "健康检查通过" : trimOutput(response.body(), 500));
        } catch (Exception e) {
            result.put("healthy", false);
            result.put("statusCode", 0);
            result.put("message", e.getMessage() == null ? "健康检查失败" : e.getMessage());
        }
        return result;
    }

    private DockerProjectResponse buildProjectResponse(Path projectPath) {
        String projectName = projectPath.getFileName().toString();
        AppPlan plan = detectApp(projectPath);
        ContainerInfo container = inspectPrimaryContainer(projectName, plan);
        ContainerInfo backendContainer = plan.hasBackend()
                ? (plan.compose() ? inspectContainer(backendContainerName(projectName)) : container)
                : new ContainerInfo(null, null, null, null);

        DockerProjectResponse response = new DockerProjectResponse();
        response.setProjectName(projectName);
        response.setDisplayName(toDisplayName(projectName));
        response.setAppType(plan.appType());
        response.setStatus(resolveStatus(plan, container, backendContainer));
        response.setPath(projectPath.toString());
        response.setImageName(imageName(projectName));
        response.setContainerName(containerName(projectName));
        response.setContainerId(container.containerId());
        response.setPort(container.port());
        response.setBackendPort(backendContainer.port());
        response.setInternalPort(plan.internalPort());
        response.setInternalBackendPort(plan.backendPort());
        response.setUrl(container.port() == null ? "" : "http://localhost:" + container.port());
        response.setBackendUrl(backendContainer.port() == null ? "" : "http://localhost:" + backendContainer.port());
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
        boolean hasDatabase = requiresMysql(projectPath);
        if (Files.exists(projectPath.resolve("Dockerfile"))) {
            return new AppPlan("CUSTOM_DOCKERFILE", true, false, false, false, hasDatabase, 80, null, "Use project Dockerfile");
        }
        boolean hasFrontend = Files.exists(projectPath.resolve("frontend").resolve("index.html"))
                || Files.exists(projectPath.resolve("frontend").resolve("package.json"));
        boolean hasNodeBackend = Files.exists(projectPath.resolve("backend").resolve("package.json"));
        boolean hasJavaBackend = hasJavaBackend(projectPath.resolve("backend"));
        if (hasFrontend && hasNodeBackend) {
            return new AppPlan("FULL_STACK_NODE", true, true, true, true, hasDatabase, 80, 3000, "Deploy frontend and Node backend with Docker Compose");
        }
        if (hasFrontend && hasJavaBackend) {
            return new AppPlan("FULL_STACK_JAVA", true, true, true, true, hasDatabase, 80, 8080, "Deploy frontend and Java backend with Docker Compose");
        }
        if (Files.exists(projectPath.resolve("frontend").resolve("package.json"))) {
            return new AppPlan("NODE_FRONTEND", true, false, true, false, hasDatabase, 80, null, "Build frontend with npm and serve dist with nginx");
        }
        if (Files.exists(projectPath.resolve("frontend").resolve("index.html"))) {
            return new AppPlan("STATIC_FRONTEND", true, false, true, false, hasDatabase, 80, null, "Serve frontend directory with nginx");
        }
        if (Files.exists(projectPath.resolve("package.json"))) {
            return new AppPlan("NODE_APP", true, false, false, false, hasDatabase, 3000, null, "Run root Node project with npm start");
        }
        if (Files.exists(projectPath.resolve("index.html"))) {
            return new AppPlan("STATIC_SITE", true, false, true, false, hasDatabase, 80, null, "Serve project root with nginx");
        }
        if (Files.exists(projectPath.resolve("backend").resolve("package.json"))) {
            return new AppPlan("NODE_BACKEND", true, false, false, true, hasDatabase, 3000, null, "Run backend Node project with npm start");
        }
        if (hasJavaBackend(projectPath.resolve("backend"))) {
            return new AppPlan("JAVA_BACKEND", true, false, false, true, hasDatabase, 8080, null, "Run backend Java project");
        }
        return new AppPlan("UNKNOWN", false, false, false, false, hasDatabase, 80, null, "No Dockerfile, package.json, or index.html found");
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
            case "JAVA_BACKEND" -> javaBackendDockerfile(projectPath, plan.database());
            default -> throw BusinessException.badRequest("Unsupported app type: " + plan.appType());
        };

        Path dockerfilePath = projectDeployDir.resolve("Dockerfile");
        Files.writeString(dockerfilePath, dockerfile, StandardCharsets.UTF_8);
        return dockerfilePath;
    }

    private Path prepareComposeFiles(String projectName, Path projectPath, Path projectDeployDir,
                                     AppPlan plan, int frontendHostPort, int backendHostPort) throws IOException {
        String resolvedDbName = databaseName(projectName);
        if (plan.database()) {
            Path initDir = projectDeployDir.resolve("mysql-init");
            Files.createDirectories(initDir);
            Path backendDir = projectPath.resolve("backend");
            if (Files.isDirectory(backendDir)) {
                try (var entries = Files.list(backendDir)) {
                    List<Path> sqlFiles = entries
                            .filter(p -> p.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".sql"))
                            .sorted()
                            .toList();
                    for (int i = 0; i < sqlFiles.size(); i++) {
                        Path src = sqlFiles.get(i);
                        String destName = String.format("%02d-%s", i + 1, src.getFileName());
                        String detected = extractDatabaseName(src);
                        if (detected != null) resolvedDbName = detected;
                        String sqlContent = stripDatabaseStatements(
                                Files.readString(src, StandardCharsets.UTF_8));
                        Files.writeString(initDir.resolve(destName), sqlContent, StandardCharsets.UTF_8);
                    }
                }
            }
        }
        Files.writeString(projectDeployDir.resolve("Dockerfile.frontend"), frontendDockerfile(projectPath, plan), StandardCharsets.UTF_8);
        String backendDockerfile = "FULL_STACK_JAVA".equals(plan.appType())
                ? javaBackendDockerfile(projectPath, plan.database())
                : nodeBackendDockerfile();
        Files.writeString(projectDeployDir.resolve("Dockerfile.backend"), backendDockerfile, StandardCharsets.UTF_8);

        final String dbName = sanitizeDatabaseName(resolvedDbName);
        if (plan.database()) {
            ensureSharedMysql(projectDeployDir.resolve("mysql-init"), dbName, projectName);
        }
        String databaseEnvironment = plan.database() ? """
                      SPRING_DATASOURCE_URL: "jdbc:mysql://%s:3306/%s?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&connectTimeout=10000&socketTimeout=30000"
                      SPRING_DATASOURCE_USERNAME: "%s"
                      SPRING_DATASOURCE_PASSWORD: "%s"
                      MYSQL_HOST: "%s"
                      MYSQL_PORT: "3306"
                      MYSQL_DATABASE: "%s"
                      MYSQL_USER: "%s"
                      MYSQL_PASSWORD: "%s"
                """.formatted(SHARED_MYSQL_CONTAINER, dbName, MYSQL_APP_USER, MYSQL_APP_PASSWORD,
                SHARED_MYSQL_CONTAINER, dbName, MYSQL_APP_USER, MYSQL_APP_PASSWORD) : "";
        String networks = plan.database() ? """
                    networks:
                      - agentoffice-net
                """ : "";
        String networkDefinitions = plan.database() ? """
                networks:
                  agentoffice-net:
                    external: true
                    name: agentoffice-net
                """ : "";

        String compose = """
                services:
                  backend:
                    build:
                      context: "%s"
                      dockerfile: "%s"
                    image: "%s-backend"
                    container_name: "%s"
                    labels:
                      agentoffice.managed: "true"
                      agentoffice.project: "%s"
                    environment:
                      PORT: "%d"
                      SERVER_PORT: "%d"
                %s
                    ports:
                      - "%d:%d"
                %s
                  frontend:
                    build:
                      context: "%s"
                      dockerfile: "%s"
                    image: "%s-frontend"
                    container_name: "%s"
                    labels:
                      agentoffice.managed: "true"
                      agentoffice.project: "%s"
                    depends_on:
                      - backend
                    ports:
                      - "%d:80"
                %s
                %s
                """.formatted(
                escapePath(projectPath), escapePath(projectDeployDir.resolve("Dockerfile.backend")),
                imageName(projectName), backendContainerName(projectName), projectName, plan.backendPort(), plan.backendPort(), databaseEnvironment, backendHostPort, plan.backendPort(), networks,
                escapePath(projectPath), escapePath(projectDeployDir.resolve("Dockerfile.frontend")),
                imageName(projectName), frontendContainerName(projectName), projectName, frontendHostPort, networks, networkDefinitions
        );
        Path composeFile = projectDeployDir.resolve("docker-compose.yml");
        Files.writeString(composeFile, compose, StandardCharsets.UTF_8);
        return composeFile;
    }

    private String frontendDockerfile(Path projectPath, AppPlan plan) {
        int backendPort = plan.backendPort() == null ? 3000 : plan.backendPort();
        String prefix = Files.exists(projectPath.resolve("frontend").resolve("package.json"))
                ? """
                FROM node:22-alpine AS build
                WORKDIR /app
                COPY frontend/package*.json ./
                RUN npm ci || npm install
                COPY frontend/ ./
                RUN npm run build

                FROM nginx:1.27-alpine
                COPY --from=build /app/dist/ /usr/share/nginx/html/
                """
                : """
                FROM nginx:1.27-alpine
                COPY frontend/ /usr/share/nginx/html/
                """;
        return prefix + """
                RUN rm /etc/nginx/conf.d/default.conf && printf '%%s\\n' \\
                    'server {' \\
                    '    listen 80;' \\
                    '    server_name _;' \\
                    '    root /usr/share/nginx/html;' \\
                    '    index index.html;' \\
                    '    location /api/ {' \\
                    '        proxy_pass http://backend:%d/api/;' \\
                    '        proxy_set_header Host $host;' \\
                    '        proxy_set_header X-Real-IP $remote_addr;' \\
                    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \\
                    '    }' \\
                    '    location / {' \\
                    '        try_files $uri $uri/ /index.html;' \\
                    '    }' \\
                    '}' > /etc/nginx/conf.d/default.conf
                EXPOSE 80
                """.formatted(backendPort);
    }

    private String nodeBackendDockerfile() {
        return """
                FROM node:22-alpine
                WORKDIR /app
                COPY backend/package*.json ./
                RUN npm ci --omit=dev || npm install --omit=dev
                COPY backend/ ./
                ENV PORT=3000
                EXPOSE 3000
                CMD ["npm", "start"]
                """;
    }

    private String javaSourceNormalizeCommands(Path backendDir) throws IOException {
        List<String> cmds = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(backendDir, 8)) {
            paths.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".java"))
                    .filter(path -> !isInsideDirectory(backendDir, path, "target"))
                    .filter(path -> !isInsideDirectory(backendDir, path, "src/main/java"))
                    .forEach(path -> {
                        try {
                            String packageName = readJavaPackage(path);
                            String packageDir = packageName.isBlank() ? "" : packageName.replace('.', '/');
                            Path relative = backendDir.relativize(path);
                            String source = relative.toString().replace("\\", "/");
                            String targetDir = packageDir.isBlank() ? "src/main/java" : "src/main/java/" + packageDir;
                            cmds.add("mkdir -p " + targetDir + " && cp " + shellQuote(source) + " " + shellQuote(targetDir + "/" + path.getFileName()));
                        } catch (IOException ignored) {
                        }
                    });
        }
        if (cmds.isEmpty()) return "";
        return "RUN " + String.join(" && \\\n    ", cmds) + "\n";
    }

    private Optional<String> findSpringBootMainClass(Path backendDir) throws IOException {
        try (Stream<Path> paths = Files.walk(backendDir, 8)) {
            return paths.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".java"))
                    .filter(path -> !isInsideDirectory(backendDir, path, "target"))
                    .filter(this::looksLikeSpringBootMain)
                    .findFirst()
                    .map(path -> {
                        try {
                            String packageName = readJavaPackage(path);
                            String className = path.getFileName().toString().replaceFirst("\\.java$", "");
                            return packageName.isBlank() ? className : packageName + "." + className;
                        } catch (IOException e) {
                            return path.getFileName().toString().replaceFirst("\\.java$", "");
                        }
                    });
        }
    }

    private boolean looksLikeSpringBootMain(Path path) {
        try {
            String content = Files.readString(path, StandardCharsets.UTF_8);
            return content.contains("@SpringBootApplication") && content.contains("public static void main");
        } catch (IOException e) {
            return false;
        }
    }

    private boolean isInsideDirectory(Path root, Path path, String directory) {
        Path relative = root.relativize(path);
        String normalized = relative.toString().replace("\\", "/");
        return normalized.equals(directory) || normalized.startsWith(directory + "/");
    }

    private String shellQuote(String value) {
        return "'" + value.replace("'", "'\"'\"'") + "'";
    }

    private String javaBackendDockerfile(Path projectPath, boolean database) throws IOException {
        Path backendDir = projectPath.resolve("backend");
        boolean hasOwnPom = Files.exists(backendDir.resolve("pom.xml"));
        if (hasOwnPom) {
            String normalizeCommands = javaSourceNormalizeCommands(backendDir);
            String mainClass = findSpringBootMainClass(backendDir).orElse("");
            String mainClassOption = mainClass.isBlank() ? "" : "-Dstart-class=" + mainClass;
            return """
                    FROM maven:3.9-eclipse-temurin-17 AS build
                    WORKDIR /app
                    COPY backend/pom.xml ./
                    RUN mvn -q -DskipTests dependency:resolve || true
                    COPY backend/ ./
                    RUN mkdir -p src/main/resources && \\
                        if [ -f application.yml ]; then cp application.yml src/main/resources/application.yml; fi && \\
                        if [ -f resources/application.yml ]; then cp resources/application.yml src/main/resources/application.yml; fi
                    %s
                    RUN rm -rf /root/.m2/repository/commons-io/commons-io/2.6 && \\
                        (mvn -q -DskipTests %s package || mvn -q -DskipTests -U %s package)
                    FROM eclipse-temurin:17-jre
                    WORKDIR /app
                    COPY --from=build /app/target/*.jar app.jar
                    ENV SERVER_PORT=8080
                    EXPOSE 8080
                    CMD ["java", "-jar", "app.jar"]
                    """.formatted(normalizeCommands, mainClassOption, mainClassOption);
        }
        Path anyJavaFile;
        try (var walk = Files.walk(backendDir, 5)) {
            anyJavaFile = walk.filter(p -> p.getFileName().toString().endsWith(".java"))
                    .findFirst().orElse(backendDir.resolve("Main.java"));
        }
        String packageName = readJavaPackage(anyJavaFile);
        String packagePath = packageName.replace('.', '/');
        String databaseDependencies = database
                ? "<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-jdbc</artifactId></dependency><dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>"
                : "";
        List<String> copySteps = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(projectPath.resolve("backend"))) {
            paths.filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".java"))
                    .forEach(path -> {
                        Path relative = projectPath.resolve("backend").relativize(path);
                        String parent = relative.getParent() == null ? "" : "/" + relative.getParent().toString().replace("\\", "/");
                        copySteps.add("mkdir -p src/main/java/" + packagePath + parent
                                + " && cp /tmp/backend/" + relative.toString().replace("\\", "/")
                                + " src/main/java/" + packagePath + parent + "/");
                    });
        }
        String copyCommands = copySteps.isEmpty() ? "" : "RUN " + String.join(" && \\\n    ", copySteps) + "\n";
        String pomStep = "RUN printf '%%s\\n' '<project xmlns=\"http://maven.apache.org/POM/4.0.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd\">' '<modelVersion>4.0.0</modelVersion>' '<parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.2.0</version><relativePath/></parent>' '<groupId>agentoffice.generated</groupId><artifactId>generated-backend</artifactId><version>1.0.0</version>' '<properties><java.version>17</java.version></properties>' '<dependencies><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>" + databaseDependencies + "</dependencies>' '<build><plugins><plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build>' '</project>' > pom.xml";
        return """
                FROM maven:3.9-eclipse-temurin-17 AS build
                WORKDIR /app
                %s
                RUN mvn -q -DskipTests dependency:resolve || true
                COPY backend/ /tmp/backend/
                RUN mkdir -p src/main/resources && \\
                    if [ -f /tmp/backend/application.yml ]; then cp /tmp/backend/application.yml src/main/resources/application.yml; fi
                %s
                RUN rm -rf /root/.m2/repository/commons-io/commons-io/2.6 && \\
                    (mvn -q -DskipTests package || mvn -q -DskipTests -U package)
                FROM eclipse-temurin:17-jre
                WORKDIR /app
                COPY --from=build /app/target/*.jar app.jar
                ENV SERVER_PORT=8080
                EXPOSE 8080
                CMD ["java", "-jar", "app.jar"]
                """.formatted(pomStep, copyCommands);
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

    private ContainerInfo inspectPrimaryContainer(String projectName, AppPlan plan) {
        if (plan.compose()) {
            ContainerInfo frontend = inspectContainer(frontendContainerName(projectName));
            if (frontend.containerId() != null) {
                return frontend;
            }
            return inspectContainer(backendContainerName(projectName));
        }
        return inspectContainer(containerName(projectName));
    }

    private String resolveStatus(AppPlan plan, ContainerInfo primary, ContainerInfo backend) {
        if (primary.status() == null) {
            return "NOT_DEPLOYED";
        }
        if (plan.compose() && backend.status() != null && (!"running".equals(primary.status()) || !"running".equals(backend.status()))) {
            return "EXITED";
        }
        return primary.status().toUpperCase(Locale.ROOT);
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

    private static final Set<Integer> RESERVED_PORTS = Set.of(
            80, 443, 3000, 3001, 3306, 5432, 5672, 6379, 8080, 8443, 8888, 9090, 9200, 27017
    );

    private int findAvailablePort() {
        for (int attempt = 0; attempt < 20; attempt++) {
            try (ServerSocket socket = new ServerSocket(0)) {
                int port = socket.getLocalPort();
                if (!RESERVED_PORTS.contains(port)) {
                    return port;
                }
            } catch (IOException ignored) {
            }
        }
        return 18080;
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

    private String frontendContainerName(String projectName) {
        return containerName(projectName) + "-frontend";
    }

    private String backendContainerName(String projectName) {
        return containerName(projectName) + "-backend";
    }

    private String mysqlContainerName(String projectName) {
        return containerName(projectName) + "-mysql";
    }

    private String composeProjectName(String projectName) {
        return "agentoffice-" + slug(projectName);
    }

    private String databaseName(String projectName) {
        return slug(projectName).replace('-', '_') + "_db";
    }

    private String sanitizeDatabaseName(String databaseName) {
        String sanitized = Optional.ofNullable(databaseName).orElse("app_db")
                .replaceAll("[^A-Za-z0-9_]", "_");
        return sanitized.isBlank() ? "app_db" : sanitized;
    }

    private void ensureSharedMysql(Path initDir, String dbName, String projectName) {
        CommandResult networkInspect = runDocker(false, QUICK_TIMEOUT, "network", "inspect", SHARED_NETWORK);
        if (networkInspect.exitCode() != 0) {
            CommandResult networkCreate = runDocker(true, RUN_TIMEOUT, "network", "create", SHARED_NETWORK);
            if (networkCreate.exitCode() != 0) {
                throw BusinessException.serverError("Docker network create failed:\n" + trimOutput(networkCreate.output(), 3000));
            }
        }

        if (!containerExists(SHARED_MYSQL_CONTAINER)) {
            CommandResult run = runDocker(true, BUILD_TIMEOUT, "run", "-d",
                    "--name", SHARED_MYSQL_CONTAINER,
                    "--network", SHARED_NETWORK,
                    "--label", MANAGED_LABEL,
                    "--label", "agentoffice.infrastructure=mysql",
                    "-p", SHARED_MYSQL_HOST_PORT + ":3306",
                    "-e", "MYSQL_ROOT_PASSWORD=" + MYSQL_ROOT_PASSWORD,
                    "-e", "MYSQL_DATABASE=" + dbName,
                    "-e", "MYSQL_USER=" + MYSQL_APP_USER,
                    "-e", "MYSQL_PASSWORD=" + MYSQL_APP_PASSWORD,
                    "mysql:8.0",
                    "--default-authentication-plugin=mysql_native_password",
                    "--character-set-server=utf8mb4",
                    "--collation-server=utf8mb4_unicode_ci");
            if (run.exitCode() != 0) {
                throw BusinessException.serverError("Shared MySQL start failed:\n" + trimOutput(run.output(), 3000));
            }
        } else {
            runDocker(false, QUICK_TIMEOUT, "network", "connect", SHARED_NETWORK, SHARED_MYSQL_CONTAINER);
            runDocker(false, RUN_TIMEOUT, "start", SHARED_MYSQL_CONTAINER);
        }

        waitForSharedMysql();
        initializeSharedDatabase(initDir, dbName, projectName);
    }

    private void waitForSharedMysql() {
        for (int i = 0; i < 45; i++) {
            CommandResult authCheck = runDocker(false, QUICK_TIMEOUT, "exec", SHARED_MYSQL_CONTAINER,
                    "mysql", "-uroot", "-p" + MYSQL_ROOT_PASSWORD, "-e", "SELECT 1");
            if (authCheck.exitCode() == 0) {
                return;
            }
            try {
                Thread.sleep(2000L);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw BusinessException.serverError("Shared MySQL wait interrupted");
            }
        }
        throw BusinessException.serverError("Shared MySQL did not become ready with the configured root password. "
                + "If agentoffice-mysql was created by an older failed deploy, remove that container and deploy again.");
    }

    private void initializeSharedDatabase(Path initDir, String dbName, String projectName) {
        String createSql = "SET NAMES utf8mb4; "
                + "CREATE DATABASE IF NOT EXISTS `" + dbName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; "
                + "CREATE USER IF NOT EXISTS '" + MYSQL_APP_USER + "'@'%' IDENTIFIED BY '" + MYSQL_APP_PASSWORD + "'; "
                + "GRANT ALL PRIVILEGES ON `" + dbName + "`.* TO '" + MYSQL_APP_USER + "'@'%'; "
                + "FLUSH PRIVILEGES;";
        CommandResult createDb = runDocker(true, RUN_TIMEOUT, "exec", SHARED_MYSQL_CONTAINER,
                "mysql", "--default-character-set=utf8mb4", "-uroot", "-p" + MYSQL_ROOT_PASSWORD, "-e", createSql);
        if (createDb.exitCode() != 0) {
            throw BusinessException.serverError("Shared MySQL database init failed:\n" + trimOutput(createDb.output(), 3000));
        }

        if (initDir == null || !Files.isDirectory(initDir)) {
            return;
        }
        try (Stream<Path> sqlFiles = Files.list(initDir)) {
            List<Path> files = sqlFiles
                    .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".sql"))
                    .sorted()
                    .toList();
            if (files.isEmpty()) {
                return;
            }
            String containerDir = "/tmp/agentoffice-init-" + slug(projectName);
            runDocker(false, QUICK_TIMEOUT, "exec", SHARED_MYSQL_CONTAINER, "rm", "-rf", containerDir);
            CommandResult mkdir = runDocker(true, RUN_TIMEOUT, "exec", SHARED_MYSQL_CONTAINER, "mkdir", "-p", containerDir);
            if (mkdir.exitCode() != 0) {
                throw BusinessException.serverError("Shared MySQL init dir create failed:\n" + trimOutput(mkdir.output(), 3000));
            }
            for (Path file : files) {
                CommandResult copy = runDocker(true, RUN_TIMEOUT, "cp", file.toString(),
                        SHARED_MYSQL_CONTAINER + ":" + containerDir + "/" + file.getFileName());
                if (copy.exitCode() != 0) {
                    throw BusinessException.serverError("Shared MySQL schema copy failed:\n" + trimOutput(copy.output(), 3000));
                }
            }
            CommandResult importSql = runDocker(true, BUILD_TIMEOUT, "exec", SHARED_MYSQL_CONTAINER, "sh", "-c",
                    "for f in " + containerDir + "/*.sql; do [ -f \"$f\" ] && mysql --default-character-set=utf8mb4 -uroot -p" + MYSQL_ROOT_PASSWORD
                            + " " + dbName + " < \"$f\"; done");
            if (importSql.exitCode() != 0) {
                throw BusinessException.serverError("Shared MySQL schema import failed:\n" + trimOutput(importSql.output(), 3000));
            }
        } catch (IOException e) {
            throw BusinessException.serverError("Failed to initialize shared MySQL schema: " + e.getMessage());
        }
    }

    private String stripDatabaseStatements(String sql) {
        StringBuilder sb = new StringBuilder();
        for (String line : sql.split("\n")) {
            String trimmed = line.trim().toLowerCase(Locale.ROOT);
            if (trimmed.startsWith("create database") || trimmed.startsWith("use ")) {
                continue;
            }
            sb.append(line).append("\n");
        }
        return sb.toString();
    }

    private String extractDatabaseName(Path sqlFile) {
        try {
            for (String line : Files.readAllLines(sqlFile, StandardCharsets.UTF_8)) {
                String trimmed = line.trim().toLowerCase(Locale.ROOT);
                if (trimmed.startsWith("use ")) {
                    String name = trimmed.substring(4).replaceAll("[;`'\"\\s]+", "");
                    if (!name.isBlank()) return name;
                }
            }
        } catch (IOException ignored) {}
        return null;
    }

    private Path composeFile(String projectName) {
        return deployRoot.resolve(projectName).resolve("docker-compose.yml").normalize();
    }

    private String escapePath(Path path) {
        return path.toAbsolutePath().normalize().toString().replace("\\", "/").replace("\"", "\\\"");
    }

    private String readJavaPackage(Path mainFile) throws IOException {
        if (!Files.exists(mainFile)) {
            return "com.agentoffice.generated";
        }
        for (String line : Files.readAllLines(mainFile, StandardCharsets.UTF_8)) {
            String trimmed = line.trim();
            if (trimmed.startsWith("package ") && trimmed.endsWith(";")) {
                return trimmed.substring("package ".length(), trimmed.length() - 1).trim();
            }
        }
        return "com.agentoffice.generated";
    }

    private boolean hasJavaBackend(Path backendDir) {
        if (!Files.isDirectory(backendDir)) return false;
        if (Files.exists(backendDir.resolve("pom.xml"))) return true;
        try (var entries = Files.walk(backendDir, 5)) {
            return entries.anyMatch(p -> p.getFileName().toString().endsWith(".java"));
        } catch (IOException e) {
            return false;
        }
    }

    private boolean requiresMysql(Path projectPath) {
        Path backendDir = projectPath.resolve("backend");
        if (Files.isDirectory(backendDir)) {
            try (var entries = Files.list(backendDir)) {
                if (entries.anyMatch(p -> p.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".sql"))) {
                    return true;
                }
            } catch (IOException ignored) {
            }
        }
        Path deployConfig = projectPath.resolve("deploy.yml");
        if (Files.exists(deployConfig)) {
            try {
                String content = Files.readString(deployConfig, StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
                if (content.contains("mysql") || content.contains("database:")) {
                    return true;
                }
            } catch (IOException ignored) {
                return false;
            }
        }
        return false;
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

    private record AppPlan(String appType, boolean deployable, boolean compose, boolean hasFrontend, boolean hasBackend,
                           boolean database, Integer internalPort, Integer backendPort, String message) {
    }

    private record ContainerInfo(String containerId, String status, String image, Integer port) {
    }

    private record CommandResult(int exitCode, String output) {
    }
}
