<template>
  <div class="editor-modal">
    <div class="editor-modal-inner">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor class="editor-main" style="height: 500px; overflow-y: auto;" v-model="valueHtml"
        :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
      <div class="editor-actions">
        <button class="editor-submit-btn" @click="handleSubmit">提交</button>
        <button class="editor-cancel-btn" @click="handleCancel">取消</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, watchEffect, watch } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

//声明属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  mode: {
    type: String,
    default: "default"
  },
  placeholder: {
    type: String,
    default: "请输入内容..."
  }
})

//生命事件信息
const emits = defineEmits(['update:modelValue', 'submit', 'cancel'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p>分享你的参赛经验、题目思路或赛事建议～</p>')

watchEffect(() => {
  valueHtml.value = props.modelValue || '<p>分享你的参赛经验、题目思路或赛事建议～</p>'
})

watch(valueHtml, (newHtml) => {
  emits("update:modelValue", newHtml)
})

// 模拟 ajax 异步获取内容
// onMounted(() => {
//   setTimeout(() => {
//     valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//   }, 1500)
// })

const toolbarConfig = {}

// 图片上传配置
const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      server: 'http://1.92.82.236:3000/api/upload/image',
      fieldName: 'file',
      // 单文件最大 2MB
      maxFileSize: 2 * 1024 * 1024,
      // 最多一次上传几张
      maxNumberOfFiles: 5,
      // 选择图片后自动上传
      autoUpload: true,
      // 自定义插入图片
      customInsert(res: any, insertFn: (url: string) => void) {
        // 兼容后端返回格式 { url: ... } 或 { result: { url: ... } }
        const url = res.url || (res.result && res.result.url)
        if (url) insertFn(url)
      },
    },
  },
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

function handleSubmit() {
  emits('submit', valueHtml.value)
}

function handleCancel() {
  emits('cancel')
}
</script>

<style scoped>
.editor-modal {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 30, 30, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-modal-inner {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(24, 144, 255, 0.18), 0 2px 8px rgba(0, 0, 0, 0.10);
  border: 2.5px solid #1890ff;
  padding: 0 0 18px 0;
  min-width: 600px;
  max-width: 90vw;
  width: 700px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-main {
  background: #fafdff;
  border-radius: 12px;
  margin: 0 24px;
  margin-top: 18px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
  border: 1.5px solid #e6f7ff;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin: 18px 32px 0 32px;
  position: sticky;
  bottom: 0;
  background: #fff;
  z-index: 10;
  padding-bottom: 8px;
}

.editor-submit-btn {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.editor-submit-btn:hover {
  background: linear-gradient(90deg, #40a9ff 0%, #1890ff 100%);
}

.editor-cancel-btn {
  background: #f5f5f5;
  color: #888;
  border: 1.5px solid #e6e6e6;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.editor-cancel-btn:hover {
  background: #e8e8e8;
}
</style>
