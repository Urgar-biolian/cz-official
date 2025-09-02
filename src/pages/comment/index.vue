<template>
  <div class="comment-page">
    <CommentForm v-if="showCommentForm" @submitted="handleCommentSubmitted" @cancelled="handleCancelComment" />

    <div class="comments-list">
      <CommentSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CommentForm from './CommentForm.vue';
import CommentSection from './CommentSection.vue';

const showCommentForm = ref(false);

function handleCommentSubmitted() {
  showCommentForm.value = false;
  window.location.reload();
}

function handleCancelComment() {
  showCommentForm.value = false;
}
</script>

<style scoped>
.comment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.comments-list {
  margin-top: 20px;
}
</style>
