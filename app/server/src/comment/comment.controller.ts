import { Controller, Post, Body, Get, Param, Query, Patch, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';

// 创建评论的DTO
class CreateCommentDto {
  content: string;
  userId: number;
  parentId?: number;
  rootParentId?: number;
}

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) { }

  // 获取所有评论（支持查询参数）
  @Get()
  async getAllComments(@Query() query: {
    parent_id?: number | null;
    include_deleted?: boolean;
  }) {
    console.log('控制器 getAllComments 被调用，查询参数:', query);
    const result = await this.commentService.getAllComments(query);
    console.log('控制器返回结果:', result);
    console.log('返回结果类型:', typeof result);
    console.log('是否为数组:', Array.isArray(result));
    return result;
  }

  // 获取单个评论详情
  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentById(parseInt(id));
  }

  // 创建评论
  @Post()
  async createComment(@Body() data: CreateCommentDto) {
    console.log('控制器接收到的数据:', data);

    // 参数验证
    if (!data.content || !data.userId) {
      throw new Error('content 和 userId 是必需的');
    }

    return this.commentService.createComment(data);
  }

  // 更新评论
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() data: { content: string }
  ) {
    return this.commentService.updateComment(parseInt(id), data);
  }

  // 删除评论
  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(parseInt(id));
  }

  // 获取特定帖子的评论
  @Get('post/:postId')
  async getByPost(@Param('postId') postId: string) {
    return this.commentService.getCommentsByPost(parseInt(postId));
  }

  // 点赞/取消点赞评论（切换）
  @Post(':commentId/like')
  async toggleLikeComment(
    @Param('commentId') commentId: string,
    @Body('userId') userId: number,
  ) {
    console.log('toggleLikeComment:东方大道', { commentId, userId });
    return this.commentService.toggleLikeComment(parseInt(commentId), userId);
  }

  // 获取评论详情
  @Get(':commentId/detail')
  async getCommentDetail(@Param('commentId') commentId: string) {
    return this.commentService.getCommentDetail(Number(commentId));
  }
}
