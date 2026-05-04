package com.agentoffice.mapper;

import com.agentoffice.entity.ChatSession;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ChatSessionMapper {
    @Select("SELECT * FROM chat_session WHERE user_id = #{userId} AND session_type = 'collaboration' ORDER BY update_time DESC")
    List<ChatSession> findCollaborationByUser(@Param("userId") Long userId);

    @Select("SELECT * FROM chat_session WHERE session_id = #{sessionId} AND user_id = #{userId}")
    ChatSession findBySessionIdAndUser(@Param("sessionId") String sessionId, @Param("userId") Long userId);

    @Insert("INSERT INTO chat_session (session_id, user_id, session_type, title) VALUES (#{sessionId}, #{userId}, #{sessionType}, #{title})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ChatSession session);

    @Update("UPDATE chat_session SET title = #{title}, update_time = NOW() WHERE id = #{id}")
    int updateTitle(ChatSession session);

    @Update("UPDATE chat_session SET update_time = NOW() WHERE id = #{id}")
    int touch(@Param("id") Long id);

    @Delete("DELETE FROM chat_session WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
