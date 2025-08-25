-- CZ Official Database Schema
-- Generated from Prisma schema
-- 最后更新: 2024-12-19

-- 创建数据库（如果需要）
-- CREATE DATABASE IF NOT EXISTS cz_official CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE cz_official;

-- 用户表
CREATE TABLE `user` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) DEFAULT NULL COMMENT 'CZ_MEMBER/COMMON/ADMIN',
  `email` varchar(191) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `github` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `background` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `major` varchar(191) NOT NULL,
  `grade` int NOT NULL,
  `badge` varchar(191) DEFAULT NULL COMMENT '格式示例: "蓝桥杯国三,创智成员"',
  `score` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_username_key` (`username`),
  UNIQUE KEY `user_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 项目表
CREATE TABLE `project` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `stack` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `members` varchar(191) NOT NULL COMMENT '格式示例: "1,2,3"',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消息表
CREATE TABLE `message` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE `comment` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `content` varchar(191) NOT NULL,
  `user_id` int unsigned NOT NULL,
  `root_parent_id` int unsigned DEFAULT NULL,
  `created_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `is_deleted` boolean NOT NULL DEFAULT false,
  `parent_id` int unsigned DEFAULT NULL,
  `like_count` int NOT NULL DEFAULT 0,
  `reply_count` int NOT NULL DEFAULT 0,
  `attachment_count` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `comment_user_id_fkey` (`user_id`),
  KEY `comment_parent_id_fkey` (`parent_id`),
  CONSTRAINT `comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comment_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论点赞表
CREATE TABLE `comment_like` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `comment_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comment_user` (`comment_id`, `user_id`),
  KEY `comment_like_comment_id_fkey` (`comment_id`),
  KEY `comment_like_user_id_fkey` (`user_id`),
  CONSTRAINT `comment_like_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comment_like_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论附件表
CREATE TABLE `comment_attachment` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `comment_id` int unsigned NOT NULL,
  `file_name` varchar(191) NOT NULL,
  `file_path` varchar(191) NOT NULL,
  `file_type` varchar(191) NOT NULL,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `comment_attachment_comment_id_fkey` (`comment_id`),
  CONSTRAINT `comment_attachment_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一些初始数据（可选）
-- INSERT INTO `user` (`username`, `password`, `role`, `email`, `major`, `grade`)
-- VALUES ('admin', '$2b$10$hashed_password_here', 'ADMIN', 'admin@cz.com', '计算机科学与技术', 2024);

-- INSERT INTO `message` (`title`, `content`)
-- VALUES ('欢迎来到CZ官方', '欢迎加入我们的技术社区！');

-- 数据库索引说明:
-- 1. 所有主键都使用AUTO_INCREMENT自增
-- 2. 用户表的username和email字段有唯一索引
-- 3. 评论表的外键关系建立了索引
-- 4. 评论点赞表的comment_id和user_id组合有唯一索引
-- 5. 所有表使用utf8mb4字符集支持emoji和特殊字符
-- 6. 时间字段使用datetime(3)支持毫秒精度
-- 7. 外键约束确保数据完整性
