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

    public List<AgentEmployee> getList(String status, String role, String keyword) {
        List<AgentEmployee> employees = employeeMapper.findList(status, role, keyword);
        employees.forEach(this::fillTaskCount);
        return employees;
    }

    public AgentEmployee getById(Long id) {
        AgentEmployee employee = employeeMapper.findById(id);
        if (employee == null) {
            throw new BusinessException(404, "Employee does not exist");
        }
        fillTaskCount(employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public AgentEmployee create(CreateEmployeeRequest request) {
        AgentEmployee employee = new AgentEmployee();
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
        fillTaskCount(employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public AgentEmployee update(Long id, CreateEmployeeRequest request) {
        AgentEmployee exist = employeeMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "Employee does not exist");
        }

        AgentEmployee employee = new AgentEmployee();
        employee.setId(id);
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
        fillTaskCount(employee);
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public void delete(Long id) {
        AgentEmployee employee = employeeMapper.findById(id);
        if (employee == null) {
            throw new BusinessException(404, "Employee does not exist");
        }
        permissionMapper.deleteByEmployeeId(id);
        employeeMapper.deleteById(id);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        employeeMapper.updateStatus(id, status);
    }

    public Map<String, Integer> getStatusOverview() {
        Map<String, Integer> overview = new HashMap<>();
        overview.put("working", employeeMapper.countByStatus("working"));
        overview.put("thinking", employeeMapper.countByStatus("thinking"));
        overview.put("compiling", employeeMapper.countByStatus("compiling"));
        overview.put("deploying", employeeMapper.countByStatus("deploying"));
        overview.put("idle", employeeMapper.countByStatus("idle") + employeeMapper.countByStatus("online"));
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

    private void fillTaskCount(AgentEmployee employee) {
        if (employee != null && employee.getId() != null) {
            employee.setTaskCount(taskMapper.countByExecutor(employee.getId()));
        }
    }
}


