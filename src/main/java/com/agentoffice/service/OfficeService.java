package com.agentoffice.service;

import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.OfficeDeskMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OfficeService {

    @Autowired
    private OfficeDeskMapper deskMapper;

    @Autowired
    private AgentEmployeeMapper employeeMapper;

    public OfficeLayoutResponse getLayout() {
        List<OfficeDesk> desks = deskMapper.findAll();
        List<AgentEmployee> employees = employeeMapper.findAll();

        Map<Long, AgentEmployee> employeeMap = employees.stream()
                .filter(e -> e.getDeskId() != null)
                .collect(Collectors.toMap(AgentEmployee::getDeskId, e -> e));

        Integer maxRow = desks.stream()
                .mapToInt(OfficeDesk::getRowNum)
                .max()
                .orElse(0);

        Integer maxCol = desks.stream()
                .mapToInt(Desk -> Desk.getColNum())
                .max()
                .orElse(0);

        OfficeLayoutResponse response = new OfficeLayoutResponse();
        response.setRows(maxRow);
        response.setCols(maxCol);

        List<OfficeLayoutResponse.DeskInfo> deskInfoList = new ArrayList<>();
        for (OfficeDesk desk : desks) {
            OfficeLayoutResponse.DeskInfo deskInfo = new OfficeLayoutResponse.DeskInfo();
            deskInfo.setId(desk.getId());
            deskInfo.setDeskCode(desk.getDeskCode());
            deskInfo.setRowNum(desk.getRowNum());
            deskInfo.setColNum(desk.getColNum());
            deskInfo.setStatus(desk.getStatus());

            AgentEmployee employee = employeeMap.get(desk.getId());
            if (employee != null) {
                OfficeLayoutResponse.EmployeeInfo employeeInfo = new OfficeLayoutResponse.EmployeeInfo();
                employeeInfo.setId(employee.getId());
                employeeInfo.setName(employee.getName());
                employeeInfo.setAvatar(employee.getAvatar());
                employeeInfo.setRole(employee.getRole());
                employeeInfo.setPosition(employee.getPosition());
                employeeInfo.setStatus(employee.getStatus());
                deskInfo.setEmployee(employeeInfo);
            }

            deskInfoList.add(deskInfo);
        }

        response.setDesks(deskInfoList);
        return response;
    }

    public Map<String, Integer> getStatusOverview() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        return employees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus() != null ? e.getStatus() : "空闲",
                        Collectors.reducing(0, e -> 1, Integer::sum)
                ));
    }

    public Map<String, Object> getCollaboration() {
        List<AgentEmployee> employees = employeeMapper.findAll();
        List<Map<String, Object>> staff = new ArrayList<>();
        String[] colors = {"#8b5cf6", "#2bb36b", "#2f6bff", "#ff8a32", "#94a0b8"};

        for (int i = 0; i < employees.size(); i++) {
            AgentEmployee employee = employees.get(i);
            Map<String, Object> item = new HashMap<>();
            String id = employee.getName() == null ? "emp" + employee.getId() : employee.getName().toLowerCase();
            String displayStatus = collaborationStatus(employee);
            item.put("id", id);
            item.put("name", employee.getName());
            item.put("title", employee.getRole());
            item.put("badge", displayStatus);
            item.put("badgeColor", statusColor(displayStatus));
            item.put("employeeNo", "EMP" + String.format("%04d", employee.getId()));
            item.put("duty", employee.getPosition() != null ? employee.getPosition() : roleDuty(employee.getRole()));
            item.put("skills", roleSkills(employee.getRole()));
            item.put("task", employee.getTaskCount() != null && employee.getTaskCount() > 0 ? "处理当前分配任务" : "暂无进行中任务");
            item.put("progress", employee.getEfficiency() == null ? 0 : employee.getEfficiency().intValue());
            item.put("nextEmployee", i + 1 < employees.size() ? (employees.get(i + 1).getName() == null ? null : employees.get(i + 1).getName().toLowerCase()) : null);
            item.put("workingTime", "0分钟");
            item.put("commits", "0次");
            item.put("testPass", "0个");
            item.put("deployCount", "0次");
            item.put("workProducts", List.of(
                    Map.of("name", employee.getName() + " 工作记录", "time", "实时", "status", employee.getTaskCount() != null && employee.getTaskCount() > 0 ? "进行中" : "已完成")
            ));
            item.put("color", colors[i % colors.length]);
            staff.add(item);
        }

        Map<String, Integer> overview = getStatusOverview();
        int total = employees.size();
        int idle = overview.getOrDefault("空闲", 0) + overview.getOrDefault("在线", 0);
        int busy = Math.max(total - idle, 0);

        Map<String, Object> result = new HashMap<>();
        result.put("staffList", staff);
        result.put("messages", buildMessages(staff));
        result.put("statCards", List.of(
                Map.of("label", "员工总数", "value", total + "人", "iconClass", "bg-[#edf4ff] text-[#2f6bff]"),
                Map.of("label", "在线员工", "value", total + "人", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]"),
                Map.of("label", "忙碌中", "value", busy + "人", "iconClass", "bg-[#fff4ea] text-[#ff8a32]"),
                Map.of("label", "空闲中", "value", idle + "人", "iconClass", "bg-[#fff8e8] text-[#f4b53f]"),
                Map.of("label", "今日完成任务", "value", "0个", "iconClass", "bg-[#ebfbf1] text-[#2bb36b]")
        ));
        result.put("donutItems", overview.entrySet().stream()
                .map(entry -> Map.of("label", entry.getKey(), "value", entry.getValue(), "color", colorForStatus(entry.getKey())))
                .collect(Collectors.toList()));
        result.put("taskSummary", List.of(
                List.of("全部任务", "0"),
                List.of("进行中", "0"),
                List.of("已完成", "0"),
                List.of("已失败", "0")
        ));
        return result;
    }

    private List<Map<String, Object>> buildMessages(List<Map<String, Object>> staff) {
        if (staff.isEmpty()) {
            return List.of();
        }
        Map<String, Object> first = staff.get(0);
        return List.of(Map.of(
                "id", 1,
                "sender", first.get("name"),
                "avatar", first.get("color"),
                "text", "团队协作数据已从后端同步",
                "time", "实时"
        ));
    }

    private String statusColor(String status) {
        if ("工作中".equals(status) || "编码中".equals(status)) return "green";
        if ("测试中".equals(status)) return "blue";
        if ("部署中".equals(status)) return "purple";
        if ("思考中".equals(status)) return "orange";
        return "gray";
    }

    private String collaborationStatus(AgentEmployee employee) {
        String status = employee.getStatus();
        String role = employee.getRole();
        if ("工作中".equals(status) && role != null && role.contains("开发")) return "编码中";
        if ("工作中".equals(status) && role != null && role.contains("测试")) return "测试中";
        return status;
    }

    private String colorForStatus(String status) {
        if ("工作中".equals(status) || "编码中".equals(status)) return "#2f6bff";
        if ("思考中".equals(status)) return "#8b5cf6";
        if ("测试中".equals(status)) return "#2bb36b";
        if ("部署中".equals(status)) return "#ff8a32";
        return "#b8becb";
    }

    private String roleDuty(String role) {
        if (role == null) return "负责团队协作任务";
        if (role.contains("产品")) return "负责需求分析、原型设计、跨团队沟通与任务拆解";
        if (role.contains("测试")) return "负责自动化测试、回归验证、用例编排和质量报告输出";
        if (role.contains("运维")) return "负责环境部署、容器编排、监控告警与日志巡检";
        return "负责接口开发、业务逻辑实现、性能优化等工作";
    }

    private List<String> roleSkills(String role) {
        if (role == null) return List.of("协作");
        if (role.contains("产品")) return List.of("PRD", "Figma", "Roadmap");
        if (role.contains("测试")) return List.of("Playwright", "Jest", "API Test");
        if (role.contains("运维")) return List.of("K8s", "Nginx", "Linux");
        return List.of("Java", "Spring Boot", "MySQL", "Docker");
    }
}
