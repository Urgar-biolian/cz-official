/// <reference types="vitest" />
import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import  externalGlobals  from 'rollup-plugin-external-globals';

//引入svg需要用到的插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  // 定义环境变量
  define: {
    'import.meta.env.VITE_GLOB_APP_TITLE': JSON.stringify('创智工作室'),
    'import.meta.env.VITE_GLOB_API_URL': JSON.stringify('http://localhost:3001'),
    'import.meta.env.VITE_GLOB_API_URL_PREFIX': JSON.stringify('/api'),
    'import.meta.env.VITE_GLOB_UPLOAD_URL': JSON.stringify('http://localhost:3001'),
  },

  // 开发服务器配置
  server: {
    port: 3333,
    host: true,
    // API代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },

  esbuild: {
    pure: ['console.log'], // 删除 console.log
    drop: ['debugger'], // 删除 debugger
  },
  resolve: {
    alias: {
      '#/': `${path.resolve(__dirname, './types')}/`,
      '~/': `${path.resolve(__dirname, './src')}/`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    }
  },
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icon')],
      symbolId: 'icon-[dir]-[name]'
    }),

    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
        vueJsx:vueJsx({})
      },
    }),

    // https://github.com/posva/unplugin-vue-router
    VueRouter(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          'vue-router/auto': ['useLink'],
        },
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    UnoCSS(),
    visualizer({ open: true }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
  },
})
