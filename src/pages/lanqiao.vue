<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0a0f18] pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans relative overflow-hidden">
    <!-- Background Tech Grid Pattern -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTksIDEzOCwgMjUwLCAwLjEpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <template v-else>
        <!-- Hero Section -->
        <div class="relative max-w-4xl mx-auto text-center mb-16 z-10">
          <div class="inline-block mb-4 px-3 py-1 border border-[#138AFA]/30 bg-[#138AFA]/10 text-[#138AFA] text-xs font-mono tracking-widest rounded uppercase">
            ACHIEVEMENTS //
          </div>
          <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight mb-4 drop-shadow-sm">
            蓝桥<span class="text-transparent bg-clip-text bg-gradient-to-r from-[#138AFA] to-cyan-400">成就</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-mono text-sm">
            > System.out.println("汇聚智慧，见证荣耀"); <span class="animate-pulse">_</span>
          </p>

          <div class="flex flex-wrap justify-center gap-4 font-mono text-sm">
            <button
              class="relative px-6 py-2.5 bg-[#138AFA] text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(19,138,250,0.4)] hover:shadow-[0_0_25px_rgba(19,138,250,0.6)] transition-all duration-300 overflow-hidden group"
              @click="goToOfficial"
            >
              <span class="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span class="relative z-10">前往官网 [EXTERNAL]</span>
            </button>
            <button
              class="px-6 py-2.5 text-[#138AFA] border border-[#138AFA]/50 bg-[#138AFA]/5 hover:bg-[#138AFA]/10 transition-all duration-300 backdrop-blur-sm"
              @click="goToDiscussion"
            >
              讨论交流 /DISCUSS
            </button>
          </div>
        </div>

        <div class="relative max-w-7xl mx-auto z-10">
          <!-- Group Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-12">
            <button
              v-for="group in groupTabs"
              :key="group"
              @click="selectedGroup = group"
              :class="[
                'px-4 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 border backdrop-blur-md',
                group === selectedGroup
                  ? 'bg-[#138AFA]/20 text-[#138AFA] border-[#138AFA] shadow-[0_0_10px_rgba(19,138,250,0.2)]'
                  : 'bg-white/50 dark:bg-[#0f172a]/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-[#138AFA]/50 hover:text-[#138AFA]'
              ]"
            >
              [{{ group }}]
            </button>
          </div>

          <!-- Winners Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="winner in filteredWinners"
              :key="winner.id"
              class="group relative bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-[#138AFA]/50 transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden"
            >
              <!-- Tech Corner Accents -->
              <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#138AFA]/50 group-hover:border-[#138AFA] transition-colors"></div>
              <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#138AFA]/50 group-hover:border-[#138AFA] transition-colors"></div>
              <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#138AFA]/50 group-hover:border-[#138AFA] transition-colors"></div>
              <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#138AFA]/50 group-hover:border-[#138AFA] transition-colors"></div>

              <!-- Avatar -->
              <div class="relative inline-block mb-5">
                <div class="absolute inset-0 bg-[#138AFA]/20 rounded-full blur-md group-hover:bg-[#138AFA]/40 transition-all duration-500"></div>
                <img
                  class="relative w-20 h-20 object-cover rounded-full border border-[#138AFA]/30 group-hover:border-[#138AFA] p-1 bg-white dark:bg-[#0a0f18] transition-colors duration-300"
                  :src="winner.avatar || '/src/assets/images/default-avatar.png'"
                  :alt="winner.name"
                />
              </div>

              <!-- Content -->
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 tracking-wide">{{ winner.name }}</h3>
              <p class="text-xs font-mono text-gray-500 dark:text-gray-400 mb-6 min-h-[2rem]">{{ winner.competition }}</p>

              <!-- Award Badge -->
              <div class="mt-auto">
                <span :class="['px-3 py-1 text-xs font-mono border backdrop-blur-sm', getBadgeClass(winner.award)]">
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
  if (award.includes('一等')) {
    return "border-amber-400/50 text-amber-600 dark:text-amber-400 bg-amber-400/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]";
  }
  if (award.includes('二等')) {
    return "border-gray-400/50 text-gray-600 dark:text-gray-300 bg-gray-400/10";
  }
  if (award.includes('三等')) {
    return "border-orange-400/50 text-orange-600 dark:text-orange-400 bg-orange-400/10";
  }
  return "border-[#138AFA]/50 text-[#138AFA] bg-[#138AFA]/10 shadow-[0_0_10px_rgba(19,138,250,0.2)]";
}
</script>
