package com.agentoffice.mapper;

import com.agentoffice.entity.AgentEmployee;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AgentEmployeeMapper {

    @Select("<script>" +
            "SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id WHERE 1=1" +
            "<if test='status != null'> AND e.status = #{status}</if>" +
            "<if test='role != null'> AND e.role = #{role}</if>" +
            "<if test='keyword != null'> AND (e.name LIKE CONCAT('%', #{keyword}, '%') OR e.position LIKE CONCAT('%', #{keyword}, '%'))</if>" +
            " ORDER BY e.create_time DESC" +
            "</script>")
    List<AgentEmployee> findList(@Param("status") String status,
                                  @Param("role") String role,
                                  @Param("keyword") String keyword);

    @Select("SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id WHERE e.id = #{id}")
    AgentEmployee findById(@Param("id") Long id);

    @Select("SELECT e.*, mc.config_name AS model_config_name, mc.model_name AS model_name FROM agent_employee e " +
            "LEFT JOIN model_config mc ON e.model_config_id = mc.id ORDER BY e.create_time DESC")
    List<AgentEmployee> findAll();

    @Insert("INSERT INTO agent_employee (name, avatar, role, position, status, model_config_id) " +
            "VALUES (#{name}, #{avatar}, #{role}, #{position}, #{status}, #{modelConfigId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AgentEmployee employee);

    @Update("UPDATE agent_employee SET name = #{name}, avatar = #{avatar}, role = #{role}, " +
            "position = #{position}, status = #{status}, " +
            "model_config_id = #{modelConfigId}, update_time = NOW() WHERE id = #{id}")
    int update(AgentEmployee employee);

    @Delete("DELETE FROM agent_employee WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Update("UPDATE agent_employee SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Select("SELECT COUNT(*) FROM agent_employee WHERE status = #{status}")
    int countByStatus(@Param("status") String status);
}
