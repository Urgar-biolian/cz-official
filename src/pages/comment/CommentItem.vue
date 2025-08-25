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
            <path :fill="isLiked ? '#ff4d4f' : '#bbb'"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span class="like-count">{{ comment.likeCount }}</span>
        </button>
        <span class="reply-count">
          <svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align: middle;">
            <path fill="#bbb" d="M10 9V5l-7 7 7 7v-4.1c4.55 0 7.72 1.95 9.72 6.1-1.43-5.72-5.19-10-9.72-10z" />
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
  margin-bottom: 24px;
  padding: 20px 24px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s;
  position: relative;
}

.comment-item+.comment-item {
  border-top: 2px solid #e6e6e6;
  margin-top: 32px;
  padding-top: 32px;
}

:deep(.comment-item:not(.is-reply)) {
  background-color: #fff;
}

.is-reply {
  background-color: #f7f9fa;
  margin-left: 36px;
  border-left: 3px solid #e6e6e6;
  box-shadow: none;
  border: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 1.5px solid #e6e6e6;
}

.author-name {
  font-weight: bold;
  margin-right: 10px;
  color: #222;
  font-size: 16px;
}

.comment-date {
  font-size: 0.9em;
  color: #888;
}

.comment-content {
  display: block;
  line-height: 1.7;
  font-size: 15px;
  color: #333;
  word-break: break-word;
  text-align: left;
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
  color: #1890ff;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 0.95em;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.reply-btn:hover {
  background: #e6f7ff;
  color: #096dd9;
}

.reply-form {
  margin-top: 10px;
}

.replies {
  margin-top: 18px;
  border-left: 2px solid #e6e6e6;
  padding-left: 18px;
}

.reply-item {
  margin-top: 10px;
}

.comment-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 0.95em;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.edit-btn:hover,
.delete-btn:hover {
  background: #f5f5f5;
  color: #d4380d;
}

.like-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0 4px;
}

.like-btn.liked svg path {
  fill: #ff4d4f;
}

.like-count {
  margin-left: 4px;
  font-size: 15px;
  color: #bbb;
  transition: color 0.2s;
}

.like-btn.liked .like-count {
  color: #ff4d4f;
}

.reply-count {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #888;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 2px 8px;
  margin-left: 4px;
}

.top-rank-badge {
  position: absolute;
  left: -12px;
  top: 12px;
  font-weight: bold;
  font-size: 15px;
  padding: 2px 10px;
  border-radius: 8px;
  background: linear-gradient(90deg, #ffd700 0%, #fffbe6 100%);
  color: #b8860b;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.08);
}
.comment-item.top1 { border: 2px solid #ffd700; }
.comment-item.top2 { border: 2px solid #c0c0c0; }
.comment-item.top3 { border: 2px solid #cd7f32; }

.comment-detail {
  position: relative;
  /* 其它样式不变 */
}
</style>
