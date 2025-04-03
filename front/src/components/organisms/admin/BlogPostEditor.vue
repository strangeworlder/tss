<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSize } from '@/types/image';
import { deleteBlogPost } from '@/api/blogService';
import { useRouter } from 'vue-router';

const props = defineProps<{
  postId: string | null;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const blogStore = useBlogStore();
const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);

// Form data
const title = ref('');
const content = ref('');
const excerpt = ref('');
const publishedAt = ref('');
const isPublished = ref(true);
const authorName = ref('');
const tags = ref<string[]>([]);
const newTag = ref('');
const heroImage = ref<File | null>(null);
const heroImagePreview = ref<string | null>(null);

const router = useRouter();
const showDeleteConfirm = ref(false);

// Watch for postId changes to load post data
watch(() => props.postId, async (newId) => {
  if (newId) {
    await loadPost(newId);
  } else {
    loading.value = false;
    resetForm();
  }
});

const loadPost = async (postId: string) => {
  loading.value = true;
  error.value = null;
  
  try {
    await blogStore.fetchPostById(postId);
    const post = blogStore.currentPost;
    
    if (post) {
      title.value = post.title;
      content.value = post.content;
      excerpt.value = post.excerpt;
      publishedAt.value = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : '';
      isPublished.value = post.isPublished;
      authorName.value = post.author.name;
      tags.value = [...(post.tags || [])];
    }
  } catch (err) {
    console.error('Error loading post:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load post';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  title.value = '';
  content.value = '';
  excerpt.value = '';
  publishedAt.value = '';
  isPublished.value = true;
  authorName.value = '';
  tags.value = [];
  heroImage.value = null;
  heroImagePreview.value = null;
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    heroImage.value = input.files[0];
    heroImagePreview.value = URL.createObjectURL(input.files[0]);
  }
};

const addTag = () => {
  if (newTag.value.trim() && !tags.value.includes(newTag.value.trim())) {
    tags.value.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter(tag => tag !== tagToRemove);
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('content', content.value);
    formData.append('publishedAt', publishedAt.value);
    formData.append('tags', JSON.stringify(tags.value));
    formData.append('excerpt', excerpt.value);
    formData.append('authorName', authorName.value);
    formData.append('isPublished', isPublished.value.toString());

    if (heroImage.value) {
      formData.append('heroImage', heroImage.value);
    }

    if (props.postId) {
      await blogStore.updatePost(props.postId, formData);
      blogStore.setNotification({
        type: 'success',
        message: 'Post updated successfully'
      });
    } else {
      await blogStore.createPost(formData);
      blogStore.setNotification({
        type: 'success',
        message: 'Post created successfully'
      });
    }

    emit('back');
  } catch (error) {
    console.error('Error saving post:', error);
    blogStore.setNotification({
      type: 'error',
      message: 'Failed to save post. Please try again.'
    });
  }
};

const handleDelete = async () => {
  if (!blogStore.currentPost?.id) return;
  
  try {
    await deleteBlogPost(blogStore.currentPost.id);
    // Show success message
    blogStore.setNotification({
      type: 'success',
      message: 'Post deleted successfully'
    });
    // Emit back event to return to the list
    emit('back');
  } catch (error) {
    console.error('Error deleting post:', error);
    blogStore.setNotification({
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to delete post'
    });
  }
};

onMounted(() => {
  if (props.postId) {
    loadPost(props.postId);
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <div class="blog-post-editor">
    <!-- Notification -->
    <div v-if="blogStore.notification" 
         :class="['blog-post-editor__notification', `blog-post-editor__notification--${blogStore.notification.type}`]">
      {{ blogStore.notification.message }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="blog-post-editor__loading">
      <div class="blog-post-editor__spinner"></div>
      <p>Loading post...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="blog-post-editor__error">
      <p>{{ error }}</p>
      <button 
        @click="props.postId ? loadPost(props.postId) : resetForm()"
        class="blog-post-editor__button blog-post-editor__button--retry"
      >
        Try Again
      </button>
    </div>

    <!-- Editor form -->
    <form v-else @submit.prevent="handleSubmit" class="blog-post-editor__form">
      <div class="blog-post-editor__header">
        <h2 class="blog-post-editor__title">
          {{ props.postId ? 'Edit Post' : 'New Post' }}
        </h2>
        <button 
          type="button"
          @click="emit('back')"
          class="blog-post-editor__button blog-post-editor__button--back"
        >
          Back to List
        </button>
      </div>

      <div class="blog-post-editor__field">
        <label for="title" class="blog-post-editor__label">Title</label>
        <input 
          id="title"
          v-model="title"
          type="text"
          required
          class="blog-post-editor__input"
        />
      </div>

      <div class="blog-post-editor__field">
        <label for="content" class="blog-post-editor__label">Content (Markdown)</label>
        <textarea 
          id="content"
          v-model="content"
          required
          rows="15"
          class="blog-post-editor__textarea"
        ></textarea>
      </div>

      <div class="blog-post-editor__field">
        <label for="excerpt" class="blog-post-editor__label">Excerpt</label>
        <textarea 
          id="excerpt"
          v-model="excerpt"
          required
          rows="3"
          class="blog-post-editor__textarea"
        ></textarea>
      </div>

      <div class="blog-post-editor__field">
        <label for="publishedAt" class="blog-post-editor__label">Publish Date</label>
        <input 
          id="publishedAt"
          v-model="publishedAt"
          type="date"
          required
          class="blog-post-editor__input"
        />
      </div>

      <div class="blog-post-editor__field">
        <label for="authorName" class="blog-post-editor__label">Author Name</label>
        <input 
          id="authorName"
          v-model="authorName"
          type="text"
          required
          class="blog-post-editor__input"
        />
      </div>

      <div class="blog-post-editor__field">
        <label class="blog-post-editor__label">Publication Status</label>
        <div class="blog-post-editor__checkbox">
          <input 
            id="isPublished"
            v-model="isPublished"
            type="checkbox"
            class="blog-post-editor__checkbox-input"
          />
          <label for="isPublished" class="blog-post-editor__checkbox-label">Published</label>
        </div>
      </div>

      <div class="blog-post-editor__field">
        <label class="blog-post-editor__label">Tags</label>
        <div class="blog-post-editor__tags">
          <div class="blog-post-editor__tag-list">
            <span 
              v-for="tag in tags" 
              :key="tag"
              class="blog-post-editor__tag"
            >
              {{ tag }}
              <button 
                type="button"
                @click="removeTag(tag)"
                class="blog-post-editor__tag-remove"
              >
                ×
              </button>
            </span>
          </div>
          <div class="blog-post-editor__tag-input">
            <input 
              v-model="newTag"
              type="text"
              placeholder="Add a tag"
              @keyup.enter.prevent="addTag"
              class="blog-post-editor__input"
            />
            <button 
              type="button"
              @click="addTag"
              class="blog-post-editor__button blog-post-editor__button--add"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div class="blog-post-editor__field">
        <label class="blog-post-editor__label">Hero Image</label>
        <div class="blog-post-editor__image-upload">
          <div v-if="heroImagePreview || blogStore.currentPost?.heroImage" class="blog-post-editor__image-preview">
            <AppImage
              v-if="blogStore.currentPost?.heroImage?.filename && !heroImagePreview"
              :filename="blogStore.currentPost.heroImage.filename"
              :alt="blogStore.currentPost.heroImage.altText || title"
              :size="ImageSize.MEDIUM"
              class="blog-post-editor__preview-img"
            />
            <img
              v-else-if="heroImagePreview"
              :src="heroImagePreview"
              :alt="title"
              class="blog-post-editor__preview-img"
            />
          </div>
          <input 
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="blog-post-editor__file-input"
          />
        </div>
      </div>

      <div class="blog-post-editor__actions">
        <button 
          type="submit"
          :disabled="saving"
          class="blog-post-editor__button blog-post-editor__button--save"
        >
          {{ saving ? 'Saving...' : (props.postId ? 'Update Post' : 'Create Post') }}
        </button>
        
        <button 
          v-if="props.postId"
          type="button"
          class="blog-post-editor__delete-button"
          @click="showDeleteConfirm = true"
          :disabled="loading"
        >
          Delete Post
        </button>
      </div>
    </form>

    <!-- Delete confirmation dialog -->
    <div v-if="showDeleteConfirm" class="blog-post-editor__delete-confirm">
      <div class="blog-post-editor__delete-confirm-content">
        <h3>Delete Post</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div class="blog-post-editor__delete-confirm-actions">
          <button 
            class="blog-post-editor__delete-confirm-cancel"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button 
            class="blog-post-editor__delete-confirm-delete"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-editor {
  width: 100%;
}

.blog-post-editor__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) 0;
  text-align: center;
}

.blog-post-editor__spinner {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.blog-post-editor__error {
  text-align: center;
  padding: var(--spacing-4);
  color: var(--color-error);
}

.blog-post-editor__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.blog-post-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.blog-post-editor__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
}

.blog-post-editor__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.blog-post-editor__label {
  font-weight: 500;
  color: var(--color-text);
}

.blog-post-editor__input,
.blog-post-editor__textarea {
  padding: var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-background);
}

.blog-post-editor__textarea {
  resize: vertical;
  min-height: 200px;
}

.blog-post-editor__tags {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.blog-post-editor__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.blog-post-editor__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-background-hover);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.blog-post-editor__tag-remove {
  border: none;
  background: none;
  color: var(--color-text);
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
  line-height: 1;
}

.blog-post-editor__tag-remove:hover {
  opacity: 1;
}

.blog-post-editor__tag-input {
  display: flex;
  gap: var(--spacing-2);
}

.blog-post-editor__image-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.blog-post-editor__image-preview {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 16/9;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-background-hover);
}

.blog-post-editor__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-post-editor__file-input {
  padding: var(--spacing-2);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.blog-post-editor__actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.blog-post-editor__button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.blog-post-editor__button--save {
  background-color: var(--color-primary);
  color: white;
}

.blog-post-editor__button--save:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.blog-post-editor__button--save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.blog-post-editor__button--back {
  background-color: var(--color-background-hover);
  color: var(--color-text);
}

.blog-post-editor__button--back:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--retry {
  background-color: var(--color-background-hover);
  color: var(--color-text);
}

.blog-post-editor__button--retry:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--add {
  background-color: var(--color-background-hover);
  color: var(--color-text);
}

.blog-post-editor__button--add:hover {
  background-color: var(--color-border);
}

.blog-post-editor__checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.blog-post-editor__checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
}

.blog-post-editor__checkbox-label {
  font-size: 0.875rem;
  color: var(--color-text);
}

.blog-post-editor__delete-button {
  background-color: var(--color-error);
  color: var(--color-white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-button:hover {
  background-color: var(--color-error-dark);
}

.blog-post-editor__delete-confirm {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.blog-post-editor__delete-confirm-content {
  background-color: var(--color-white);
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
}

.blog-post-editor__delete-confirm h3 {
  margin: 0 0 1rem;
  color: var(--color-error);
}

.blog-post-editor__delete-confirm p {
  margin: 0 0 2rem;
  color: var(--color-text);
}

.blog-post-editor__delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.blog-post-editor__delete-confirm-cancel {
  background-color: var(--color-gray-light);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-confirm-delete {
  background-color: var(--color-error);
  color: var(--color-white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-confirm-cancel:hover {
  background-color: var(--color-gray);
}

.blog-post-editor__delete-confirm-delete:hover {
  background-color: var(--color-error-dark);
}

.blog-post-editor__notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: var(--spacing-4);
  border-radius: var(--border-radius);
  color: var(--color-white);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.blog-post-editor__notification--success {
  background-color: var(--color-success);
}

.blog-post-editor__notification--error {
  background-color: var(--color-error);
}

.blog-post-editor__notification--info {
  background-color: var(--color-info);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 