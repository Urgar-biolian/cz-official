<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#121212] pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Header Section -->
        <div class="max-w-7xl mx-auto text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 pb-2">
            蓝桥杯光荣榜
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            汇聚智慧，见证荣耀。在这里，每一份努力都闪耀着光芒。
          </p>
          
          <div class="flex flex-wrap justify-center gap-4">
            <button 
              class="px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              @click="goToOfficial"
            >
              前往官网
            </button>
            <button 
              class="px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
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
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ group }}
            </button>
          </div>

          <!-- Winners Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div 
              v-for="winner in filteredWinners" 
              :key="winner.id" 
              class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 pt-12 pb-6 px-6 text-center group"
            >
              <!-- Decorative Top Background -->
              <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700/50 rounded-t-2xl"></div>
              
              <!-- Avatar -->
              <div class="relative inline-block mb-4">
                <img 
                  class="w-20 h-20 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-300" 
                  :src="winner.avatar || '/src/assets/images/default-avatar.png'" 
                  :alt="winner.name" 
                />
              </div>

              <!-- Content -->
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ winner.name }}</h3>
              <p class="text-sm font-medium text-blue-500 dark:text-blue-400 mb-4">{{ winner.competition }}</p>
              
              <!-- Award Badge -->
              <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-400 shadow-sm">
                <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
                {{ winner.award }}
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
</script>
