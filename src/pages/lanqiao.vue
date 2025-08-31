<template>
  <div class="lanqiao-container">
    <!-- 子路由视图 -->
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- 默认内容：蓝桥杯获奖者展示 -->
        <!-- 顶部按钮区 -->
        <div class="lanqiao-actions">
          <button class="action-btn" @click="goToDiscuss">讨论区</button>
          <button class="action-btn" @click="goToOfficial">蓝桥官网</button>
        </div>
        <!-- 分组tab -->
        <div class="group-tabs">
          <div
            v-for="group in groupTabs"
            :key="group"
            :class="['group-tab', { active: group === selectedGroup }]"
            @click="selectedGroup = group"
          >
            {{ group }}
          </div>
        </div>
        <!-- 获奖者卡片区 -->
        <div class="winners-grid">
          <div v-for="winner in filteredWinners" :key="winner.id" class="winner-card">
            <div class="winner-card-header">
              <img class="winner-avatar" :src="winner.avatar || '/src/assets/images/default-avatar.png'" :alt="winner.name" />
            </div>
            <div class="winner-card-body">
              <div class="winner-name">{{ winner.name }}</div>
              <div class="winner-competition">{{ winner.competition }}</div>
              <div class="winner-award">{{ winner.award }}</div>
            </div>
          </div>
        </div>
      </template>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getWinners, Winner } from '~/api/winners';

const router = useRouter();
const winnersData = ref<Winner[]>([]);
const selectedGroup = ref('全部');
const groupTabs = ref<string[]>(['全部']);

onMounted(async () => {
  try {
    const res = await getWinners();
    winnersData.value = res.data;
    const groups = Array.from(new Set(res.data.map(w => w.competition)));
    groupTabs.value = ['全部', ...groups];
  } catch (error) {
    console.error('获取获奖者数据失败:', error);
  }
});

const filteredWinners = computed(() => {
  if (selectedGroup.value === '全部') return winnersData.value;
  return winnersData.value.filter(w => w.competition === selectedGroup.value);
});

function goToDiscuss() {
  router.push('/lanqiao/discuss');
}
function goToOfficial() {
  window.open('https://dasai.lanqiao.cn/', '_blank');
}
</script>

<style scoped>
.lanqiao-container {
  min-height: 100vh;
  background: url('/grid-black.svg');
  background-repeat: repeat;
  background-size: auto;
  color: #222;
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2.5rem;
}
.lanqiao-actions {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  margin-top: 2.5rem;
}
.action-btn {
  background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33,147,176,0.08);
  transition: background 0.2s, transform 0.2s;
}
.action-btn:hover {
  background: linear-gradient(90deg, #396afc 0%, #2948ff 100%);
  transform: translateY(-2px) scale(1.04);
}
.group-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}
.group-tab {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(33,147,176,0.08);
  border: 2px solid transparent;
}
.group-tab.active {
  background: linear-gradient(90deg, #396afc 0%, #2948ff 100%);
  color: #fff;
  border: 2px solid #00b4db;
  box-shadow: 0 4px 16px rgba(41,72,255,0.13);
}
.winners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 2rem auto;
}
.winner-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
}
.winner-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  transform: translateY(-6px) scale(1.03);
}
.winner-card-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.winner-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e3eafc;
  background: #f5f7fa;
  margin-top: -60px;
  box-shadow: 0 2px 8px rgba(33,147,176,0.08);
}
.winner-card-body {
  width: 100%;
  text-align: center;
}
.winner-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f7b500;
  margin-bottom: 0.3rem;
}
.winner-competition {
  font-size: 1rem;
  color: #396afc;
  margin-bottom: 0.2rem;
}
.winner-award {
  display: inline-block;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 0.3rem;
}
@media (max-width: 600px) {
  .winners-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .winner-card {
    padding: 1.2rem 0.5rem 1rem 0.5rem;
  }
  .winner-avatar {
    width: 70px;
    height: 70px;
    margin-top: -40px;
  }
}
</style>
