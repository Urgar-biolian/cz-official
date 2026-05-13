<template>
  <div class="min-h-screen bg-slate-50 dark:bg-transparent pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Hero Section -->
        <div class="max-w-4xl mx-auto text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
            蓝桥杯光荣榜
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            汇聚智慧，见证荣耀。在这里，每一份努力都闪耀着光芒。
          </p>
          
          <div class="flex flex-wrap justify-center gap-4">
            <button 
              class="px-6 py-2.5 rounded-md font-medium text-white bg-[#138AFA] hover:bg-blue-600 shadow-sm transition-all duration-200"
              @click="goToOfficial"
            >
              前往官网
            </button>
            <button 
              class="px-6 py-2.5 rounded-md font-medium text-[#138AFA] bg-blue-50 border border-blue-100 hover:bg-blue-100 dark:bg-transparent dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
              @click="goToDiscussion"
            >
              讨论交流
            </button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto">
          <!-- Group Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-10">
            <button
              v-for="group in groupTabs"
              :key="group"
              @click="selectedGroup = group"
              :class="[
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                group === selectedGroup 
                  ? 'bg-[#138AFA] text-white border-[#138AFA] shadow-sm' 
                  : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-[#138AFA] hover:bg-blue-50 dark:hover:bg-gray-800 dark:hover:text-gray-200'
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
              class="bg-white dark:bg-transparent rounded-sm shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center dark:border dark:border-gray-800"
            >
              <!-- Avatar -->
              <div class="relative inline-block mb-4">
                <img 
                  class="w-20 h-20 object-cover rounded-full border-2 border-gray-100 dark:border-gray-700 shadow-sm" 
                  :src="winner.avatar || '/src/assets/images/default-avatar.png'" 
                  :alt="winner.name" 
                />
              </div>

              <!-- Content -->
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{{ winner.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-5 min-h-[2.5rem]">{{ winner.competition }}</p>
              
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
  const baseClass = "px-3 py-1 rounded-full text-xs font-medium ";
  if (award.includes('一等')) {
    return baseClass + "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  }
  if (award.includes('二等')) {
    return baseClass + "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
  if (award.includes('三等')) {
    return baseClass + "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  }
  return baseClass + "bg-blue-100 text-[#138AFA] dark:bg-blue-900/30 dark:text-blue-400";
}
</script>