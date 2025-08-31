import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) { }

  /**
   * 获取所有评论（支持查询参数）
   */
  async getAllComments(query: {
    parent_id?: number | null;
    include_deleted?: boolean;
    userId?: number;
  }) {
    console.log('getAllComments 被调用，查询参数:', query);

    const where: any = {};

    if (query.parent_id !== undefined && query.parent_id !== null) {
      where.parentId = query.parent_id;
    }

    if (!query.include_deleted) {
      where.isDeleted = false;
    }

    console.log('Prisma 查询条件:', where);

    const comments = await this.prisma.comment.findMany({
      where,
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          }
        },
        likes: true
      },
      orderBy: [
        { likeCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('Prisma 查询结果:', comments);
    console.log('返回的评论数量:', comments.length);

    return comments.map(comment => ({
      ...comment,
      isLiked: comment.likes && comment.likes.length > 0
    }));
  }

  /**
   * 获取单个评论详情
   */
  async getCommentById(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                avatar: true,
                role: true,
              }
            }
          }
        }
      },
    });

    if (!comment) {
      throw new NotFoundException(`评论 ID ${commentId} 不存在`);
    }

    return comment;
  }

  /**
   * 创建评论
   */
  async createComment(data: {
    content: string;
    userId: number;
    parentId?: number;
    rootParentId?: number;
  }) {
    console.log('服务层接收到的数据:', data);

    // 确定根父评论ID
    let rootParentId = data.rootParentId;
    if (data.parentId && !rootParentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: data.parentId }
      });
      rootParentId = parentComment?.rootParentId || data.parentId;
    }

    // 创建评论
    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        userId: data.userId,
        parentId: data.parentId,
        rootParentId: rootParentId,
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
          }
        }
      }
    });

    // 更新父评论的回复数
    if (data.parentId) {
      await this.prisma.comment.update({
        where: { id: data.parentId },
        data: {
          replyCount: {
            increment: 1
          }
        }
      });
    }

    return comment;
  }

  /**
   * 更新评论
   */
  async updateComment(commentId: number, data: { content: string }) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`评论 ID ${commentId} 不存在`);
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
          }
        }
      },
    });
  }

  /**
   * 删除评论（软删除）
   */
  async deleteComment(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`评论 ID ${commentId} 不存在`);
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });
  }

  /**
   * 获取帖子的所有评论
   */
  async getCommentsByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: {
        // 这里需要根据实际需求调整
        // 如果评论表有postId字段，则使用 postId: postId
        // 目前先返回所有评论
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
            role: true,
          }
        }
      }
    });
  }

  /**
   * 点赞/取消点赞评论（切换）
   */
  async toggleLikeComment(commentId: number, userId: number) {
    // 检查是否已经点赞
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        uk_comment_user: {
          commentId,
          userId
        }
      }
    });

    if (existingLike) {
      // 已点赞，取消点赞
      await this.prisma.commentLike.delete({
        where: {
          uk_comment_user: {
            commentId,
            userId
          }
        }
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            decrement: 1
          }
        }
      });
      return { liked: false };
    } else {
      // 未点赞，添加点赞
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId
        }
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: 1
          }
        }
      });
      return { liked: true };
    }
  }

  async getCommentDetail(commentId: number) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: { select: { userId: true, username: true, avatar: true, role: true } },
        replies: {
          include: {
            user: { select: { userId: true, username: true, avatar: true, role: true } },
            replies: { // 递归嵌套
              include: {
                user: { select: { userId: true, username: true, avatar: true, role: true } }
              }
            }
          }
        }
      }
    });
  }
}
