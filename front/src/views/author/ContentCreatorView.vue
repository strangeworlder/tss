<!--
ContentCreatorView.vue
Component name: ContentCreator
Description: View for creating and editing content
Features:
- Rich text editor
- Media upload support
- Content preview
- Content validation
- Accessibility compliant
Usage:
<template>
  <ContentCreator />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper form structure
- ARIA labels
- Keyboard navigation
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Create Content">
    <div class="author-content-creator">
      <div class="author-content-creator__header">
        <h1 class="author-content-creator__title">Create Content</h1>
        
        <div class="author-content-creator__type-selector">
          <label for="content-type" class="author-content-creator__label">Content Type</label>
          <select
            id="content-type"
            v-model="contentType"
            class="author-content-creator__select"
            aria-label="Select content type"
          >
            <option value="post">Blog Post</option>
            <option value="comment">Comment</option>
          </select>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="author-content-creator__form">
        <div class="author-content-creator__field">
          <label for="title" class="author-content-creator__label">Title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="author-content-creator__input"
            :class="{ 'author-content-creator__input--error': errors.title }"
            required
            aria-required="true"
            :aria-invalid="!!errors.title"
            aria-describedby="title-error"
          />
          <div v-if="errors.title" id="title-error" class="author-content-creator__error">
            {{ errors.title }}
          </div>
        </div>

        <div class="author-content-creator__field">
          <label for="slug" class="author-content-creator__label">URL Slug</label>
          <input
            id="slug"
            v-model="form.slug"
            type="text"
            class="author-content-creator__input"
            :class="{ 'author-content-creator__input--error': errors.slug }"
            required
            aria-required="true"
            :aria-invalid="!!errors.slug"
            aria-describedby="slug-error"
          />
          <div v-if="errors.slug" id="slug-error" class="author-content-creator__error">
            {{ errors.slug }}
          </div>
        </div>

        <div class="author-content-creator__field">
          <label for="content" class="author-content-creator__label">Content</label>
          <div class="author-content-creator__editor">
            <!-- Rich text editor will be integrated here -->
            <textarea
              id="content"
              v-model="form.content"
              class="author-content-creator__textarea"
              :class="{ 'author-content-creator__textarea--error': errors.content }"
              required
              aria-required="true"
              :aria-invalid="!!errors.content"
              aria-describedby="content-error"
            ></textarea>
          </div>
          <div v-if="errors.content" id="content-error" class="author-content-creator__error">
            {{ errors.content }}
          </div>
        </div>

        <div class="author-content-creator__field">
          <label class="author-content-creator__label">Media</label>
          <div class="author-content-creator__media-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              @change="handleMediaUpload"
              class="author-content-creator__file-input"
              aria-label="Upload media"
              :disabled="isUploading"
            />
            <div v-if="errors.media" class="author-content-creator__error">
              {{ errors.media }}
            </div>
            <div v-if="uploadedMedia.length > 0" class="author-content-creator__media-preview">
              <div
                v-for="media in uploadedMedia"
                :key="media.id"
                class="author-content-creator__media-item"
              >
                <img
                  :src="media.previewUrl"
                  :alt="media.name"
                  class="author-content-creator__media-image"
                />
                <div v-if="media.uploadProgress < 100" class="author-content-creator__media-progress">
                  <div
                    class="author-content-creator__media-progress-bar"
                    :style="{ width: `${media.uploadProgress}%` }"
                  ></div>
                </div>
                <div v-if="media.uploadError" class="author-content-creator__media-error">
                  {{ media.uploadError }}
                </div>
                <button
                  @click="removeMedia(media.id)"
                  class="author-content-creator__media-remove"
                  aria-label="Remove media"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="author-content-creator__field">
          <label class="author-content-creator__label">Tags</label>
          <div class="author-content-creator__tags">
            <input
              v-model="tagInput"
              type="text"
              class="author-content-creator__tag-input"
              placeholder="Add tags..."
              @keydown.enter.prevent="addTag"
            />
            <div class="author-content-creator__tag-list">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="author-content-creator__tag"
              >
                {{ tag }}
                <button
                  @click="removeTag(tag)"
                  class="author-content-creator__tag-remove"
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <div class="author-content-creator__field">
          <label class="author-content-creator__label">Schedule</label>
          <div class="author-content-creator__schedule">
            <input
              type="checkbox"
              id="schedule"
              v-model="form.isScheduled"
              class="author-content-creator__checkbox"
            />
            <label for="schedule">Schedule for later</label>
            
            <div v-if="form.isScheduled" class="author-content-creator__schedule-details">
              <input
                v-model="form.scheduleDate"
                type="date"
                class="author-content-creator__input"
                :min="minDate"
              />
              <input
                v-model="form.scheduleTime"
                type="time"
                class="author-content-creator__input"
              />
            </div>
          </div>
        </div>

        <div class="author-content-creator__actions">
          <button
            type="button"
            @click="previewContent"
            class="author-content-creator__button author-content-creator__button--secondary"
          >
            Preview
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="author-content-creator__button author-content-creator__button--primary"
          >
            {{ isSubmitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>

      <div v-if="showPreview" class="author-content-creator__preview">
        <div class="author-content-creator__preview-header">
          <h2 class="author-content-creator__preview-title">Preview</h2>
          <div class="author-content-creator__preview-controls">
            <button
              @click="previewMode = 'desktop'"
              class="author-content-creator__preview-button"
              :class="{ 'author-content-creator__preview-button--active': previewMode === 'desktop' }"
              aria-label="Desktop preview"
            >
              <span class="author-content-creator__preview-icon">🖥️</span>
            </button>
            <button
              @click="previewMode = 'tablet'"
              class="author-content-creator__preview-button"
              :class="{ 'author-content-creator__preview-button--active': previewMode === 'tablet' }"
              aria-label="Tablet preview"
            >
              <span class="author-content-creator__preview-icon">📱</span>
            </button>
            <button
              @click="previewMode = 'mobile'"
              class="author-content-creator__preview-button"
              :class="{ 'author-content-creator__preview-button--active': previewMode === 'mobile' }"
              aria-label="Mobile preview"
            >
              <span class="author-content-creator__preview-icon">📱</span>
            </button>
          </div>
        </div>
        
        <div
          class="author-content-creator__preview-container"
          :class="`author-content-creator__preview-container--${previewMode}`"
        >
          <article class="author-content-creator__preview-content">
            <header class="author-content-creator__preview-header">
              <h1 class="author-content-creator__preview-content-title">{{ form.title }}</h1>
            </header>
            <div class="author-content-creator__preview-content-body" v-html="form.content"></div>
          </article>
        </div>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthorStore } from '@/stores/author';
import { useAuthStore } from '@/stores/authStore';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';
import { AuthorPermission } from '@/types/author';
import { apiPost } from '@/api/apiClient';

interface IMediaFile {
  id: string;
  name: string;
  previewUrl: string;
  file: File;
  uploadProgress: number;
  uploadError: string | undefined;
}

interface IFormData {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  isScheduled: boolean;
  scheduleDate: string;
  scheduleTime: string;
}

interface IValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  slug: {
    required: boolean;
    pattern: RegExp;
    minLength: number;
    maxLength: number;
  };
  content: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  tags: {
    maxCount: number;
    maxLength: number;
  };
  media: {
    maxCount: number;
    maxSize: number;
    allowedTypes: string[];
  };
}

