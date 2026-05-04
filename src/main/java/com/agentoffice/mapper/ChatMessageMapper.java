package com.agentoffice.mapper;

import com.agentoffice.entity.ChatMessage;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ChatMessageMapper {
    @Select("SELECT * FROM chat_message WHERE session_id = #{sessionId} ORDER BY create_time ASC, id ASC")
    List<ChatMessage> findBySessionId(@Param("sessionId") Long sessionId);

    @Insert("INSERT INTO chat_message (session_id, role, sender, employee_id, content) VALUES (#{sessionId}, #{role}, #{sender}, #{employeeId}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ChatMessage message);

    @Delete("DELETE FROM chat_message WHERE session_id = #{sessionId}")
    int deleteBySessionId(@Param("sessionId") Long sessionId);
}
