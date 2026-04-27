package com.agentoffice.service;

import com.agentoffice.dto.OfficeLayoutResponse;
import com.agentoffice.entity.AgentEmployee;
import com.agentoffice.entity.OfficeDesk;
import com.agentoffice.mapper.AgentEmployeeMapper;
import com.agentoffice.mapper.OfficeDeskMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
}
