<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';
import { deleteBlogPost } from '@/api/blogService';
import type { IUser } from '@/types/user';
import type { IBlogPost } from '@/types/blog';
import { BlogPostStatus, BlogPostModerationStatus } from '@/types/blog';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';

const props = defineProps<{
  postId: string | null;
}>();

const emit = defineEmits<(e: 'back') => void>();

const blogStore = useBlogStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);

// Form data
const title = ref('');
const content = ref('');
const excerpt = ref('');
const publishedAt = ref('');
const isPublished = ref(true);
const status = ref<BlogPostStatus>(BlogPostStatus.DRAFT);
const publishAt = ref('');
const timezone = ref('UTC');
const authorType = ref<'user' | 'text'>('user');
const selectedUserId = ref<string>('');
const authorName = ref('');
const tags = ref<string[]>([]);
const newTag = ref('');
const heroImage = ref<File | null>(null);
const heroImagePreview = ref<string | null>(null);

const showDeleteConfirm = ref(false);

const isAdmin = computed(() => authStore.isAdmin);
const currentUser = computed(() => authStore.user);
const users = ref<IUser[]>([]);

// Add this helper function after the imports
const getUserIdentifier = (user: IUser): string => {
  // Handle both _id and id properties
  return (user as any)._id || user.id;
};

// Load users for admin selection
onMounted(async () => {
  if (isAdmin.value) {
    try {
      console.log('Fetching users...');
      const fetchedUsers = await userStore.fetchUsers();
      // Map the users to ensure we have the correct ID field
      users.value = fetchedUsers.map((user: IUser) => ({
        ...user,
        id: getUserIdentifier(user), // Use the helper function to get the correct ID
      }));
      console.log('Fetched users:', users.value);
      console.log('First user ID:', users.value[0]?.id);
      console.log('First user data:', users.value[0]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }
});

// Watch for postId changes to load post data
watch(
  () => props.postId,
  async (newId) => {
    if (newId) {
      await loadPost(newId);
    } else {
      loading.value = false;
      resetForm();
    }
  }
);

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
      publishedAt.value = post.publishedAt
        ? new Date(post.publishedAt).toISOString().split('T')[0]
        : '';
      isPublished.value = post.isPublished;
      status.value = post.status;
      if (post.publishAt) {
        publishAt.value = new Date(post.publishAt).toISOString().slice(0, 16);
      }
      timezone.value = post.timezone || 'UTC';

      // Set author data based on type
      if (post.author.type === 'user') {
        authorType.value = 'user';
        selectedUserId.value = (post.author as any)._id || post.author.id || '';
        authorName.value = post.author.name;
      } else {
        authorType.value = 'text';
        authorName.value = post.author.name;
      }

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
  publishedAt.value = new Date().toISOString().split('T')[0];
  isPublished.value = true;
  status.value = BlogPostStatus.DRAFT;
  publishAt.value = '';
  timezone.value = 'UTC';
  authorType.value = 'user';
  selectedUserId.value = '';
  authorName.value = '';
  tags.value = [];
  heroImage.value = null;
  heroImagePreview.value = null;
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    console.log('File selected:', input.files[0]);
    heroImage.value = input.files[0];
    heroImagePreview.value = URL.createObjectURL(input.files[0]);
    console.log('heroImage value set to:', heroImage.value);
    console.log('Preview URL created:', heroImagePreview.value);
  }
};

