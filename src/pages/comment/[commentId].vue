<template>
  <div class="comment-detail">
    <div v-if="!showCommentForm" class="detail-header">
      <button class="add-comment-btn" @click="showCommentForm = true">
        <i class="icon-edit"></i> 发表评论
      </button>
    </div>
    <CommentForm v-if="showCommentForm" @submitted="handleCommentSubmitted" @cancelled="handleCancelComment" />
    <CommentItem v-else-if="mainComment" :comment="mainComment" :current-user-id="currentUserId" :show-replies="true" :full-content="true" @delete="handleDeleteComment" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getCommentDetail } from '~/api/commentApi';
import { useUserStore } from '~/store/user';
import CommentItem from './CommentItem.vue';
import CommentForm from './CommentForm.vue';

const route = useRoute();
const mainComment = ref(null);
const showCommentForm = ref(false);

const userStore = useUserStore();
const currentUserId = computed(() => {
  const userInfo = userStore.getUserInfo;
  return userInfo && 'userId' in userInfo ? parseInt(userInfo.userId) : 0;
});

onMounted(async () => {
  const commentId = Number(route.params.commentId);
  mainComment.value = await getCommentDetail(commentId);
  console.log('详情页获取到的数据火火恍恍惚惚:', mainComment.value);
});

function handleCommentSubmitted() {
  showCommentForm.value = false;
  // 可选：刷新评论详情
  const commentId = Number(route.params.commentId);
  getCommentDetail(commentId).then(res => mainComment.value = res);
}
function handleCancelComment() {
  showCommentForm.value = false;
}

function handleDeleteComment(commentId: number) {
  // 删除评论后自动刷新详情
  import('~/api/commentApi').then(({ deleteComment, getCommentDetail }) => {
    deleteComment(commentId).then(() => {
      const commentIdNum = Number(route.params.commentId);
      getCommentDetail(commentIdNum).then(res => {
        // 递归过滤已删除的子评论
        function filterDeleted(comment: any) {
          if (!comment) return null;
          if (comment.isDeleted) return null;
          if (comment.replies && Array.isArray(comment.replies)) {
            comment.replies = comment.replies
              .map(filterDeleted)
              .filter(Boolean);
          }
          return comment;
        }
        mainComment.value = filterDeleted(res);
        // 用户提示
        alert('评论删除成功');
      });
    });
  });
}
</script>

<style scoped>
.comment-detail {
  max-width: 1000px;
  margin: 4px auto 0 auto;
  padding: 36px 28px;
  background: #f4f6fa;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.10);
  min-height: 600px;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
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
  margin-bottom: 24px;
}

.add-comment-btn:hover {
  background: linear-gradient(90deg, #40a9ff 0%, #1890ff 100%);
}

.detail-header {
  display: flex;
  justify-content: flex-end;
}

.comment-content {
  display: block;
  line-height: 1.7;
  font-size: 15px;
  color: #333;
  word-break: break-word;
  text-align: left;
}
</style>