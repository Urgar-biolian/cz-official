<template>
  <div class="comment-section">
    <!-- 评论标题（显示评论数量） -->
    <div class="comment-header" v-if="!showCommentForm">
      <h2>评论 ({{ comments.length }})</h2>
      <button @click="showCommentForm = true" class="add-comment-btn">
        <i class="icon-edit"></i> 发表评论
      </button>
    </div>

    <!-- 评论表单 -->
    <transition name="fade">
      <CommentForm v-if="showCommentForm" :parent-id="replyTargetId || undefined" @submitted="handleCommentSubmitted"
        @cancelled="handleCancelComment" />
    </transition>

    <template v-if="!showCommentForm">
      <!-- 加载状态 -->
      <div v-if="isLoading && comments.length === 0" class="loading-container">
        <Spin />
        <p>加载评论中...</p>
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
        <i class="icon-comment"></i>
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
    </template>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <i class="icon-error"></i>
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

// 直接获取评论列表，不使用 storeToRefs
const comments = computed(() => commentStore.comments);

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
const parentComments = computed(() =>
  comments.value.filter(c => !c.parentId && !c.isDeleted)
);

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
  max-width: 1200px;
  margin: 20px auto;
  padding: 16px 8px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f0fa 100%);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.08);
  min-height: 900px;
  display: block;
  box-sizing: border-box;
}

@media (min-width: 600px) {
  .comment-section {
    padding: 20px 25px;
  }
}
@media (min-width: 900px) {
  .comment-section {
    padding: 20px 40px;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 15px;
  border-bottom: 1.5px solid #e6e6e6;
}

.comment-header h2 {
  margin: 0;
  color: #222;
  font-size: 1.7rem;
  letter-spacing: 1px;
}

.add-comment-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
  transition: background 0.2s;
}

.add-comment-btn:hover {
  background: linear-gradient(90deg, #40a9ff 0%, #1890ff 100%);
}

.comment-list {
  max-height: 600px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
}

.comment-list .comment-item+.comment-item {
  border-top: 2px solid #e6e6e6;
  margin-top: 32px;
  padding-top: 32px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #666;
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
  color: #999;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  margin-top: 16px;
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 4px;
  font-size: 14px;
}

.retry-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.retry-btn:hover {
  background: #e74c3c;
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

.comment-item {
  margin-bottom: 24px;
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(255,255,255,0.6); /* 半透明白，或直接 background: none; */
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.06);
  border: 1.5px solid #e6e6e6;
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;
}

.is-reply {
  background: rgba(230, 247, 255, 0.5); /* 更淡的蓝色 */
  margin-left: 36px;
  border-left: 4px solid #91d5ff;
  box-shadow: none;
  border: 1.5px solid #e6f7ff;
}

.comment-content {
  margin: 12px 0 8px 0;
  line-height: 1.7;
  font-size: 15px;
  color: #222;
  word-break: break-word;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.like-btn, .reply-btn, .edit-btn, .delete-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  padding: 4px 14px;
  font-size: 1em;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.like-btn.liked svg path {
  fill: #ff4d4f;
}

.like-btn:hover, .reply-btn:hover, .edit-btn:hover, .delete-btn:hover {
  background: #e6f7ff;
  color: #096dd9;
}

.comment-form {
  max-width: 100%;
  width: 100%;
  padding: 16px 4px;
  font-size: 16px;
}

.editor-input {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

@media (min-width: 600px) {
  .comment-form {
    max-width: 600px;
    padding: 24px 16px;
    font-size: 17px;
  }
  .editor-input {
    min-width: 400px;
  }
}
@media (min-width: 900px) {
  .comment-form {
    max-width: 900px;
    padding: 36px 80px;
    font-size: 18px;
  }
  .editor-input {
    min-width: 600px;
  }
}
</style>
