// 评论相关类型定义
export interface CreateCommentDTO {
  content: string;
  user_id: number;
  parent_id?: number;
  root_parent_id?: number;
  reply_to_user?: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  parentId?: number;
  rootParentId?: number;
  createdAt: string;
  isDeleted: boolean;
  likeCount: number;
  replyCount: number;
  attachmentCount: number;
  user: {
    userId: number;
    username: string;
    avatar?: string;
    role?: string;
  };
  replies?: Comment[];
  likes?: CommentLike[];
  attachments?: CommentAttachment[];
}

export interface CommentLike {
  id: number;
  commentId: number;
  userId: number;
  createdAt: string;
}

export interface CommentAttachment {
  id: number;
  commentId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
}

// 用于API响应的评论类型
export type MainComment = Comment;

// 用户类型定义（补充）
export interface User {
  userId: number;
  username: string;
  avatar?: string;
  role?: string;
}
