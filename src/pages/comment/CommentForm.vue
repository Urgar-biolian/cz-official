<template>
  <div>
    <div v-if="showModal" class="comment-form-modal-mask" @click="cancelReply"></div>
    <div v-if="showModal" class="comment-form-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isReply ? '回复评论' : '发起新讨论' }}</h3>
          <button class="close-btn" @click="cancelReply">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>
          </button>
        </div>
        <div class="modal-body">
          <TextEditor v-model="commentContent" :placeholder="placeholder" class="editor-input" />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="cancelReply">取消</button>
          <button class="submit-btn" :disabled="isSubmitting" @click="submitComment">
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="comment-form">
      <div class="form-header">
        <h3>{{ isReply ? '回复评论' : '发起新讨论' }}</h3>
        <button v-if="isReply" @click="cancelReply" class="cancel-btn">取消回复</button>
      </div>

      <div class="form-content">
        <TextEditor v-model="commentContent" :placeholder="placeholder" class="editor-input" />
      </div>
      <div class="form-footer">
        <button class="submit-btn" :disabled="isSubmitting" @click="submitComment">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCommentStore } from '~/store/commentStore'
import { useUserStore } from '~/store/user'
import { saveComment } from '~/api/commentApi'
import type { CreateCommentDTO } from '~/types/comment'
import TextEditor from '~/views/TextEditor.vue'

const commentStore = useCommentStore()
const userStore = useUserStore()

const props = defineProps<{
  parentId?: number
  rootParentId?: number
  replyToUser?: string
  isModal?: boolean
}>()

const emit = defineEmits<{
  submitted: [comment: any]
  cancelled: []
}>()

const commentContent = ref('')
const isSubmitting = ref(false)
const placeholder = ref('分享你的参赛经验、题目思路或赛事建议～')
const showModal = computed(() => props.isModal !== false && !props.parentId)

const isReply = computed(() => !!props.parentId)

const submitComment = async () => {
  if (!commentContent.value.trim()) return

  const currentUser = userStore.getUserInfo
  if (!currentUser || !('userId' in currentUser)) {
    alert('请先登录')
    return
  }

  isSubmitting.value = true

  try {
    const commentData: CreateCommentDTO = {
      content: commentContent.value.trim(),
      parent_id: props.parentId,
    }

    const newComment = await saveComment(commentData)
    commentStore.addComment(newComment)
    commentContent.value = ''
    emit('submitted', newComment)
  } catch (error) {
    alert('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const cancelReply = () => {
  commentContent.value = ''
  emit('cancelled')
}
</script>

<style scoped>
.comment-form-modal-mask {
  position: fixed;
  z-index: 1999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.comment-form-modal {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Let clicks pass through to mask */
}

.modal-content {
  pointer-events: auto;
  @apply bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 90vw;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  @apply border-b border-gray-200 dark:border-gray-800;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  @apply text-gray-900 dark:text-white;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  @apply text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover {
  @apply bg-gray-100 dark:bg-gray-800;
}

.modal-body {
  padding: 20px;
  background: #f9fafb;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  @apply border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900;
}

/* Base Form styles */
.comment-form {
  @apply bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  @apply text-gray-900 dark:text-white;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Shared Button Styles */
.cancel-btn {
  @apply bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-btn {
  @apply bg-[#138AFA] text-white hover:bg-[#138AFA]/90;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-btn:disabled {
  @apply bg-blue-300 dark:bg-blue-800 cursor-not-allowed opacity-70;
}

</style>
