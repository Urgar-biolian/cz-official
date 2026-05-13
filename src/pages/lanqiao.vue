<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#121212] pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Hero Section -->
        <div class="max-w-4xl mx-auto text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            蓝桥杯获奖风采
          </h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 mb-8">
            深耕技术，勇攀高峰。在这里见证创智工作室成员的竞赛战绩。
          </p>

          <div class="flex flex-wrap justify-center gap-4">
            <button
              class="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-[#138AFA] hover:bg-blue-600 shadow-lg shadow-blue-500/30 dark:shadow-none transition-all duration-200"
              @click="goToOfficial"
            >
              蓝桥杯官网
            </button>
            <button
              class="px-6 py-2.5 rounded-xl font-medium text-sm text-[#138AFA] bg-blue-50 border border-blue-100 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 transition-all duration-200"
              @click="goToDiscussion"
            >
              交流讨论
            </button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto">
          <!-- Group Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-12">
            <button
              v-for="group in groupTabs"
              :key="group"
              @click="selectedGroup = group"
              :class="[
                'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                group === selectedGroup
                  ? 'bg-[#138AFA] text-white shadow-md shadow-blue-500/30 dark:shadow-none'
                  : 'text-gray-600 bg-white border border-gray-200 hover:text-[#138AFA] hover:bg-blue-50 dark:bg-[#1e1e1e] dark:border-white/5 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-white/5'
              ]"
            >
              {{ group }}
            </button>
          </div>

          <!-- Winners Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="winner in filteredWinners"
              :key="winner.id"
              class="group relative bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-none flex flex-col items-center overflow-hidden"
            >
              <!-- Subtle top accent line -->
              <div class="absolute top-0 left-0 right-0 h-1 bg-[#138AFA] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <!-- Avatar -->
              <img
                class="w-20 h-20 object-cover rounded-full mb-4 ring-4 ring-blue-50 dark:ring-blue-500/10 bg-gray-50 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                :src="winner.avatar || '/src/assets/images/default-avatar.png'"
                :alt="winner.name"
              />

              <!-- Content -->
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ winner.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-5 text-center line-clamp-2 min-h-[2.5rem]">{{ winner.competition }}</p>

              <!-- Award Badge -->
              <div class="mt-auto">
                <span :class="getBadgeClass(winner.award)">
                  {{ winner.award }}
                </span>
              </div>
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
    const winners = await getWinners();
    winnersData.value = winners;
    const groups = Array.from(new Set(winners.map(w => w.competition)));
    groupTabs.value = ['全部', ...groups];
  } catch (error) {
    console.error('获取获奖者数据失败:', error);
  }
});

const filteredWinners = computed(() => {
  if (selectedGroup.value === '全部') return winnersData.value;
  return winnersData.value.filter(w => w.competition === selectedGroup.value);
});

function goToOfficial() {
  window.open('https://dasai.lanqiao.cn/', '_blank');
}

function goToDiscussion() {
  router.push('/comment');
}

function getBadgeClass(award: string) {
  const baseClass = "px-3 py-1.5 rounded-md text-xs font-semibold ring-1 ";
  if (award.includes('一等')) {
    return baseClass + "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20";
  }
  if (award.includes('二等')) {
    return baseClass + "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20";
  }
  if (award.includes('三等')) {
    return baseClass + "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20";
  }
  return baseClass + "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20";
}
</script>
