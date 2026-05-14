<template>
  <div class="comment-section">
    <!-- 评论表单 -->
    <transition name="fade">
      <CommentForm v-if="showCommentForm" :parent-id="replyTargetId || undefined" @submitted="handleCommentSubmitted"
        @cancelled="handleCancelComment" />
    </transition>

    <template v-if="!showCommentForm">
      <!-- 评论列表头 -->
      <div class="feed-header">
        <span class="feed-title">最新讨论 ({{ Array.isArray(comments) ? comments.length : 0 }})</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading && (!Array.isArray(comments) || comments.length === 0)" class="loading-container">
        <Spin />
        <p>加载讨论中...</p>
      </div>

      <!-- 评论列表 -->
      <div v-else-if="parentComments.length > 0" class="comment-list">
        <CommentItem
          v-for="comment in parentComments"
          :key="comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @like="handleLikeComment"
          @delete="handleDeleteComment"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <p>暂无讨论，快来发起第一个话题吧！</p>
      </div>
    </template>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span>{{ error }}</span>
      <button @click="retryLoad" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCommentStore } from '~/store/commentStore';
import { useUserStore } from '~/store/user';
import CommentItem from './CommentItem.vue';
import CommentForm from './CommentForm.vue';
import Spin from './Spin.vue';
import type { MainComment } from '~/types/comment';

// 从 store 获取状态和方法
const commentStore = useCommentStore();
const userStore = useUserStore();

const {
  isLoading,        // 加载状态
  error              // 错误信息
} = storeToRefs(commentStore);

// 直接获取评论列表，不使用 storeToRefs，确保总是返回数组
const comments = computed(() => commentStore.comments || []);

const {
  loadComments,      // 加载评论
  deleteComment,     // 删除评论
  updateComment,     // 更新评论
  likeComment        // 点赞评论
} = commentStore;

// 获取当前用户ID
const currentUserId = computed(() => {
  const userInfo = userStore.getUserInfo;
  return userInfo && 'userId' in userInfo ? parseInt(userInfo.userId) : 0;
});

// 本地状态
const showCommentForm = ref(false);
const replyTargetId = ref<number | null>(null);

// 只显示父级评论
const parentComments = computed(() => {
  const commentsArray = comments.value;
  // 确保 commentsArray 是数组
  if (!Array.isArray(commentsArray)) {
    console.warn('comments.value 不是数组:', commentsArray);
    return [];
  }
  return commentsArray.filter(c => !c.parentId && !c.isDeleted);
});

// 组件挂载时加载评论
onMounted(async () => {
  try {
    console.log('CommentSection 组件挂载，开始加载评论...');
    await loadComments();
    console.log('评论加载完成，store中的评论数量:', commentStore.comments.length);
    console.log('computed comments 的值:', comments.value);
    console.log('computed comments 的长度:', comments.value?.length);
  } catch (error) {
    console.error('加载评论失败:', error);
  }
});

// 处理设置回复目标
const handleSetReplyTarget = (commentId: number) => {
  replyTargetId.value = commentId;
  showCommentForm.value = true;
  commentStore.setReplyTarget(commentId);
};

// 处理取消评论
const handleCancelComment = () => {
  showCommentForm.value = false;
  replyTargetId.value = null;
  commentStore.clearReplyTarget();
};

// 处理评论提交成功
const handleCommentSubmitted = (newComment: MainComment) => {
  console.log('新评论提交成功:', newComment);
  showCommentForm.value = false;
  replyTargetId.value = null;
  commentStore.clearReplyTarget();

  // 重新加载评论列表以确保数据同步
  setTimeout(() => {
    loadComments();
  }, 100);
};

// 处理删除评论
const handleDeleteComment = async (commentId: number) => {
  try {
    await deleteComment(commentId);
    // 删除后自动刷新评论列表，确保和后端同步
    await loadComments();
    console.log('评论删除成功:', commentId);
  } catch (error) {
    console.error('删除评论失败:', error);
  }
};

// 处理更新评论
const handleUpdateComment = async (comment: MainComment) => {
  try {
    await updateComment(comment);
    console.log('评论更新成功:', comment);
  } catch (error) {
    console.error('更新评论失败:', error);
  }
};

// 处理点赞评论
const handleLikeComment = (commentId:any) => {
  commentStore.likeComment(commentId);
};

// 重试加载
const retryLoad = () => {
  loadComments();
};
</script>

<style scoped>
.comment-section {
  width: 100%;
  display: block;
  box-sizing: border-box;
}

.feed-header {
  display: none; /* Hide the old feed header since we have tabs now */
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Custom scrollbar */
.comment-list::-webkit-scrollbar {
  width: 6px;
}
.comment-list::-webkit-scrollbar-track {
  background: transparent;
}
.comment-list::-webkit-scrollbar-thumb {
  @apply bg-gray-200 dark:bg-gray-700;
  border-radius: 4px;
}
.comment-list::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300 dark:bg-gray-600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  @apply text-gray-500 dark:text-gray-400;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
}

.loading-container p {
  margin-top: 10px;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  @apply text-gray-500 dark:text-gray-400;
  text-align: center;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  @apply dark:border-gray-700;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  @apply text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30;
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.retry-btn {
  margin-left: auto;
  padding: 4px 12px;
  @apply bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  @apply bg-red-500 text-white;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