const router = useRouter();
const authorStore = useAuthorStore();
const authStore = useAuthStore();

// State
const contentType = ref<'post' | 'comment'>('post');
const form = reactive<IFormData>({
  title: '',
  slug: '',
  content: '',
  tags: [],
  isScheduled: false,
  scheduleDate: '',
  scheduleTime: '',
});
const errors = reactive<Record<string, string | undefined>>({});
const isSubmitting = ref(false);
const showPreview = ref(false);
const tagInput = ref('');
const uploadedMedia = ref<IMediaFile[]>([]);
const isUploading = ref(false);
const previewMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop');

const validationRules: IValidationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  slug: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    minLength: 3,
    maxLength: 50,
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 10000,
  },
  tags: {
    maxCount: 5,
    maxLength: 20,
  },
  media: {
    maxCount: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Computed
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Methods
const validateTitle = (title: string): string | undefined => {
  if (!title) {
    return 'Title is required';
  }
  if (title.length < validationRules.title.minLength) {
    return `Title must be at least ${validationRules.title.minLength} characters`;
  }
  if (title.length > validationRules.title.maxLength) {
    return `Title must not exceed ${validationRules.title.maxLength} characters`;
  }
  return undefined;
};

const validateSlug = (slug: string): string | undefined => {
  if (!slug) {
    return 'URL slug is required';
  }
  if (!validationRules.slug.pattern.test(slug)) {
    return 'URL slug can only contain lowercase letters, numbers, and hyphens';
  }
  if (slug.length < validationRules.slug.minLength) {
    return `URL slug must be at least ${validationRules.slug.minLength} characters`;
  }
  if (slug.length > validationRules.slug.maxLength) {
    return `URL slug must not exceed ${validationRules.slug.maxLength} characters`;
  }
  return undefined;
};

const validateContent = (content: string): string | undefined => {
  if (!content) {
    return 'Content is required';
  }
  if (content.length < validationRules.content.minLength) {
    return `Content must be at least ${validationRules.content.minLength} characters`;
  }
  if (content.length > validationRules.content.maxLength) {
    return `Content must not exceed ${validationRules.content.maxLength} characters`;
  }
  return undefined;
};

const validateTags = (tags: string[]): string | undefined => {
  if (tags.length > validationRules.tags.maxCount) {
    return `Maximum ${validationRules.tags.maxCount} tags allowed`;
  }
  for (const tag of tags) {
    if (tag.length > validationRules.tags.maxLength) {
      return `Tag length must not exceed ${validationRules.tags.maxLength} characters`;
    }
  }
  return undefined;
};

const validateMedia = (media: IMediaFile[]): string | undefined => {
  if (media.length > validationRules.media.maxCount) {
    return `Maximum ${validationRules.media.maxCount} media files allowed`;
  }
  for (const file of media) {
    if (file.file.size > validationRules.media.maxSize) {
      return `File size must be less than ${validationRules.media.maxSize / (1024 * 1024)}MB`;
    }
    if (!validationRules.media.allowedTypes.includes(file.file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }
  }
  return undefined;
};

const validateForm = (): boolean => {
  let isValid = true;
  errors.title = validateTitle(form.title);
  errors.slug = validateSlug(form.slug);
  errors.content = validateContent(form.content);
  errors.tags = validateTags(form.tags);
  errors.media = validateMedia(uploadedMedia.value);

  if (form.isScheduled) {
    if (!form.scheduleDate || !form.scheduleTime) {
      errors.schedule = 'Scheduled date and time are required';
      isValid = false;
    } else {
      const scheduledDate = new Date(`${form.scheduleDate}T${form.scheduleTime}`);
      if (scheduledDate <= new Date()) {
        errors.schedule = 'Scheduled date must be in the future';
        isValid = false;
      }
    }
  }

  return isValid && !Object.values(errors).some((error) => error !== undefined);
};

const handleMediaUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const mediaError = validateMedia([
    ...uploadedMedia.value,
    { id: '', name: file.name, previewUrl: '', file, uploadProgress: 0, uploadError: undefined },
  ]);

  if (mediaError) {
    errors.media = mediaError;
    return;
  }

  const reader = new FileReader();
  const mediaFile: IMediaFile = {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    previewUrl: '',
    file,
    uploadProgress: 0,
    uploadError: undefined,
  };

  reader.onload = (e) => {
    mediaFile.previewUrl = e.target?.result as string;
    uploadedMedia.value.push(mediaFile);
    errors.media = undefined;
    uploadMedia(file);
  };

  reader.readAsDataURL(file);
  input.value = '';
};

const uploadMedia = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authorStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

const removeMedia = (id: string) => {
  const mediaIndex = uploadedMedia.value.findIndex((media) => media.id === id);
  if (mediaIndex !== -1) {
    const media = uploadedMedia.value[mediaIndex];
    if (media.uploadProgress < 100) {
      // TODO: Cancel upload if in progress
    }
    uploadedMedia.value.splice(mediaIndex, 1);
  }
};

const addTag = () => {
  if (!tagInput.value) return;

  const tag = tagInput.value.trim();
  if (tag && !form.tags.includes(tag)) {
    const tagError = validateTags([...form.tags, tag]);
    if (tagError) {
      errors.tags = tagError;
      return;
    }
    form.tags.push(tag);
    tagInput.value = '';
    errors.tags = undefined;
  }
};

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag);
};

