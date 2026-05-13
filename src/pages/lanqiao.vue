<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Hero Section -->
        <div class="max-w-4xl mx-auto text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            蓝桥杯光荣榜
          </h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 mb-8">
            汇聚智慧，见证荣耀。每一行代码都在书写属于我们的未来。
          </p>
          
          <div class="flex flex-wrap justify-center gap-4">
            <button 
              class="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all duration-200"
              @click="goToOfficial"
            >
              前往蓝桥官网
            </button>
            <button 
              class="px-6 py-2.5 rounded-xl font-medium text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-transparent dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/5 transition-all duration-200"
              @click="goToDiscussion"
            >
              参与讨论交流
            </button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto">
          <!-- Group Tabs -->
          <div class="flex flex-wrap justify-center gap-2 mb-12">
            <button
              v-for="group in groupTabs"
              :key="group"
              @click="selectedGroup = group"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                group === selectedGroup 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
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
              class="group bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] flex flex-col items-center"
            >
              <!-- Avatar -->
              <img 
                class="w-20 h-20 object-cover rounded-full mb-4 ring-1 ring-gray-100 dark:ring-white/10 bg-gray-50 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105" 
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
    return baseClass + "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";
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