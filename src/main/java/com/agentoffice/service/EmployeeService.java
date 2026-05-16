package com.agentoffice.service;

import com.agentoffice.dto.CreateEmployeeRequest;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.EmployeePermission;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.EmployeePermissionMapper;
import com.agentoffice.mapper.OfficeDeskMapper;
import com.agentoffice.common.exception.BusinessException;
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
    private OfficeDeskMapper deskMapper;

    @Autowired
    private EmployeePermissionMapper permissionMapper;

    public List<AgentEmployee> getList(String status, String role, String keyword) {
        return employeeMapper.findList(status, role, keyword);
    }

    public AgentEmployee getById(Long id) {
        AgentEmployee employee = employeeMapper.findById(id);
        if (employee == null) {
            throw new BusinessException(404, "员工不存在");
        }
        if (employee.getDeskId() != null) {
            OfficeDesk desk = deskMapper.findById(employee.getDeskId());
            if (desk != null) {
                employee.setDeskCode(desk.getDeskCode());
            }
        }
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
        employee.setEfficiency(request.getEfficiency());
        employee.setDeskId(request.getDeskId());
        employee.setModelConfigId(request.getModelConfigId());

        if (employee.getName() == null || employee.getName().isBlank()) {
            throw new BusinessException(400, "员工姓名不能为空");
        }
        if (employee.getRole() == null || employee.getRole().isBlank()) {
            throw new BusinessException(400, "员工角色不能为空");
        }
        if (employee.getStatus() == null) {
            employee.setStatus("空闲");
        }
        if (employee.getTaskCount() == null) {
            employee.setTaskCount(0);
        }
        if (employee.getEfficiency() == null) {
            employee.setEfficiency(java.math.BigDecimal.ZERO);
        }
        if (employee.getDeskId() != null) {
            OfficeDesk desk = deskMapper.findById(employee.getDeskId());
            if (desk == null) {
                throw new BusinessException(404, "工位不存在");
            }
            if (desk.getEmployeeId() != null) {
                throw new BusinessException(400, "该工位已被占用");
            }
        }

        employeeMapper.insert(employee);

        if (employee.getDeskId() != null) {
            deskMapper.updateEmployee(employee.getDeskId(), employee.getId(), 1);
        }
        savePermissions(employee.getId(), request.getPermissions());
        fillPermissions(employee);
        return employee;
    }

    @Transactional
    public AgentEmployee update(Long id, CreateEmployeeRequest request) {
        AgentEmployee exist = employeeMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "员工不存在");
        }
        AgentEmployee employee = new AgentEmployee();
        employee.setName(request.getName());
        employee.setAvatar(request.getAvatar());
        employee.setRole(request.getRole());
        employee.setPosition(request.getPosition());
        employee.setStatus(request.getStatus());
        employee.setTaskCount(request.getTaskCount() == null ? exist.getTaskCount() : request.getTaskCount());
        employee.setEfficiency(request.getEfficiency() == null ? exist.getEfficiency() : request.getEfficiency());
        employee.setDeskId(request.getDeskId() == null ? exist.getDeskId() : request.getDeskId());
        employee.setModelConfigId(request.getModelConfigId());

        // 如果更换了工位
        if (employee.getDeskId() != null && !employee.getDeskId().equals(exist.getDeskId())) {
            // 释放原工位
            if (exist.getDeskId() != null) {
                deskMapper.updateEmployee(exist.getDeskId(), null, 0);
            }
            // 占用新工位
            deskMapper.updateEmployee(employee.getDeskId(), id, 1);
        }

        employee.setId(id);
        employeeMapper.update(employee);
        if (request.getPermissions() != null) {
            permissionMapper.deleteByEmployeeId(id);
            savePermissions(id, request.getPermissions());
        }
        fillPermissions(employee);

        return employee;
    }

    @Transactional
    public void delete(Long id) {
        AgentEmployee employee = employeeMapper.findById(id);
        if (employee == null) {
            throw new BusinessException(404, "员工不存在");
        }

        // 释放工位
        if (employee.getDeskId() != null) {
            deskMapper.updateEmployee(employee.getDeskId(), null, 0);
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
        overview.put("working", employeeMapper.countByStatus("工作中"));
        overview.put("thinking", employeeMapper.countByStatus("思考中"));
        overview.put("compiling", employeeMapper.countByStatus("编译中"));
        overview.put("deploying", employeeMapper.countByStatus("部署中"));
        overview.put("idle", employeeMapper.countByStatus("空闲") + employeeMapper.countByStatus("在线"));
        return overview;
    }

    private void savePermissions(Long employeeId, List<CreateEmployeeRequest.PermissionItem> permissions) {
        if (permissions == null) return;
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
}