const addTag = () => {
  if (newTag.value.trim() && !tags.value.includes(newTag.value.trim())) {
    tags.value.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter((tag) => tag !== tagToRemove);
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('content', content.value);
    formData.append('excerpt', excerpt.value);
    formData.append(
      'publishedAt',
      publishedAt.value ? new Date(publishedAt.value).toISOString() : ''
    );
    formData.append('isPublished', isPublished.value.toString());
    formData.append('status', status.value);
    if (status.value === BlogPostStatus.SCHEDULED) {
      if (!publishAt.value) {
        throw new Error('Please select a publish date and time');
      }
      formData.append('publishAt', new Date(publishAt.value).toISOString());
      formData.append('timezone', timezone.value);
    }
    formData.append('tags', JSON.stringify(tags.value));

    // Set author based on type and user role
    if (isAdmin.value) {
      if (authorType.value === 'user') {
        if (!selectedUserId.value) {
          throw new Error('Please select a user');
        }

        const selectedUser = users.value.find(
          (user) => getUserIdentifier(user) === selectedUserId.value
        );
        if (!selectedUser) {
          throw new Error('Selected user not found');
        }

        const authorData = {
          type: 'user',
          id: getUserIdentifier(selectedUser),
          name: `${selectedUser.firstName} ${selectedUser.lastName}`,
          avatar: selectedUser.avatar
            ? {
                filename: selectedUser.avatar.filename,
                altText: selectedUser.avatar.altText,
              }
            : undefined,
        };
        formData.append('author', JSON.stringify(authorData));
      } else if (authorType.value === 'text') {
        if (!authorName.value.trim()) {
          throw new Error('Author name is required');
        }
        const authorData = {
          type: 'text',
          name: authorName.value.trim(),
        };
        formData.append('author', JSON.stringify(authorData));
      }
    } else if (currentUser.value) {
      // Non-admin users can only post as themselves
      const authorData = {
        type: 'user',
        id: getUserIdentifier(currentUser.value),
        name: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
        avatar: currentUser.value.avatar
          ? {
              filename: currentUser.value.avatar.filename,
              altText: currentUser.value.avatar.altText,
            }
          : undefined,
      };
      formData.append('author', JSON.stringify(authorData));
    } else {
      throw new Error('No user found for author');
    }

    // Add the hero image if one is selected
    if (heroImage.value) {
      console.log('Adding hero image to FormData:', heroImage.value);
      formData.append('heroImage', heroImage.value);
      console.log('FormData entries after adding hero image:', Array.from(formData.entries()));
    } else {
      console.log('No hero image to add to FormData');
    }

    if (props.postId) {
      await blogStore.updatePost(props.postId, formData);
    } else {
      await blogStore.createPost(formData);
    }

    emit('back');
  } catch (err) {
    console.error('Error saving post:', err);
    error.value = err instanceof Error ? err.message : 'Failed to save post';
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (!blogStore.currentPost?.id) return;

  try {
    await deleteBlogPost(blogStore.currentPost.id);
    // Show success message
    blogStore.setNotification({
      type: 'success',
      message: 'Post deleted successfully',
    });
    // Emit back event to return to the list
    emit('back');
  } catch (error) {
    console.error('Error deleting post:', error);
    blogStore.setNotification({
      type: 'error',
      message: error instanceof Error ? error.message : 'Failed to delete post',
    });
  }
};

// Add this computed property after the other computed properties
const minPublishDate = computed(() => {
  const now = new Date();
  return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
});

// Update the createInitialPost function
const createInitialPost = (user: IUser): IBlogPost => {
  return {
    id: user.id,
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: {
      type: 'user' as const,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
    },
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: false,
    status: BlogPostStatus.DRAFT,
    timezone: 'UTC',
    version: 1,
    hasActiveUpdate: false,
    moderationStatus: BlogPostModerationStatus.PENDING,
    abuseScore: 0,
  };
};

onMounted(() => {
  if (props.postId) {
    loadPost(props.postId);
  } else {
    loading.value = false;
    resetForm();
  }
});
</script>

<template>
  <div class="blog-post-editor">
    <!-- Notification -->
    <div
      v-if="blogStore.notification"
      :class="[
        'blog-post-editor__notification',
        `blog-post-editor__notification--${blogStore.notification.type}`,
      ]"
    >
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
      <AppButton
        @click="props.postId ? loadPost(props.postId) : resetForm()"
        :variant="ButtonVariantEnum.DANGER"
      >
        Try Again
      </AppButton>
    </div>

    <!-- Editor form -->
    <form v-else @submit.prevent="handleSubmit" class="blog-post-editor__form">
      <div class="blog-post-editor__header">
        <h2 class="blog-post-editor__title">
          {{ props.postId ? 'Edit Post' : 'New Post' }}
        </h2>
        <AppButton type="button" @click="emit('back')" :variant="ButtonVariantEnum.SECONDARY">
          Back to List
        </AppButton>
      </div>

      <div class="blog-post-editor__field">
        <label for="title" class="blog-post-editor__label">Title</label>
        <input id="title" v-model="title" type="text" required class="blog-post-editor__input" />
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
            <span v-for="tag in tags" :key="tag" class="blog-post-editor__tag">
              {{ tag }}
              <AppButton
                type="button"
                @click="removeTag(tag)"
                :variant="ButtonVariantEnum.TEXT"
                class="blog-post-editor__tag-remove"
              >
                ×
              </AppButton>
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
            <AppButton type="button" @click="addTag" :variant="ButtonVariantEnum.SECONDARY">
              Add
            </AppButton>
          </div>
        </div>
      </div>

      <div class="blog-post-editor__field">
        <label class="blog-post-editor__label">Hero Image</label>
        <div class="blog-post-editor__image-upload">
          <div
            v-if="heroImagePreview || blogStore.currentPost?.heroImage"
            class="blog-post-editor__image-preview"
          >
            <AppImage
              v-if="blogStore.currentPost?.heroImage?.filename && !heroImagePreview"
              :filename="blogStore.currentPost.heroImage.filename"
              :alt="blogStore.currentPost.heroImage.altText || title"
              :size="ImageSizeEnum.MEDIUM"
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
            :key="heroImage ? 'has-file' : 'no-file'"
          />
        </div>
      </div>

      <!-- Author Selection -->
      <div class="blog-post-editor__field">
        <label class="blog-post-editor__label">Author</label>
        <div v-if="isAdmin" class="blog-post-editor__author-options">
          <div class="blog-post-editor__radio-group">
            <input
              type="radio"
              id="author-type-user"
              v-model="authorType"
              value="user"
              class="blog-post-editor__radio"
            />
            <label for="author-type-user" class="blog-post-editor__radio-label">Select User</label>
          </div>
          <div class="blog-post-editor__radio-group">
            <input
              type="radio"
              id="author-type-text"
              v-model="authorType"
              value="text"
              class="blog-post-editor__radio"
            />
            <label for="author-type-text" class="blog-post-editor__radio-label">Free Text</label>
          </div>
        </div>

        <!-- User Selection (for admins) -->
        <select
          v-if="isAdmin && authorType === 'user'"
          v-model="selectedUserId"
          class="blog-post-editor__select"
        >
          <option value="">Select a user</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.firstName }} {{ user.lastName }}
          </option>
        </select>

        <!-- Free Text Input (for admins) -->
        <input
          v-if="isAdmin && authorType === 'text'"
          v-model="authorName"
          type="text"
          placeholder="Enter author name"
          class="blog-post-editor__input"
        />

        <!-- Non-admin users see their own name -->
        <div v-if="!isAdmin" class="blog-post-editor__current-user">
          {{ currentUser?.firstName }} {{ currentUser?.lastName }}
        </div>
      </div>

      <div class="blog-post-editor__publishing">
        <h3 class="blog-post-editor__section-title">Publishing Options</h3>
        
        <div class="blog-post-editor__publish-options">
          <div class="blog-post-editor__status-select">
            <label for="status">Status:</label>
            <select 
              id="status" 
              v-model="status" 
              class="blog-post-editor__select"
            >
              <option :value="BlogPostStatus.DRAFT">Draft</option>
              <option :value="BlogPostStatus.PUBLISHED">Publish Immediately</option>
              <option :value="BlogPostStatus.SCHEDULED">Schedule</option>
            </select>
          </div>

          <div 
            v-if="status === BlogPostStatus.SCHEDULED" 
            class="blog-post-editor__schedule-options"
          >
            <div class="blog-post-editor__datetime">
              <label for="publishAt">Publish Date and Time:</label>
              <input
                id="publishAt"
                v-model="publishAt"
                type="datetime-local"
                class="blog-post-editor__input"
                :min="minPublishDate"
              />
            </div>
            
            <div class="blog-post-editor__timezone">
              <label for="timezone">Timezone:</label>
              <select 
                id="timezone" 
                v-model="timezone" 
                class="blog-post-editor__select"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="blog-post-editor__actions">
        <AppButton type="submit" :disabled="saving" :variant="ButtonVariantEnum.PRIMARY">
          {{ saving ? 'Saving...' : props.postId ? 'Update Post' : 'Create Post' }}
        </AppButton>

        <AppButton
          v-if="props.postId"
          type="button"
          :variant="ButtonVariantEnum.DANGER"
          @click="showDeleteConfirm = true"
          :disabled="loading"
        >
          Delete Post
        </AppButton>
      </div>
    </form>

    <!-- Delete confirmation dialog -->
    <div v-if="showDeleteConfirm" class="blog-post-editor__delete-confirm">
      <div class="blog-post-editor__delete-confirm-content">
        <h3>Delete Post</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div class="blog-post-editor__delete-confirm-actions">
          <AppButton :variant="ButtonVariantEnum.SECONDARY" @click="showDeleteConfirm = false">
            Cancel
          </AppButton>
          <AppButton :variant="ButtonVariantEnum.DANGER" @click="handleDelete"> Delete </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-editor {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.blog-post-editor__notification {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
}

.blog-post-editor__notification--success {
  background-color: var(--color-success);
  color: var(--color-text-on-success);
}

.blog-post-editor__notification--error {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
}

.blog-post-editor__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
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
  margin-bottom: var(--spacing-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-post-editor__error {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-danger);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
}

.blog-post-editor__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.blog-post-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.blog-post-editor__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-family: var(--font-family-base);
}

