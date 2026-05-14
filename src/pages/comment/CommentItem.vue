<!-- 评论区部分 -->
<template>
  <div class="comment-item" :class="[{ 'is-reply': isReplyComment }, topRankClass]">
    <div v-if="rank && rank <= 3" class="top-rank-badge">
      <span v-if="rank === 1">🥇</span>
      <span v-else-if="rank === 2">🥈</span>
      <span v-else-if="rank === 3">🥉</span>
      TOP{{ rank }}
    </div>
    <div v-if="!showReplyForm">
      <!-- 评论头部和内容 -->
      <div class="comment-header">
        <img
          :src="avatarUrl"
          class="avatar"
          :alt="comment.user?.username || '未知用户'"
        />
        <span class="author-name">{{ comment.user?.username || '未知用户' }}</span>
        <span class="comment-date">
          {{ comment.createdAt ? formatDate(new Date(comment.createdAt)) : '未知时间' }}
        </span>
      </div>
      <div
        class="comment-content"
        :class="{ 'comment-ellipsis': !props.fullContent }"
        @click="goToDetail"
        style="cursor:pointer;text-align:left;"
      >
        <div v-html="safeContent"></div>
      </div>
      <div class="comment-actions">
        <button
          class="like-btn"
          :class="{ liked: isLiked }"
          @click="handleLike"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path :fill="isLiked ? '#ff4d4f' : '#8f959e'"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span class="like-count">{{ comment.likeCount }}</span>
        </button>
        <span class="reply-count">
          <svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align: middle;">
            <path fill="#8f959e" d="M10 9V5l-7 7 7 7v-4.1c4.55 0 7.72 1.95 9.72 6.1-1.43-5.72-5.19-10-9.72-10z" />
          </svg>
          {{ comment.replyCount || (comment.replies ? comment.replies.length : 0) }} 回复
        </span>
        <button v-if="!isReplyComment && isInDetailPage" class="reply-btn" @click="showReplyForm = true">
          回复
        </button>
        <button v-if="isAuthor" class="delete-btn" @click="handleDelete">
          删除
        </button>
      </div>
      <div v-if="props.showReplies && comment.replies && comment.replies.length > 0" class="replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :current-user-id="currentUserId"
          :show-replies="true"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
    <CommentForm v-else :parent-id="comment.id" @submitted="handleReplySubmitted" @cancelled="handleReplyCancelled" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MainComment } from '~/types/comment';
import { deleteComment, updateComment } from '~/api/commentApi';
import { useRouter, useRoute } from 'vue-router';
import CommentForm from './CommentForm.vue';
import DOMPurify from 'dompurify';
import defaultAvatar from '~/assets/icon/default-avatar.png';

const safeContent = computed(() => DOMPurify.sanitize(props.comment.content));

const props = defineProps<{
  comment: MainComment;
  currentUserId: number;
  showReplies?: boolean;
  rank?: number; // 新增
  fullContent?: boolean; // 新增
}>();

const emit = defineEmits<{
  (e: 'reply', commentId: number): void;
  (e: 'update', comment: MainComment): void;
  (e: 'delete', commentId: number): void;
  (e: 'like', commentId: number): void;
}>();

const router = useRouter();
const route = useRoute();
const showReplyForm = ref(false);
const isInDetailPage = computed(() => route.name === 'comment-commentId' || route.path.startsWith('/comment/'));

// 判断是否为回复
const isReplyComment = computed(() => {
  return props.comment.parentId !== null && props.comment.parentId !== undefined;
});

// 判断当前用户是否为评论作者
const isAuthor = computed(() => {
  return props.comment.userId === props.currentUserId;
});

// 判断当前用户是否已点赞
const isLiked = computed(() => {
  return props.comment.likes?.some(like => like.userId === props.currentUserId);
});

// 头像地址，优先用用户头像，否则用默认头像
const avatarUrl = computed(() => {
  return props.comment.user?.avatar || defaultAvatar;
});

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 处理回复
const handleReply = () => {
  emit('reply', props.comment.id);
};