const previewContent = () => {
  if (validateForm()) {
    showPreview.value = true;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const postData = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content.trim(),
      tags: form.tags,
      isScheduled: form.isScheduled,
      scheduleDate: form.isScheduled ? form.scheduleDate.trim() : undefined,
      scheduleTime: form.isScheduled ? form.scheduleTime.trim() : undefined,
      media: uploadedMedia.value.map((media) => ({
        name: media.name,
        url: media.previewUrl,
        type: media.file.type,
      })),
    };

    const response = await apiPost('/v1/blog', postData);

    if (response.success) {
      // Redirect to content management view
      router.push('/author/content');
    } else {
      throw new Error(response.message || 'Failed to create content');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    errors.submit = error instanceof Error ? error.message : 'Failed to create content';
  } finally {
    isSubmitting.value = false;
  }
};

// Authentication check
const checkAuth = async () => {
  try {
    // First try author authentication
    if (!authorStore.isAuthenticated) {
      await authorStore.checkAuth();
    }

    // If author auth failed, try regular user auth
    if (!authorStore.isAuthenticated && !authStore.isAuthenticated) {
      await authStore.fetchUserData();
    }

    // If neither auth method worked, redirect to login
    if (!authorStore.isAuthenticated && !authStore.isAuthenticated) {
      console.log('No authenticated user found, redirecting to login');
      router.push('/auth');
      return;
    }

    // Check if user has permission to create content
    if (!authorStore.hasPermission(AuthorPermission.CREATE_POST) && !authStore.isAuthor) {
      console.log('User does not have permission to create content');
      router.push('/author/dashboard');
      return;
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    router.push('/auth');
  }
};

onMounted(async () => {
  await checkAuth();
});
</script>

<style scoped>
.author-content-creator {
  padding: var(--spacing-md);
}

.author-content-creator__header {
  margin-bottom: var(--spacing-lg);
}

.author-content-creator__title {
  margin-bottom: var(--spacing-md);
}

.author-content-creator__type-selector {
  margin-bottom: var(--spacing-md);
}

.author-content-creator__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.author-content-creator__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.author-content-creator__label {
  font-size: var(--font-size-sm);
  font-weight: bold;
}

.author-content-creator__input,
.author-content-creator__select,
.author-content-creator__textarea {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.author-content-creator__input--error,
.author-content-creator__textarea--error {
  border-color: var(--color-danger);
}

.author-content-creator__error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.author-content-creator__editor {
  min-height: 300px;
}

.author-content-creator__textarea {
  width: 100%;
  min-height: 300px;
  resize: vertical;
}

.author-content-creator__media-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.author-content-creator__media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.author-content-creator__media-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.author-content-creator__media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.author-content-creator__media-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-content-creator__tags {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.author-content-creator__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.author-content-creator__tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius-sm);
}

.author-content-creator__tag-remove {
  color: var(--color-danger);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-lg);
}

.author-content-creator__schedule {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.author-content-creator__schedule-details {
  display: flex;
  gap: var(--spacing-sm);
}

.author-content-creator__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.author-content-creator__button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: bold;
}

.author-content-creator__button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.author-content-creator__button--secondary {
  background-color: var(--color-background-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.author-content-creator__preview {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.author-content-creator__preview-title {
  margin-bottom: var(--spacing-md);
}

.author-content-creator__preview-content {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.author-content-creator__media-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: var(--color-background-alt);
}

.author-content-creator__media-progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.author-content-creator__media-error {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-xs);
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  text-align: center;
}
</style> 