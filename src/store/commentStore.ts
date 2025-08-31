import { defineStore } from "pinia";
import { saveComment, getComments, deleteComment, updateComment, toggleLike } from '~/api/commentApi';
import type { CreateCommentDTO, MainComment } from "~/types/comment";
import { useUserStore } from '~/store/user';
import axios from "axios";
import type { UserInfo } from '#/data';

function isUserInfo(obj: any): obj is UserInfo {
  return obj && typeof obj === 'object' && 'userId' in obj && obj.userId !== undefined && obj.userId !== null;
}

// saveComment: 提交新评论到后端
// getComments: 从后端获取评论列表
export const useCommentStore = defineStore('comments', {
  state: () => ({
    comments: [] as MainComment[],
    replyTarget: null as number | null, // 当前回复的评论ID
    // currentUserId: 1,//获取用户实际id
    // currentPostId: null as number | null, // 新增
    // currentUserName: null as string | null, // 新增
    isLoading: false,
    error: null as string | null,
    uploadProgress: 0
  }),
  actions: {
    // 初始化当前内容（在进入帖子页时调用）
    // initContext(userId: number, userName: string) {
    //   // this.currentPostId = postId;
    //   this.currentUserId = userId;
    //   this.currentUserName = userName;
    // },

    // 清除回复目标
    clearReplyTarget() {
      this.replyTarget = null;
    },

    async loadComments() {
      this.isLoading = true;
      this.error = null;
      try {
        console.log('开始加载评论...');
        const data = await getComments(1, {
          include_deleted: false
        });
        console.log('API返回的评论数据:', data);
        this.comments = data as MainComment[];
        console.log('Store中的评论数量:', this.comments.length);
        console.log('Store中的评论数据:', this.comments);
      } catch (error) {
        console.error('加载评论失败:', error);
        this.error = '加载评论失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 提交评论
    async submitComment(
      content: string,
      // blogId: number,
      files?: File[]
    ) {
      if (!content.trim()) return; // 空内容检查

      const userStore = useUserStore();
      const userInfo = userStore.getUserInfo;
      if (!isUserInfo(userInfo)) {
        this.error = '请先登录';
        throw new Error('未登录');
      }

      const commentData: CreateCommentDTO = {
        content,
        //  post_id: this.currentPostId,
        user_id: parseInt(userInfo.userId),
        parent_id: this.replyTarget || undefined,
      };

      this.isLoading = true;
      this.error = null;
      try {
        await saveComment(commentData);
        this.replyTarget = null;
        await this.loadComments(); // 刷新列表
      } catch (error) {
        this.error = '提交评论失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 删除评论
    async deleteComment(commentId: number) {
      this.error = null;
      try {
        await deleteComment(commentId);
        // 立即从本地移除，无需刷新页面
        this.comments = this.comments.filter(c => c.id !== commentId && c.parentId !== commentId);
        // 递归移除所有后代
        let removed = true;
        while (removed) {
          removed = false;
          const ids = this.comments.map(c => c.id);
          const toRemove = this.comments.filter(c => c.parentId && !ids.includes(c.parentId));
          if (toRemove.length > 0) {
            this.comments = this.comments.filter(c => !toRemove.includes(c));
            removed = true;
          }
        }
        // 重新组装树
        this.comments = buildCommentTree(this.comments);
      } catch (error) {
        this.error = '删除评论失败';
        throw error;
      }
    },

    // 递归移除评论及其所有子评论
    removeCommentById(commentId: number) {
      // 先移除主评论
      this.comments = this.comments.filter(c => c.id !== commentId);
      // 再递归移除所有子评论
      this.comments = this.comments.filter(c => c.parentId !== commentId);
      // 如果有多级嵌套，可以递归调用
      // 也可以用 while 循环递归移除所有后代
      let removed = true;
      while (removed) {
        removed = false;
        const ids = this.comments.map(c => c.id);
        const toRemove = this.comments.filter(c => c.parentId && !ids.includes(c.parentId));
        if (toRemove.length > 0) {
          this.comments = this.comments.filter(c => !toRemove.includes(c));
          removed = true;
        }
      }
    },

    // 更新评论
    async updateComment(comment: MainComment) {
      this.error = null;
      try {
        await updateComment(comment.id!, { content: comment.content });
        await this.loadComments(); // 刷新列表
      } catch (error) {
        this.error = '更新评论失败';
        throw error;
      }
    },

    // 点赞评论
    async likeComment(commentId: number) {
      this.error = null;
      const userStore = useUserStore();
      const userInfo = userStore.getUserInfo;
      if (!isUserInfo(userInfo)) {
        this.error = '请先登录';
        throw new Error('未登录');
      }
      try {
        await toggleLike(commentId, parseInt(userInfo.userId));
        await this.loadComments(); // 刷新列表
      } catch (error) {
        this.error = '点赞失败';
        throw error;
      }
    },

    // 设置回复目标
    setReplyTarget(commentId: number | null) {
      this.replyTarget = commentId;
    },

    // 清除错误
    clearError() {
      this.error = null;
    },

    // 直接添加评论到状态（不重新加载）
    addComment(comment: MainComment) {
      this.comments.unshift(comment);
    },

    // 更新评论列表中的特定评论
    updateCommentInList(commentId: number, updates: Partial<MainComment>) {
      const index = this.comments.findIndex((c: any) => c.id === commentId);
      if (index !== -1) {
        this.comments[index] = { ...this.comments[index], ...updates };
      }
    },

    // 只标记为已删除
    markCommentDeleted(commentId: number) {
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) comment.isDeleted = true;
    },

    removeCommentRecursively(commentList: any[], commentId: number) {
      for (let i = commentList.length - 1; i >= 0; i--) {
        const comment = commentList[i];
        if (comment.id === commentId) {
          commentList.splice(i, 1);
        } else if (comment.replies && comment.replies.length > 0) {
          this.removeCommentRecursively(comment.replies, commentId);
        }
      }
    },

    removeCommentInTree(commentList: any[], commentId: number) {
      if (!Array.isArray(commentList)) return;
      for (let i = commentList.length - 1; i >= 0; i--) {
        const comment = commentList[i];
        if (comment.id === commentId) {
          commentList.splice(i, 1);
        } else if (comment.replies && comment.replies.length > 0) {
          this.removeCommentInTree(comment.replies, commentId);
        }
      }
    },

    removeCommentDeep(list: any[], commentId: number): any[] {
      return list
        .filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? this.removeCommentDeep(comment.replies, commentId) : []
        }));
    }
  }
})

// 工具函数：一维数组转树
function buildCommentTree(flatList: any[]): any[] {
  const idMap = new Map();
  flatList.forEach(item => {
    item.replies = [];
    idMap.set(item.id, item);
  });
  const tree: any[] = [];
  flatList.forEach(item => {
    if (item.parentId && idMap.has(item.parentId)) {
      idMap.get(item.parentId).replies.push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}
