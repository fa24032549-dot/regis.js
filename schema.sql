CREATE DATABASE IF NOT EXISTS regisdb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE regisdb;

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_accounts_email (email)
);

CREATE TABLE IF NOT EXISTS student (
    id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    stCode    VARCHAR(20)  NOT NULL UNIQUE COMMENT 'รหัสนักศึกษา',
    stName    VARCHAR(150) NOT NULL COMMENT 'ชื่อ-นามสกุล',
    stMajor   VARCHAR(100) NOT NULL COMMENT 'สาขาวิชา',
    stAddress VARCHAR(255) NOT NULL COMMENT 'ที่อยู่',
    stPhone   VARCHAR(20)  NOT NULL COMMENT 'เบอร์โทรศัพท์',
    stEmail   VARCHAR(255) NOT NULL UNIQUE COMMENT 'อีเมล',
    passWord  VARCHAR(255) NOT NULL COMMENT 'รหัสผ่าน',
    PRIMARY KEY (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;