.blog-post-editor__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.blog-post-editor__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-family: var(--font-family-base);
}

.blog-post-editor__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-input);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-family: var(--font-family-input);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.blog-post-editor__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.blog-post-editor__textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background-input);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-family: var(--font-family-input);
  resize: vertical;
  min-height: calc(var(--spacing-md) * 15);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.blog-post-editor__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.blog-post-editor__button--back {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.blog-post-editor__button--back:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--retry {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}

.blog-post-editor__button--retry:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--submit {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.blog-post-editor__button--submit:hover {
  background-color: var(--color-primary-dark);
}

.blog-post-editor__button--delete {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
}

.blog-post-editor__button--delete:hover {
  background-color: var(--color-danger-dark);
}

.blog-post-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.blog-post-editor__tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background-muted);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
}

.blog-post-editor__tag-remove {
  padding: 0 var(--spacing-xs);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.blog-post-editor__tag-input {
  display: flex;
  gap: var(--spacing-sm);
}

.blog-post-editor__image-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.blog-post-editor__image-preview {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-sm);
}

.blog-post-editor__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-post-editor__file-input {
  padding: var(--spacing-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.blog-post-editor__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.blog-post-editor__checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.blog-post-editor__checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
}

.blog-post-editor__checkbox-label {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.blog-post-editor__delete-button {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.blog-post-editor__delete-button:hover {
  background-color: var(--color-danger-dark);
}

.blog-post-editor__delete-confirm {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-background-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal-backdrop);
}

.blog-post-editor__delete-confirm-content {
  background-color: var(--color-background);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 90%;
}

.blog-post-editor__delete-confirm h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--color-danger);
}

.blog-post-editor__delete-confirm p {
  margin: 0 0 var(--spacing-xl);
  color: var(--color-text);
}

.blog-post-editor__delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.blog-post-editor__delete-confirm-cancel {
  background-color: var(--color-background-muted);
  color: var(--color-text);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.blog-post-editor__delete-confirm-delete {
  background-color: var(--color-danger);
  color: var(--color-text-on-danger);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.blog-post-editor__delete-confirm-cancel:hover {
  background-color: var(--color-border);
}

.blog-post-editor__delete-confirm-delete:hover {
  background-color: var(--color-danger-dark);
}

.blog-post-editor__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.blog-post-editor__publishing {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

.blog-post-editor__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.blog-post-editor__publish-options {
  display: grid;
  gap: var(--spacing-md);
}

.blog-post-editor__schedule-options {
  display: grid;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background-alt);
  border-radius: var(--border-radius);
}

.blog-post-editor__select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-base);
}

.blog-post-editor__select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}
</style>
