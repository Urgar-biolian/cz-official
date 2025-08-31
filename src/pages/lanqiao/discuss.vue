<template>
  <div class="discuss-container">
    <!-- 页面标题 -->
    <div class="discuss-header">
      <h1 class="discuss-title">蓝桥杯讨论区</h1>
      <p class="discuss-subtitle">分享经验，交流心得，共同进步</p>
    </div>

    <!-- 功能按钮区 -->
    <div class="discuss-actions">
      <button class="action-btn primary" @click="showNewPostModal = true">
        <i class="icon-plus"></i>
        发布新话题
      </button>
      <button class="action-btn" @click="goBack">
        <i class="icon-back"></i>
        返回蓝桥页面
      </button>
    </div>

    <!-- 话题分类 -->
    <div class="topic-categories">
      <div 
        v-for="category in categories" 
        :key="category.id"
        :class="['category-tab', { active: selectedCategory === category.id }]"
        @click="selectedCategory = category.id"
      >
        {{ category.name }}
        <span class="category-count">({{ category.count }})</span>
      </div>
    </div>

    <!-- 讨论话题列表 -->
    <div class="discuss-list">
      <div v-if="filteredTopics.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>暂无讨论话题</h3>
        <p>成为第一个发起讨论的人吧！</p>
        <button class="action-btn primary" @click="showNewPostModal = true">
          发布话题
        </button>
      </div>
      
      <div v-else>
        <div 
          v-for="topic in filteredTopics" 
          :key="topic.id" 
          class="topic-card"
          @click="viewTopic(topic.id)"
        >
          <div class="topic-header">
            <div class="topic-category-badge" :class="getCategoryClass(topic.categoryId)">
              {{ getCategoryName(topic.categoryId) }}
            </div>
            <div class="topic-meta">
              <span class="topic-author">{{ topic.author }}</span>
              <span class="topic-time">{{ formatTime(topic.createdAt) }}</span>
            </div>
          </div>
          
          <h3 class="topic-title">{{ topic.title }}</h3>
          <p class="topic-preview">{{ topic.preview }}</p>
          
          <div class="topic-stats">
            <span class="stat-item">
              <i class="icon-reply"></i>
              {{ topic.replyCount }} 回复
            </span>
            <span class="stat-item">
              <i class="icon-view"></i>
              {{ topic.viewCount }} 浏览
            </span>
            <span class="stat-item">
              <i class="icon-like"></i>
              {{ topic.likeCount }} 点赞
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布新话题模态框 -->
    <div v-if="showNewPostModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>发布新话题</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="submitNewTopic" class="new-topic-form">
          <div class="form-group">
            <label>话题分类</label>
            <select v-model="newTopic.categoryId" required>
              <option value="">请选择分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>话题标题</label>
            <input 
              v-model="newTopic.title" 
              type="text" 
              placeholder="请输入话题标题" 
              required 
              maxlength="100"
            >
          </div>
          
          <div class="form-group">
            <label>话题内容</label>
            <textarea 
              v-model="newTopic.content" 
              placeholder="请详细描述你的问题或想法..." 
              required 
              rows="8"
              maxlength="2000"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="action-btn" @click="closeModal">取消</button>
            <button type="submit" class="action-btn primary" :disabled="!canSubmit">发布话题</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式数据
const selectedCategory = ref('all');
const showNewPostModal = ref(false);
const topics = ref<any[]>([]);
const newTopic = ref({
  categoryId: '',
  title: '',
  content: ''
});

// 话题分类
const categories = ref([
  { id: 'all', name: '全部', count: 0 },
  { id: 'algorithm', name: '算法题解', count: 0 },
  { id: 'experience', name: '备赛经验', count: 0 },
  { id: 'resources', name: '学习资源', count: 0 },
  { id: 'team', name: '组队交流', count: 0 },
  { id: 'other', name: '其他讨论', count: 0 }
]);

