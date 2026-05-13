<template>
  <div>
    <div v-if="showModal" class="comment-form-modal-mask"></div>
    <div v-if="showModal" class="comment-form-modal">
      <TextEditor v-model="commentContent" :placeholder="placeholder" class="editor-input" @submit="submitComment"
        @cancel="cancelReply" />
    </div>
    <div v-else class="comment-form">
      <div class="form-header">
        <h3>{{ isReply ? '回复评论' : '发表评论' }}</h3>
        <button v-if="isReply" @click="cancelReply" class="cancel-btn" style="display:none">取消回复</button>
      </div>

      <div class="form-content">
        <TextEditor v-model="commentContent" :placeholder="placeholder" class="editor-input" @submit="submitComment"
          @cancel="cancelReply" />
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
}>()

const emit = defineEmits<{
  submitted: [comment: any]
  cancelled: []
}>()

const commentContent = ref('')
const isSubmitting = ref(false)
const placeholder = ref('请输入评论内容（支持Markdown语法）')
const showModal = ref(true)

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
.comment-form {
  background: #fff;
  border-radius: 14px;
  padding: 12px 4px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1.5px solid #e6e6e6;
  text-align: left;
  max-width: 100%;
  width: 100%;
  font-size: 16px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.form-header h3 {
  margin: 0;
  color: #222;
  font-size: 20px;
  font-weight: 600;
}

.cancel-btn {
  background: #f5f5f5;
  border: 1.5px solid #e6e6e6;
  padding: 7px 18px;
  border-radius: 8px;
  cursor: pointer;
  color: #888;
  font-size: 14px;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.editor-input {
  margin-bottom: 18px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.06);
  border: 1.5px solid #e6f7ff;
  text-align: left;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  background: none;
}

.submit-btn {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  border: none;
  padding: 10px 32px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #40a9ff 0%, #1890ff 100%);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.comment-item+.comment-item {
  border-top: 2px solid #e6e6e6;
  margin-top: 32px;
  padding-top: 32px;
}

.comment-form-modal-mask {
  position: fixed;
  z-index: 1999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 30, 30, 0.45);
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
}

@media (min-width: 600px) {
  .comment-form {
    max-width: 600px;
    padding: 24px 16px;
    font-size: 17px;
  }
  .editor-input {
    min-width: 400px;
  }
}
@media (min-width: 900px) {
  .comment-form {
    max-width: 900px;
    padding: 36px 80px;
    font-size: 18px;
  }
  .editor-input {
    min-width: 600px;
  }
}
</style>
