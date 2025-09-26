// commentApi.ts (前端)，axios实例封装,用于与后端API交互
import { CreateCommentDTO, MainComment } from '~/types/comment';
import { defHttp } from '~/utils/http';
// import pool from './pool'; // 导入连接池实例
//params-》参数
///api/comments 是前端应用向后端服务器发送请求的 API 端点路径，用于获取或提交评论数据。
// 这个路径对应后端服务器上处理评论功能的接口，通常由后端开发人员定义。
// 获取评论列表

//process.env

// const request = axios.create({
//   baseURL: 'http://localhost:3001',
// })
// 获取评论列表（增加帖子ID参数）
export const getComments = async (postId: number, params?: {
  parent_id?: number | null;
  include_deleted?: boolean;
}): Promise<MainComment[]> => {
  try {
    console.log('发送获取评论请求，参数:', params);
    const data = await defHttp.get({
      url: '/comments',
      params
    });
    console.log('API 原始返回数据:', data);

    // 兼容各种后端返回格式
    const comments = Array.isArray(data)
      ? data
      : (data.result || data.data || data.comments || []);
    console.log('处理后的评论数组:', comments);

    return comments as MainComment[];
  } catch (error) {
    console.error('获取评论失败:', error);
    throw error;
  }
};

// 获取单个评论详情
export const getCommentById = async (commentId: number): Promise<MainComment> => {
  try {
    const data = await defHttp.get({
      url: `/comments/${commentId}`
    });
    return data as MainComment;
  } catch (error) {
    console.error('获取评论详情失败:', error);
    throw error;
  }
};

// 提交评论(支持文件上传)
export const saveComment = async (commentData: CreateCommentDTO) => {
  try {
    // 构建请求数据 - 确保字段名与后端一致
    const requestData = {
      content: commentData.content,
      userId: commentData.user_id,
      parentId: commentData.parent_id || null
    };

    console.log('发送评论数据:', requestData);

    const data = await defHttp.post({
      url: '/comments',
      data: requestData
    });
    return data as MainComment;
  } catch (error) {
    console.error('提交评论失败:', error);
    throw error;
  }
};

// 删除评论
export const deleteComment = async (commentId: number) => {
  try {
    await defHttp.delete({
      url: `/comments/${commentId}`
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

// 更新评论
export const updateComment = async (
  commentId: number,
  updatedData: Partial<MainComment>
) => {
  try {
    const data = await defHttp.patch({
      url: `/comments/${commentId}`,
      data: updatedData
    });
    return data as MainComment;
  } catch (error) {
    console.error('更新评论失败:', error);
    throw error;
  }
};

// 点赞评论
export const toggleLike = async (commentId: number, userId: number) => {
  try {
    const data = await defHttp.post({
      url: `/comments/${commentId}/like`,
      data: { userId: userId }
    });
    return data;
  } catch (error) {
    console.error('操作点赞失败:', error);
    throw error;
  }
};

// 取消点赞
export const unlikeComment = async (commentId: number, userId: number) => {
  try {
    const data = await defHttp.delete({
      url: `/comments/${commentId}/like`,
      data: { userId: userId }
    });
    return data;
  } catch (error) {
    console.error('取消点赞失败:', error);
    throw error;
  }
};

// 获取特定帖子的评论
export const getCommentsByPost = async (postId: number): Promise<MainComment[]> => {
  try {
    const data = await defHttp.get({
      url: `/comments/post/${postId}`
    });
    return data as MainComment[];
  } catch (error) {
    console.error('获取帖子评论失败:', error);
    throw error;
  }
};

export const getCommentDetail = async (commentId: number) => {
  const data = await defHttp.get({
    url: `/comments/${commentId}`
  });
  // 只返回 result 字段，兼容后端返回格式
  return data.result || data.data || data;
};
