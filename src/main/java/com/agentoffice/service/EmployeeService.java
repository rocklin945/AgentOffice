package com.agentoffice.service;

import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.mapper.AgentEmployeeMapper;
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
        return employee;
    }

    @Transactional
    public AgentEmployee create(AgentEmployee employee) {
        if (employee.getStatus() == null) {
            employee.setStatus("空闲");
        }
        if (employee.getTaskCount() == null) {
            employee.setTaskCount(0);
        }
        if (employee.getEfficiency() == null) {
            employee.setEfficiency(java.math.BigDecimal.ZERO);
        }
        employeeMapper.insert(employee);

        if (employee.getDeskId() != null) {
            deskMapper.updateEmployee(employee.getDeskId(), employee.getId(), 1);
        }

        return employee;
    }

    @Transactional
    public AgentEmployee update(Long id, AgentEmployee employee) {
        AgentEmployee exist = employeeMapper.findById(id);
        if (exist == null) {
            throw new BusinessException(404, "员工不存在");
        }

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
}
