package com.agentoffice.service;

import com.agentoffice.entity.DevFile;
import com.agentoffice.entity.DevProject;
import com.agentoffice.mapper.DevFileMapper;
import com.agentoffice.mapper.DevProjectMapper;
import com.agentoffice.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class DevService {

    @Autowired
    private DevProjectMapper projectMapper;

    @Autowired
    private DevFileMapper fileMapper;

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
                if (file.getIsDirectory() == 1) {
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

    @Transactional
    public DevFile createFile(Long projectId, DevFile file) {
        file.setProjectId(projectId);
        if (file.getIsDirectory() == null) {
            file.setIsDirectory(0);
        }
        fileMapper.insert(file);
        return file;
    }

    @Transactional
    public DevFile updateFile(Long id, DevFile file) {
        DevFile exist = fileMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "文件不存在");
        }
        file.setId(id);
        fileMapper.updateContent(file);
        return file;
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

        // 模拟代码执行
        return "Hello World!\n";
    }
}
