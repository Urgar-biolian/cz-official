import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted = false) {
    const comments = await this.prisma.comment.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: comments,
    };
  }

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId,
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      data: comment,
    };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      data: comment,
    };
  }

  async remove(id: number) {
    // 软删除：设置deletedAt字段
    const comment = await this.prisma.comment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      data: comment,
    };
  }

  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            avatar: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return {
      data: comment,
    };
  }

  async toggleLike(commentId: number, userId: number) {
    const already = await this.prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });
    if (already) {
      await this.prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId } },
      });
      return { liked: false };
    } else {
      await this.prisma.commentLike.create({
        data: { commentId, userId },
      });
      return { liked: true };
    }
  }
}