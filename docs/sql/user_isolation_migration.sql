USE agent_office;

ALTER TABLE model_config
    ADD COLUMN user_id BIGINT DEFAULT NULL COMMENT 'User id, NULL means system shared config' AFTER id,
    ADD KEY idx_user_id (user_id);

ALTER TABLE agent_employee
    ADD COLUMN user_id BIGINT DEFAULT NULL COMMENT 'User id, NULL means system shared employee' AFTER id,
    ADD KEY idx_user_id (user_id);

ALTER TABLE task_info
    ADD KEY idx_create_user (create_user);

UPDATE task_info SET create_user = 1 WHERE create_user IS NULL;

ALTER TABLE work_product
    ADD COLUMN user_id BIGINT DEFAULT NULL COMMENT 'User id' AFTER id,
    ADD KEY idx_user_id (user_id);

UPDATE work_product SET user_id = 1 WHERE user_id IS NULL;

ALTER TABLE deploy_service
    ADD COLUMN user_id BIGINT DEFAULT NULL COMMENT 'User id' AFTER id,
    ADD KEY idx_user_id (user_id);

UPDATE deploy_service SET user_id = 1 WHERE user_id IS NULL;

UPDATE operation_log SET user_id = 1 WHERE user_id IS NULL;