// 模拟数据
const mockTopics = [
  {
    id: 1,
    categoryId: 'algorithm',
    title: '动态规划经典题目：最长公共子序列详解',
    preview: '最近在刷动态规划的题目，发现最长公共子序列是一个很经典的问题，这里分享一下我的解题思路和代码实现...',
    author: '算法小王子',
    createdAt: new Date('2024-01-15T10:30:00'),
    replyCount: 12,
    viewCount: 156,
    likeCount: 23
  },
  {
    id: 2,
    categoryId: 'experience',
    title: '蓝桥杯省赛一等奖经验分享',
    preview: '刚刚收到省赛成绩，很幸运拿到了一等奖！在这里分享一下我的备赛经验，希望能帮助到大家...',
    author: '编程达人',
    createdAt: new Date('2024-01-14T15:20:00'),
    replyCount: 28,
    viewCount: 342,
    likeCount: 45
  },
  {
    id: 3,
    categoryId: 'resources',
    title: '蓝桥杯备赛资料整理（持续更新）',
    preview: '整理了一些蓝桥杯备赛的优质资料，包括历年真题、算法模板、刷题网站等，分享给大家...',
    author: '资料收集者',
    createdAt: new Date('2024-01-13T09:15:00'),
    replyCount: 8,
    viewCount: 89,
    likeCount: 15
  }
];

// 计算属性
const filteredTopics = computed(() => {
  if (selectedCategory.value === 'all') {
    return topics.value;
  }
  return topics.value.filter(topic => topic.categoryId === selectedCategory.value);
});

const canSubmit = computed(() => {
  return newTopic.value.categoryId && 
         newTopic.value.title.trim() && 
         newTopic.value.content.trim();
});

// 方法
function goBack() {
  router.push('/lanqiao');
}

function viewTopic(topicId: number) {
  // 这里可以跳转到话题详情页
  console.log('查看话题:', topicId);
  // router.push(`/lanqiao/discuss/${topicId}`);
}

function getCategoryName(categoryId: string) {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
}

function getCategoryClass(categoryId: string) {
  const classMap: Record<string, string> = {
    algorithm: 'category-algorithm',
    experience: 'category-experience',
    resources: 'category-resources',
    team: 'category-team',
    other: 'category-other'
  };
  return classMap[categoryId] || 'category-default';
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

function closeModal() {
  showNewPostModal.value = false;
  newTopic.value = {
    categoryId: '',
    title: '',
    content: ''
  };
}

function submitNewTopic() {
  if (!canSubmit.value) return;
  
  // 这里应该调用API提交新话题
  console.log('提交新话题:', newTopic.value);
  
  // 模拟添加到列表
  const newTopicData = {
    id: Date.now(),
    categoryId: newTopic.value.categoryId,
    title: newTopic.value.title,
    preview: newTopic.value.content.substring(0, 100) + '...',
    author: '当前用户', // 这里应该从用户状态获取
    createdAt: new Date(),
    replyCount: 0,
    viewCount: 0,
    likeCount: 0
  };
  
  topics.value.unshift(newTopicData);
  updateCategoryCounts();
  closeModal();
}

function updateCategoryCounts() {
  categories.value.forEach(category => {
    if (category.id === 'all') {
      category.count = topics.value.length;
    } else {
      category.count = topics.value.filter(topic => topic.categoryId === category.id).length;
    }
  });
}

// 生命周期
onMounted(() => {
  // 模拟加载数据
  topics.value = [...mockTopics];
  updateCategoryCounts();
});
</script>

<style scoped>
.discuss-container {
  min-height: 100vh;
  background: url('/grid-black.svg');
  background-repeat: repeat;
  background-size: auto;
  color: #222;
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.discuss-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 2rem;
}

.discuss-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.discuss-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0;
}

.discuss-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background: linear-gradient(90deg, #1e7a8c 0%, #5bc0de 100%);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.topic-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-tab {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.category-tab:hover {
  background: #e9ecef;
}

.category-tab.active {
  background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
  border-color: transparent;
}

.category-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.discuss-list {
  display: grid;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.topic-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.topic-category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-algorithm {
  background: #e3f2fd;
  color: #1976d2;
}

.category-experience {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-resources {
  background: #e8f5e8;
  color: #388e3c;
}

.category-team {
  background: #fff3e0;
  color: #f57c00;
}

.category-other {
  background: #fce4ec;
  color: #c2185b;
}

.topic-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.topic-author {
  font-weight: 500;
}

.topic-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.topic-preview {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.topic-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #888;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.new-topic-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2193b0;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .discuss-container {
    padding: 1rem;
  }
  
  .discuss-title {
    font-size: 2rem;
  }
  
  .discuss-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .topic-categories {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .topic-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .topic-stats {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>