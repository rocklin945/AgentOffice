package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.service.CurrentUserService;
import com.agentoffice.service.DevService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dev")
public class DevController {

    @Autowired
    private DevService devService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/projects")
    public Result<List<DevProject>> getProjectList(@RequestHeader(value = "Authorization", required = false) String token) {
        List<DevProject> list = devService.getProjectList(currentUserService.requireUserId(token));
        return Result.success(list);
    }

    @GetMapping("/projects/{id}")
    public Result<DevProject> getProject(@PathVariable Long id,
                                         @RequestHeader(value = "Authorization", required = false) String token) {
        DevProject project = devService.getProjectById(currentUserService.requireUserId(token), id);
        return Result.success(project);
    }

    @PostMapping("/projects")
    public Result<DevProject> createProject(@RequestBody DevProject project,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        DevProject result = devService.createProject(currentUserService.requireUserId(token), project);
        return Result.success(result);
    }

    @PutMapping("/projects/{id}")
    public Result<DevProject> updateProject(@PathVariable Long id, @RequestBody DevProject project,
                                            @RequestHeader(value = "Authorization", required = false) String token) {
        DevProject result = devService.updateProject(currentUserService.requireUserId(token), id, project);
        return Result.success(result);
    }

    @DeleteMapping("/projects/{id}")
    public Result<Void> deleteProject(@PathVariable Long id,
                                      @RequestHeader(value = "Authorization", required = false) String token) {
        devService.deleteProject(currentUserService.requireUserId(token), id);
        return Result.success();
    }

    @GetMapping("/projects/{id}/files")
    public Result<List<DevFile>> getFileTree(@PathVariable Long id,
                                             @RequestHeader(value = "Authorization", required = false) String token) {
        List<DevFile> files = devService.getFileTree(currentUserService.requireUserId(token), id);
        return Result.success(files);
    }

    @GetMapping("/files/{id}")
    public Result<Map<String, Object>> getFile(@PathVariable Long id,
                                               @RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> file = devService.getFileWithContent(currentUserService.requireUserId(token), id);
        return Result.success(file);
    }

    @PostMapping("/projects/{id}/files")
    public Result<DevFile> createFile(@PathVariable Long id, @RequestBody Map<String, Object> body,
                                      @RequestHeader(value = "Authorization", required = false) String token) {
        DevFile file = new DevFile();
        file.setFileName((String) body.get("fileName"));
        file.setFilePath((String) body.get("filePath"));
        file.setFileType((String) body.get("fileType"));
        file.setParentId(body.get("parentId") != null ? Long.valueOf(body.get("parentId").toString()) : null);
        file.setIsDirectory(body.get("isDirectory") != null ? Integer.valueOf(body.get("isDirectory").toString()) : 0);
        String content = (String) body.get("content");
        DevFile result = devService.createFile(currentUserService.requireUserId(token), id, file, content);
        return Result.success(result);
    }

    @PutMapping("/files/{id}/content")
    public Result<DevFile> updateFileContent(@PathVariable Long id, @RequestBody Map<String, Object> body,
                                             @RequestHeader(value = "Authorization", required = false) String token) {
        String content = (String) body.get("content");
        DevFile result = devService.updateFileContent(currentUserService.requireUserId(token), id, content);
        return Result.success(result);
    }

    @DeleteMapping("/files/{id}")
    public Result<Void> deleteFile(@PathVariable Long id,
                                   @RequestHeader(value = "Authorization", required = false) String token) {
        devService.deleteFile(currentUserService.requireUserId(token), id);
        return Result.success();
    }

    @PostMapping("/run")
    public Result<Map<String, Object>> runCode(@RequestBody Map<String, Object> body,
                                               @RequestHeader(value = "Authorization", required = false) String token) {
        Long fileId = Long.valueOf(body.get("fileId").toString());
        String language = (String) body.get("language");
        String output = devService.runCode(currentUserService.requireUserId(token), fileId, language);

        return Result.success(Map.of(
                "output", output,
                "error", "",
                "exitCode", 0,
                "executionTime", 156
        ));
    }
}