// 处理删除
const handleDelete = async () => {
  if (!confirm('确定要删除这条评论吗？')) {
    return;
  }

  try {
    await deleteComment(props.comment.id);
    emit('delete', props.comment.id);
    console.log('评论删除成功');
  } catch (error) {
    console.error('删除评论失败:', error);
    alert('删除失败，请重试');
  }
};

// 处理更新（用于子评论）
const handleUpdate = (updatedComment: MainComment) => {
  emit('update', updatedComment);
};

// 处理点赞（用于子评论）
const handleLike = async () => {
  emit('like', props.comment.id);
};

const goToDetail = () => {
  router.push(`/comment/${props.comment.id}`);
};

function handleReplySubmitted() {
  showReplyForm.value = false;
  // 可选：刷新当前评论树
  emit('update', props.comment);
}

function handleReplyCancelled() {
  showReplyForm.value = false;
}

const topRankClass = computed(() => {
  if (!props.rank) return '';
  if (props.rank === 1) return 'top1';
  if (props.rank === 2) return 'top2';
  if (props.rank === 3) return 'top3';
  return '';
});
</script>
<style scoped>
.comment-item {
  padding: 16px;
  border-radius: 6px;
  @apply bg-white dark:bg-[#0d1117];
  border: 1px solid rgba(27, 31, 36, 0.15);
  @apply dark:border-gray-700;
  transition: all 0.2s ease;
  position: relative;
}

.comment-item:hover {
  @apply border-gray-300 dark:border-gray-600;
}

:deep(.comment-item:not(.is-reply)) {
  @apply bg-white dark:bg-[#0d1117];
}

.is-reply {
  @apply bg-transparent dark:bg-transparent;
  margin-left: 32px;
  margin-top: 16px;
  padding: 16px 0 0 0;
  border: none;
  border-top: 1px solid rgba(27, 31, 36, 0.15);
  @apply dark:border-gray-700;
  border-radius: 0;
}

.is-reply:hover {
  @apply bg-transparent border-t border-gray-200 dark:border-gray-700;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  @apply border border-gray-200 dark:border-gray-700;
}

.author-name {
  font-weight: 600;
  margin-right: 8px;
  @apply text-gray-900 dark:text-white;
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  @apply text-gray-500 dark:text-gray-400;
}

.comment-content {
  display: block;
  line-height: 1.5;
  font-size: 14px;
  @apply text-gray-900 dark:text-gray-100;
  word-break: break-word;
  text-align: left;
  margin-left: 36px; /* Align with text, not avatar */
}

.comment-content.comment-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.reply-btn {
  background: none;
  border: none;
  @apply text-gray-500 dark:text-gray-400;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.action-btn:hover {
  color: #138AFA;
}

.reply-form {
  margin-top: 16px;
  margin-left: 36px;
}

.replies {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.reply-item {
  margin-top: 0;
}

.comment-actions {
  margin-top: 8px;
  margin-left: 36px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  @apply text-gray-500 dark:text-gray-400 hover:text-red-500;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.like-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  @apply text-gray-500 dark:text-gray-400;
}
.action-btn:hover {
  color: #138AFA;
}

.like-btn.liked svg path {
  fill: #ef4444;
}

.like-count {
  font-size: 12px;
  font-weight: 500;
  transition: color 0.2s;
}

.like-btn.liked .like-count {
  @apply text-red-500;
}

.reply-count {
  display: none; /* Hide in GitHub style, it's visually implied by the replies thread */
}

.top-rank-badge {
  position: absolute;
  left: -12px;
  top: 12px;
  font-weight: bold;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ffd700 0%, #b8860b 100%);
  color: #fff;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}
.comment-item.top1 { @apply border-yellow-400; }
.comment-item.top2 { @apply border-gray-400; }
.comment-item.top3 { @apply border-orange-400; }

.comment-detail {
  position: relative;
}
</style>
