<template>
  <div class="forum-container">
    <div class="forum-layout">
      <!-- 头部：标题与操作 -->
      <header class="forum-header">
        <div class="header-left">
          <h1 class="forum-title">讨论区</h1>
          <p class="forum-desc">分享技术灵感，探讨前沿问题</p>
        </div>
        <div class="header-right">
          <button class="new-topic-btn" @click="showCommentForm = true">
            New discussion
          </button>
        </div>
      </header>

      <div class="forum-main-wrapper">
        <!-- 左侧边栏 -->
        <aside class="forum-sidebar">
          <h3 class="sidebar-title">Categories</h3>
          <ul class="nav-list">
            <li class="nav-item active">
              <div class="nav-item-content">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M1.5 2.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-3.5a.75.75 0 00-.53.22L3.5 11.44V9.25a.75.75 0 00-.75-.75h-1a.25.25 0 01-.25-.25v-5.5zM1.75 1A1.75 1.75 0 000 2.75v5.5C0 9.216.784 10 1.75 10H2v1.543a1.457 1.457 0 002.487 1.03L7.061 10h3.189A1.75 1.75 0 0012 8.25v-5.5A1.75 1.75 0 0010.25 1h-8.5zM14.5 4.75a.25.25 0 00-.25-.25h-.5a.75.75 0 110-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0114.25 12H14v1.543a1.457 1.457 0 01-2.487 1.03L8.939 12H6.75a.75.75 0 110-1.5h2.189a.25.25 0 00.177-.073l2.384-2.384V9.75a.75.75 0 00.75.75h2a.25.25 0 00.25-.25v-5.5z"></path></svg>
                全部讨论
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-item-content">
                <span style="width: 16px; height: 16px; display: inline-block; border-radius: 50%; background-color: #2da44e;"></span>
                官方公告
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-item-content">
                <span style="width: 16px; height: 16px; display: inline-block; border-radius: 50%; background-color: #bf8700;"></span>
                赛事交流
              </div>
            </li>
            <li class="nav-item">
              <div class="nav-item-content">
                <span style="width: 16px; height: 16px; display: inline-block; border-radius: 50%; background-color: #0969da;"></span>
                技术分享
              </div>
            </li>
          </ul>
        </aside>

        <!-- 主内容区 -->
        <main class="forum-main">
          <div class="feed-filters">
            <span style="font-size: 14px; font-weight: 600;" class="text-gray-900 dark:text-white">Discussions</span>
            <select class="filter-select">
              <option>Newest</option>
              <option>Top</option>
            </select>
          </div>
          <CommentForm v-if="showCommentForm" @submitted="handleCommentSubmitted" @cancelled="handleCancelComment" />
          <CommentSection />
        </main>
      </div>
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
.forum-container {
  min-height: 100vh;
  @apply text-gray-800 dark:text-gray-200 bg-transparent pt-8 pb-20;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
}

.forum-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 24px;
  @apply border-b border-gray-200 dark:border-gray-800;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.forum-title {
  font-size: 24px;
  font-weight: 400;
  @apply text-gray-900 dark:text-white;
  margin: 0;
}

.forum-desc {
  font-size: 14px;
  @apply text-gray-500 dark:text-gray-400;
  margin: 0;
}

.new-topic-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  @apply bg-[#138AFA] text-white hover:bg-[#138AFA]/90;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 0 rgba(27, 31, 36, 0.1);
}

/* Main Layout (Sidebar + Content) */
.forum-main-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .forum-main-wrapper {
    flex-direction: row;
  }
}

/* Sidebar */
.forum-sidebar {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .forum-sidebar {
    width: 256px;
  }
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  @apply text-gray-900 dark:text-white;
  margin-bottom: 8px;
  padding-left: 8px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 6px;
  @apply text-gray-600 dark:text-gray-400;
  cursor: pointer;
  font-size: 14px;
}

.nav-item:hover {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200;
}

.nav-item.active {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-count {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-item:hover .tab-count {
  @apply bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600;
}

.nav-item.active .tab-count {
  @apply bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600;
}

/* Main Content */
.forum-main {
  flex-grow: 1;
  min-width: 0;
}

/* Header Filters */
.feed-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  @apply border-b border-gray-200 dark:border-gray-800;
}

.filter-select {
  @apply bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 6px;
  outline: none;
  box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04);
}
</style>
