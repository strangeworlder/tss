<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';
import { deleteBlogPost } from '@/api/blogService';
import { useRouter } from 'vue-router';
import type { BlogPost } from '@/types/blog';
import type { IUser } from '@/types/user';
import Button from '@/components/atoms/Button.vue';
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
const authorType = ref<'user' | 'text'>('user');
const selectedUserId = ref<string>('');
const authorName = ref('');
const tags = ref<string[]>([]);
const newTag = ref('');
const heroImage = ref<File | null>(null);
const heroImagePreview = ref<string | null>(null);

const router = useRouter();
const showDeleteConfirm = ref(false);

const isAdmin = computed(() => authStore.isAdmin);
const currentUser = computed(() => authStore.user);
const users = ref<IUser[]>([]);

// Load users for admin selection
onMounted(async () => {
  if (isAdmin.value) {
    try {
      console.log('Fetching users...');
      const fetchedUsers = await userStore.fetchUsers();
      // Map the users to ensure we have the correct ID field
      users.value = fetchedUsers.map((user: IUser) => ({
        ...user,
        id: user._id || user.id, // Use _id if available, fallback to id
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

      // Set author data based on type
      if (post.author.type === 'user') {
        authorType.value = 'user';
        selectedUserId.value = post.author.id || '';
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
  authorName.value = '';
  tags.value = [];
  heroImage.value = null;
  heroImagePreview.value = null;
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
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
  tags.value = tags.value.filter((tag) => tag !== tagToRemove);
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = null;

  try {
    console.log('Starting form submission...');
    console.log('Current authorType:', authorType.value);
    console.log('Current selectedUserId:', selectedUserId.value);
    console.log('Current selectedUserId type:', typeof selectedUserId.value);
    console.log('Available users:', users.value);
    console.log('Users array length:', users.value.length);
    console.log('First user ID:', users.value[0]?.id);
    console.log('First user ID type:', typeof users.value[0]?.id);
    console.log(
      'Selected user:',
      users.value.find((u) => u.id === selectedUserId.value)
    );

    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('content', content.value);
    formData.append('excerpt', excerpt.value);
    formData.append(
      'publishedAt',
      publishedAt.value ? new Date(publishedAt.value).toISOString() : ''
    );
    formData.append('isPublished', isPublished.value.toString());
    formData.append('tags', JSON.stringify(tags.value));

    // Set author based on type and user role
    if (isAdmin.value) {
      console.log('Processing admin author selection...');
      console.log('Selected author type:', authorType.value);

      if (authorType.value === 'user') {
        console.log('User author selected, userId:', selectedUserId.value);
        console.log('UserId type:', typeof selectedUserId.value);
        console.log('Users array:', users.value);
        console.log('Users array length:', users.value.length);

        if (!selectedUserId.value) {
          console.error('No user selected');
          throw new Error('Please select a user');
        }

        const selectedUser = users.value.find((user: IUser) => {
          console.log('Comparing user ID:', user.id, 'with selected ID:', selectedUserId.value);
          console.log(
            'User ID type:',
            typeof user.id,
            'Selected ID type:',
            typeof selectedUserId.value
          );
          return user.id === selectedUserId.value;
        });

        console.log('Found selected user:', selectedUser);

        if (!selectedUser) {
          console.error('Selected user not found');
          throw new Error('Selected user not found');
        }

        const authorData = {
          type: 'user',
          id: selectedUser.id,
          name: `${selectedUser.firstName} ${selectedUser.lastName}`,
          avatar: selectedUser.avatar
            ? {
                filename: selectedUser.avatar.filename,
                altText: selectedUser.avatar.altText,
              }
            : undefined,
        };
        console.log('Setting author data:', authorData);
        formData.append('author', JSON.stringify(authorData));
      } else if (authorType.value === 'text') {
        console.log('Text author selected, name:', authorName.value);
        if (!authorName.value.trim()) {
          throw new Error('Author name is required');
        }
        const authorData = {
          type: 'text',
          name: authorName.value.trim(),
        };
        console.log('Setting author data:', authorData);
        formData.append('author', JSON.stringify(authorData));
      } else {
        console.error('Invalid author type:', authorType.value);
        throw new Error('Invalid author type selected');
      }
    } else if (currentUser.value) {
      console.log('Processing non-admin author selection...');
      const authorData = {
        type: 'user',
        id: currentUser.value.id,
        name: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
        avatar: currentUser.value.avatar
          ? {
              filename: currentUser.value.avatar.filename,
              altText: currentUser.value.avatar.altText,
            }
          : undefined,
      };
      console.log('Setting author data:', authorData);
      formData.append('author', JSON.stringify(authorData));
    } else {
      console.error('No current user found');
      throw new Error('No user found for author');
    }

    if (heroImage.value) {
      formData.append('heroImage', heroImage.value);
    }

    console.log('Submitting form data:', Object.fromEntries(formData.entries()));

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
      <Button @click="props.postId ? loadPost(props.postId) : resetForm()" :variant="ButtonVariantEnum.DANGER">
        Try Again
      </Button>
    </div>

    <!-- Editor form -->
    <form v-else @submit.prevent="handleSubmit" class="blog-post-editor__form">
      <div class="blog-post-editor__header">
        <h2 class="blog-post-editor__title">
          {{ props.postId ? 'Edit Post' : 'New Post' }}
        </h2>
        <Button type="button" @click="emit('back')" :variant="ButtonVariantEnum.SECONDARY"> Back to List </Button>
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
              <Button
                type="button"
                @click="removeTag(tag)"
                :variant="ButtonVariantEnum.TEXT"
                class="blog-post-editor__tag-remove"
              >
                ×
              </Button>
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
            <Button type="button" @click="addTag" :variant="ButtonVariantEnum.SECONDARY"> Add </Button>
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

      <div class="blog-post-editor__actions">
        <Button type="submit" :disabled="saving" :variant="ButtonVariantEnum.PRIMARY">
          {{ saving ? 'Saving...' : props.postId ? 'Update Post' : 'Create Post' }}
        </Button>

        <Button
          v-if="props.postId"
          type="button"
          :variant="ButtonVariantEnum.DANGER"
          @click="showDeleteConfirm = true"
          :disabled="loading"
        >
          Delete Post
        </Button>
      </div>
    </form>

    <!-- Delete confirmation dialog -->
    <div v-if="showDeleteConfirm" class="blog-post-editor__delete-confirm">
      <div class="blog-post-editor__delete-confirm-content">
        <h3>Delete Post</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div class="blog-post-editor__delete-confirm-actions">
          <Button :variant="ButtonVariantEnum.SECONDARY" @click="showDeleteConfirm = false"> Cancel </Button>
          <Button :variant="ButtonVariantEnum.DANGER" @click="handleDelete"> Delete </Button>
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
  padding: var(--spacing-4);
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.blog-post-editor__notification {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
}

.blog-post-editor__notification--success {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
}

.blog-post-editor__notification--error {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
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
  border-top-color: var(--color-highlight-1);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-post-editor__error {
  text-align: center;
  padding: var(--spacing-4);
  color: var(--color-highlight-1);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-heading);
  font-family: var(--font-family-base);
}

.blog-post-editor__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.blog-post-editor__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-family: var(--font-family-base);
}

.blog-post-editor__input,
.blog-post-editor__textarea {
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.blog-post-editor__input:focus,
.blog-post-editor__textarea:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.blog-post-editor__textarea {
  resize: vertical;
  min-height: 100px;
}

.blog-post-editor__button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.blog-post-editor__button--back {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.blog-post-editor__button--back:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--retry {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.blog-post-editor__button--retry:hover {
  background-color: var(--color-border);
}

.blog-post-editor__button--submit {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
}

.blog-post-editor__button--submit:hover {
  background-color: var(--color-highlight-2);
}

.blog-post-editor__button--delete {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
}

.blog-post-editor__button--delete:hover {
  background-color: var(--color-highlight-2);
}

.blog-post-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.blog-post-editor__tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
}

.blog-post-editor__tag-remove {
  padding: 0 var(--spacing-1);
  line-height: 1;
  font-size: var(--font-size-lg);
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
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-2);
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

.blog-post-editor__checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
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
  background-color: var(--color-highlight-1);
  color: var(--color-background);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-button:hover {
  background-color: var(--color-highlight-2);
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
  color: var(--color-highlight-1);
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
  background-color: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-confirm-delete {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.blog-post-editor__delete-confirm-cancel:hover {
  background-color: var(--color-border);
}

.blog-post-editor__delete-confirm-delete:hover {
  background-color: var(--color-highlight-2);
}

.blog-post-editor__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}
</style>
