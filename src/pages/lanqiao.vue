<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-[#050505] pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans">
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Hero Section -->
        <div class="max-w-6xl mx-auto mb-20 relative">
          <!-- Industrial grid accent in background -->
          <div class="absolute -top-16 -left-16 w-32 h-32 border-l border-t border-[#138AFA]/20 dark:border-[#138AFA]/40 hidden md:block"></div>
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div class="max-w-2xl">
              <h2 class="text-sm font-mono tracking-[0.2em] text-[#138AFA] mb-4 uppercase flex items-center">
                <span class="w-8 h-px bg-[#138AFA] mr-3"></span>
                Honor Roll
              </h2>
              <h1 class="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
                蓝桥战绩<span class="text-[#138AFA]">.</span>
              </h1>
              <p class="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                深耕技术，勇攀高峰。<br/>在这里见证创智工作室成员的竞赛表现。
              </p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 shrink-0">
              <button 
                class="group relative px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white bg-[#138AFA] overflow-hidden"
                @click="goToOfficial"
              >
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span class="relative">蓝桥杯官网 -></span>
              </button>
              <button 
                class="px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                @click="goToDiscussion"
              >
                交流讨论
              </button>
            </div>
          </div>
        </div>

        <div class="max-w-6xl mx-auto">
          <!-- Group Tabs (Editorial Filter) -->
          <div class="flex flex-wrap gap-2 mb-12 border-b border-gray-200 dark:border-gray-800 pb-4">
            <button
              v-for="group in groupTabs"
              :key="group"
              @click="selectedGroup = group"
              :class="[
                'px-4 py-1.5 text-sm font-mono uppercase tracking-widest transition-all duration-200',
                group === selectedGroup 
                  ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 font-bold' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
              ]"
            >
              {{ group === '全部' ? 'ALL' : group }}
            </button>
          </div>

          <!-- Winners List (Brutalist Table) -->
          <div class="flex flex-col gap-0 border-t border-gray-200 dark:border-gray-800">
            <div 
              v-for="(winner, index) in filteredWinners" 
              :key="winner.id" 
              class="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 border-b border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] transition-colors duration-300"
            >
              <!-- Number / Index -->
              <div class="hidden md:block col-span-1 text-xs font-mono text-gray-400 dark:text-gray-600">
                {{ String(index + 1).padStart(2, '0') }}
              </div>

              <!-- Avatar & Name -->
              <div class="col-span-1 md:col-span-4 flex items-center gap-6">
                <div class="relative w-16 h-16 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img 
                    class="w-full h-full object-cover" 
                    :src="winner.avatar || '/src/assets/images/default-avatar.png'" 
                    :alt="winner.name" 
                  />
                  <!-- Tech accent corner -->
                  <div class="absolute top-0 right-0 w-2 h-2 bg-[#138AFA] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-[#138AFA] transition-colors duration-300">{{ winner.name }}</h3>
                </div>
              </div>

              <!-- Competition Name -->
              <div class="col-span-1 md:col-span-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {{ winner.competition }}
                </p>
              </div>
              
              <!-- Award Badge (Stark Mono) -->
              <div class="col-span-1 md:col-span-3 flex md:justify-end">
                <div :class="getBadgeClass(winner.award)">
                  <span class="w-1.5 h-1.5 rounded-full mr-2 shrink-0" :class="getDotClass(winner.award)"></span>
                  {{ winner.award }}
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="filteredWinners.length === 0" class="p-12 text-center border-b border-gray-200 dark:border-gray-800">
              <p class="text-gray-500 font-mono text-sm uppercase tracking-widest">No records found</p>
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
  // Brutalist tag: mono font, stark border, uppercase
  return "inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 bg-transparent text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200";
}

function getDotClass(award: string) {
  if (award.includes('一等')) return "bg-amber-500";
  if (award.includes('二等')) return "bg-gray-400 dark:bg-gray-500";
  if (award.includes('三等')) return "bg-orange-500";
  return "bg-[#138AFA]";
}
</script>