package com.agentoffice.mapper;

import com.agentoffice.entity.AgentEmployee;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AgentEmployeeMapper {

    @Select("<script>" +
            "SELECT * FROM agent_employee WHERE 1=1" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "<if test='role != null'> AND role = #{role}</if>" +
            "<if test='keyword != null'> AND (name LIKE CONCAT('%', #{keyword}, '%') OR position LIKE CONCAT('%', #{keyword}, '%'))</if>" +
            " ORDER BY create_time DESC" +
            "</script>")
    List<AgentEmployee> findList(@Param("status") String status,
                                  @Param("role") String role,
                                  @Param("keyword") String keyword);

    @Select("SELECT * FROM agent_employee WHERE id = #{id}")
    AgentEmployee findById(@Param("id") Long id);

    @Select("SELECT * FROM agent_employee ORDER BY create_time DESC")
    List<AgentEmployee> findAll();

    @Insert("INSERT INTO agent_employee (name, avatar, role, position, status, task_count, efficiency, desk_id) " +
            "VALUES (#{name}, #{avatar}, #{role}, #{position}, #{status}, #{taskCount}, #{efficiency}, #{deskId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AgentEmployee employee);

    @Update("UPDATE agent_employee SET name = #{name}, avatar = #{avatar}, role = #{role}, " +
            "position = #{position}, status = #{status}, task_count = #{taskCount}, " +
            "efficiency = #{efficiency}, desk_id = #{deskId}, update_time = NOW() WHERE id = #{id}")
    int update(AgentEmployee employee);

    @Delete("DELETE FROM agent_employee WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Update("UPDATE agent_employee SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Select("SELECT COUNT(*) FROM agent_employee WHERE status = #{status}")
    int countByStatus(@Param("status") String status);
}
