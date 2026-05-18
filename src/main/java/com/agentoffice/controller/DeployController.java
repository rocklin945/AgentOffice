package com.agentoffice.controller;

import com.agentoffice.common.result.Result;
import com.agentoffice.dto.DeployLogsResponse;
import com.agentoffice.dto.DeployRequest;
import com.agentoffice.dto.DockerProjectResponse;
import com.agentoffice.dto.DockerStatusResponse;
import com.agentoffice.service.DockerDeployService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/deploy")
public class DeployController {

    @Autowired
    private DockerDeployService dockerDeployService;

    @GetMapping("/docker/status")
    public Result<DockerStatusResponse> getDockerStatus() {
        return Result.success(dockerDeployService.getDockerStatus());
    }

    @GetMapping("/projects")
    public Result<List<DockerProjectResponse>> getProjects() {
        return Result.success(dockerDeployService.listProjects());
    }

    @GetMapping("/projects/{projectName}")
    public Result<DockerProjectResponse> getProject(@PathVariable String projectName) {
        return Result.success(dockerDeployService.getProject(projectName));
    }

    @PostMapping("/projects/{projectName}/deploy")
    public Result<DockerProjectResponse> deploy(@PathVariable String projectName,
                                                @RequestBody(required = false) DeployRequest request) {
        return Result.success(dockerDeployService.deploy(projectName, request));
    }

    @PostMapping("/projects/{projectName}/start")
    public Result<DockerProjectResponse> start(@PathVariable String projectName) {
        return Result.success(dockerDeployService.start(projectName));
    }

    @PostMapping("/projects/{projectName}/stop")
    public Result<DockerProjectResponse> stop(@PathVariable String projectName) {
        return Result.success(dockerDeployService.stop(projectName));
    }

    @PostMapping("/projects/{projectName}/restart")
    public Result<DockerProjectResponse> restart(@PathVariable String projectName) {
        return Result.success(dockerDeployService.restart(projectName));
    }

    @DeleteMapping("/projects/{projectName}/container")
    public Result<Void> remove(@PathVariable String projectName) {
        dockerDeployService.remove(projectName);
        return Result.success();
    }

    @GetMapping("/projects/{projectName}/logs")
    public Result<DeployLogsResponse> getLogs(@PathVariable String projectName,
                                              @RequestParam(defaultValue = "200") Integer lines) {
        return Result.success(new DeployLogsResponse(dockerDeployService.getLogs(projectName, lines)));
    }
}
