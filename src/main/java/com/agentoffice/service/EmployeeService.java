package com.agentoffice.service;

import com.agentoffice.common.exception.BusinessException;
import com.agentoffice.dto.CreateEmployeeRequest;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.EmployeePermission;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.EmployeePermissionMapper;
import com.agentoffice.mapper.TaskInfoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    @Autowired
    private EmployeePermissionMapper permissionMapper;

    @Autowired
    private TaskInfoMapper taskMapper;

    public List<AgentEmployee> getList(Long userId, String status, String role, String keyword) {
        List<AgentEmployee> employees = employeeMapper.findListByUser(userId, status, role, keyword);
        employees.forEach(employee -> fillTaskCount(userId, employee));
        return employees;
    }

    public AgentEmployee getById(Long userId, Long id) {
        AgentEmployee employee = employeeMapper.findByIdForUser(id, userId);
        if (employee == null) {
            throw new BusinessException(404, "Employee does not exist");
        }
        fillTaskCount(userId, employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public AgentEmployee create(Long userId, CreateEmployeeRequest request) {
        AgentEmployee employee = new AgentEmployee();
        employee.setUserId(userId);
        employee.setName(request.getName());
        employee.setAvatar(request.getAvatar());
        employee.setRole(request.getRole());
        employee.setPosition(request.getPosition());
        employee.setStatus(request.getStatus());
        employee.setModelConfigId(request.getModelConfigId());

        if (employee.getName() == null || employee.getName().isBlank()) {
            throw new BusinessException(400, "Employee name is required");
        }
        if (employee.getRole() == null || employee.getRole().isBlank()) {
            throw new BusinessException(400, "Employee role is required");
        }
        if (employee.getStatus() == null) {
            employee.setStatus("idle");
        }

        employeeMapper.insert(employee);
        savePermissions(employee.getId(), request.getPermissions());
        fillTaskCount(userId, employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public AgentEmployee update(Long userId, Long id, CreateEmployeeRequest request) {
        AgentEmployee exist = employeeMapper.findByIdForUser(id, userId);
        if (exist == null) {
            throw new BusinessException(404, "Employee does not exist");
        }

        AgentEmployee employee = new AgentEmployee();
        employee.setId(id);
        employee.setUserId(userId);
        employee.setName(request.getName());
        employee.setAvatar(request.getAvatar());
        employee.setRole(request.getRole());
        employee.setPosition(request.getPosition());
        employee.setStatus(request.getStatus());
        employee.setModelConfigId(request.getModelConfigId());

        employeeMapper.update(employee);
        if (request.getPermissions() != null) {
            permissionMapper.deleteByEmployeeId(id);
            savePermissions(id, request.getPermissions());
        }
        fillTaskCount(userId, employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public void delete(Long userId, Long id) {
        AgentEmployee employee = employeeMapper.findByIdForUser(id, userId);
        if (employee == null) {
            throw new BusinessException(404, "Employee does not exist");
        }
        permissionMapper.deleteByEmployeeId(id);
        employeeMapper.deleteByIdForUser(id, userId);
    }

    @Transactional
    public void updateStatus(Long userId, Long id, String status) {
        employeeMapper.updateStatusForUser(id, status, userId);
    }

    public Map<String, Integer> getStatusOverview(Long userId) {
        Map<String, Integer> overview = new HashMap<>();
        overview.put("working", employeeMapper.countByStatusForUser("working", userId));
        overview.put("thinking", employeeMapper.countByStatusForUser("thinking", userId));
        overview.put("compiling", employeeMapper.countByStatusForUser("compiling", userId));
        overview.put("deploying", employeeMapper.countByStatusForUser("deploying", userId));
        overview.put("idle", employeeMapper.countByStatusForUser("idle", userId) + employeeMapper.countByStatusForUser("online", userId));
        return overview;
    }

    private void savePermissions(Long employeeId, List<CreateEmployeeRequest.PermissionItem> permissions) {
        if (permissions == null) {
            return;
        }
        for (CreateEmployeeRequest.PermissionItem item : permissions) {
            EmployeePermission permission = new EmployeePermission();
            permission.setEmployeeId(employeeId);
            permission.setPermissionCode(item.getCode());
            permission.setPermissionName(item.getName());
            permission.setEnabled(Boolean.FALSE.equals(item.getEnabled()) ? 0 : 1);
            permissionMapper.insert(permission);
        }
    }

    private void fillPermissions(AgentEmployee employee) {
        List<EmployeePermission> permissions = permissionMapper.findByEmployeeId(employee.getId());
        employee.setPermissions(permissions);
    }

    private void fillTaskCount(Long userId, AgentEmployee employee) {
        if (employee != null && employee.getId() != null) {
            employee.setTaskCount(taskMapper.countByExecutorForUser(employee.getId(), userId));
        }
    }
}


