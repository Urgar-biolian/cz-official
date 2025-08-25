<template>
  <div id="h">
    <CommentSection 
      :current-user="currentUser" 
      :initial-comments="comments" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CommentSection from '~/pages/comment/CommentSection.vue';
import type { MainComment, User } from '~/types/comment';
import { getComments } from '~/api/commentApi';

const currentUser = ref<User>({
  userId: 1,
  username: '当前用户',
  avatar: 'https://i.pravatar.cc/150?img=3'
});

const comments = ref<MainComment[]>([]);

onMounted(async () => {
  try {
    // 调用 API 获取评论数据
    const data = await getComments(1);
    comments.value = data as MainComment[];
  } catch (error) {
    console.error('获取评论数据失败:', error);
  }
});
</script>

<style>
#h {
  max-width: 1000px;
  margin: 0 auto ;
  padding: 20px;
  font-family: Arial, sans-serif;
  /* background-color: #f8f9fa; */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>