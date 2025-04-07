<template>
  <form @submit.prevent="handleSubmit" class="blog-form" ref="form">
    <!-- Title -->
    <div class="blog-form__field">
      <label class="blog-form__label">Title</label>
      <input v-model="formData.title" type="text" class="blog-form__input" required />
    </div>

    <!-- Content -->
    <div class="blog-form__field">
      <label class="blog-form__label">Content</label>
      <textarea v-model="formData.content" class="blog-form__textarea" required></textarea>
    </div>

    <!-- Excerpt -->
    <div class="blog-form__field">
      <label class="blog-form__label">Excerpt</label>
      <textarea v-model="formData.excerpt" class="blog-form__textarea" required></textarea>
    </div>

    <!-- Author Selection -->
    <div class="blog-form__field">
      <label class="blog-form__label">Author</label>
      <div v-if="isAdmin" class="blog-form__author-options">
        <div class="blog-form__radio-group">
          <input
            type="radio"
            id="author-type-user"
            v-model="authorType"
            value="user"
            class="blog-form__radio"
          />
          <label for="author-type-user" class="blog-form__radio-label">Select User</label>
        </div>
        <div class="blog-form__radio-group">
          <input
            type="radio"
            id="author-type-text"
            v-model="authorType"
            value="text"
            class="blog-form__radio"
          />
          <label for="author-type-text" class="blog-form__radio-label">Free Text</label>
        </div>
      </div>

      <!-- User Selection (for admins) -->
      <select
        v-if="isAdmin && authorType === 'user'"
        v-model="selectedUserId"
        class="blog-form__select"
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
        class="blog-form__input"
      />

      <!-- Non-admin users see their own name -->
      <div v-if="!isAdmin" class="blog-form__current-user">
        {{ currentUser?.firstName }} {{ currentUser?.lastName }}
      </div>
    </div>

    <!-- Hero Image -->
    <div class="blog-form__field">
      <label class="blog-form__label">Hero Image</label>
      <input type="file" accept="image/*" @change="handleImageChange" class="blog-form__input" />
      <img
        v-if="heroImagePreview"
        :src="heroImagePreview"
        alt="Hero image preview"
        class="blog-form__image-preview"
      />
    </div>

    <!-- Publish Date -->
    <div class="blog-form__field">
      <label class="blog-form__label">Publish Date</label>
      <input v-model="formData.publishedAt" type="date" class="blog-form__input" />
    </div>

    <!-- Published Status -->
    <div class="blog-form__field">
      <label class="blog-form__label">Published</label>
      <input v-model="formData.isPublished" type="checkbox" class="blog-form__checkbox" />
    </div>

    <!-- Tags -->
    <div class="blog-form__field">
      <label class="blog-form__label">Tags</label>
      <div class="blog-form__tags">
        <input
          v-model="newTag"
          type="text"
          placeholder="Add a tag"
          class="blog-form__input"
          @keydown.enter.prevent="addTag"
        />
        <Button type="button" @click="addTag" :variant="ButtonVariantEnum.SECONDARY" class="blog-form__tag-button">Add</Button>
      </div>
      <div class="blog-form__tag-list">
        <span v-for="tag in formData.tags" :key="tag" class="blog-form__tag">
          {{ tag }}
          <Button type="button" @click="removeTag(tag)" :variant="ButtonVariantEnum.TEXT" class="blog-form__tag-remove">×</Button>
        </span>
      </div>
    </div>

    <!-- Submit Button -->
    <Button type="submit" :variant="ButtonVariantEnum.PRIMARY" class="blog-form__submit" :disabled="loading">
      {{ loading ? 'Saving...' : 'Submit' }}
    </Button>

    <!-- Error Message -->
    <div v-if="error" class="blog-form__error">
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useBlogStore } from '@/stores/blogStore';
import Button from '@/components/atoms/Button.vue';
import { ButtonVariantEnum } from '@/types/button';
import type { BlogPost, Author } from '@/types/blog';
import type { IUser } from '@/types/user';

const props = defineProps<{
  postId?: string;
}>();

const emit = defineEmits<(e: 'back') => void>();

const authStore = useAuthStore();
const userStore = useUserStore();
const blogStore = useBlogStore();
const isAdmin = computed(() => authStore.isAdmin);
const currentUser = computed(() => authStore.user);

// Form state
const loading = ref(false);
const error = ref<string | null>(null);
const heroImage = ref<File | null>(null);
const heroImagePreview = ref<string | null>(null);
const newTag = ref('');

// Form data
const formData = reactive<Partial<BlogPost>>({
  title: '',
  content: '',
  excerpt: '',
  publishedAt: null,
  isPublished: false,
  tags: [],
  author: {} as Author,
});

// Author selection
const authorType = ref<'user' | 'text'>('user');
const selectedUserId = ref<string>('');
const authorName = ref<string>('');
const users = ref<IUser[]>([]);

const form = ref<HTMLFormElement | null>(null);

// Load users for admin selection
onMounted(async () => {
  if (isAdmin.value) {
    try {
      users.value = await userStore.fetchUsers();
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }

  // Load post data if editing
  if (props.postId) {
    loading.value = true;
    try {
      await blogStore.fetchPostById(props.postId);
      const post = blogStore.currentPost;

      if (post) {
        formData.title = post.title;
        formData.content = post.content;
        formData.excerpt = post.excerpt;
        formData.publishedAt = post.publishedAt
          ? new Date(post.publishedAt).toISOString().split('T')[0]
          : '';
        formData.isPublished = post.isPublished;
        formData.tags = [...(post.tags || [])];

        if (post.author.type === 'user') {
          authorType.value = 'user';
          selectedUserId.value = post.author.id || '';
          authorName.value = post.author.name;
        } else {
          authorType.value = 'text';
          authorName.value = post.author.name;
        }

        if (post.heroImage) {
          heroImagePreview.value = post.heroImage.url;
        }
      }
    } catch (err) {
      console.error('Error loading post:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load post';
    } finally {
      loading.value = false;
    }
  } else if (!isAdmin.value && currentUser.value) {
    // For non-admin users, set themselves as author
    authorType.value = 'user';
    selectedUserId.value = currentUser.value.id;
  }
});

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    heroImage.value = input.files[0];
    heroImagePreview.value = URL.createObjectURL(input.files[0]);
  }
};

const addTag = () => {
  if (newTag.value.trim() && !formData.tags?.includes(newTag.value.trim())) {
    formData.tags = [...(formData.tags || []), newTag.value.trim()];
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  formData.tags = formData.tags?.filter((tag) => tag !== tagToRemove);
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    loading.value = true;
    error.value = null;

    console.log('Starting form submission...');
    console.log('Current authorType:', authorType.value);
    console.log('Current selectedUserId:', selectedUserId.value);
    console.log('Current authorName:', authorName.value);
    console.log('Is admin:', isAdmin.value);
    console.log('Users list:', users.value);

    // Create FormData object
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title || '');
    submitFormData.append('content', formData.content || '');
    submitFormData.append('excerpt', formData.excerpt || '');
    submitFormData.append('publishedAt', formData.publishedAt || '');
    submitFormData.append('isPublished', (formData.isPublished ?? false).toString());
    submitFormData.append('tags', JSON.stringify(formData.tags || []));

    // Set author based on type and user role
    if (isAdmin.value) {
      console.log('Processing admin author selection...');
      console.log('Selected author type:', authorType.value);

      if (authorType.value === 'user') {
        console.log('User author selected, userId:', selectedUserId.value);
        if (!selectedUserId.value) {
          throw new Error('Please select a user');
        }
        const selectedUser = users.value.find((user: IUser) => user.id === selectedUserId.value);
        console.log('Found selected user:', selectedUser);
        if (!selectedUser) {
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
        submitFormData.append('author', JSON.stringify(authorData));
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
        submitFormData.append('author', JSON.stringify(authorData));
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
      submitFormData.append('author', JSON.stringify(authorData));
    } else {
      console.error('No current user found');
      throw new Error('No user found for author');
    }

    // Add hero image if selected
    if (heroImage.value) {
      submitFormData.append('heroImage', heroImage.value);
    }

    console.log('Submitting form data:', Object.fromEntries(submitFormData.entries()));

    if (props.postId) {
      await blogStore.updatePost(props.postId, submitFormData);
    } else {
      await blogStore.createPost(submitFormData);
    }

    emit('back');
  } catch (err) {
    console.error('Error submitting form:', err);
    error.value = err instanceof Error ? err.message : 'Error submitting form';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.blog-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.blog-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.blog-form__label {
  font-weight: bold;
}

.blog-form__input,
.blog-form__textarea,
.blog-form__select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.blog-form__textarea {
  min-height: 200px;
  resize: vertical;
}

.blog-form__author-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.blog-form__radio-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-form__radio {
  margin: 0;
}

.blog-form__radio-label {
  margin: 0;
}

.blog-form__select {
  width: 100%;
}

.blog-form__current-user {
  padding: 0.5rem;
  background-color: var(--color-background-alt);
  border-radius: 4px;
}

.blog-form__image-preview {
  max-width: 100%;
  max-height: 300px;
  margin-top: 1rem;
  border-radius: 4px;
}

.blog-form__tags {
  display: flex;
  gap: 0.5rem;
}

.blog-form__tag-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.blog-form__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.blog-form__tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-background-alt);
  border-radius: 4px;
}

.blog-form__tag-remove {
  padding: 0 0.25rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
}

.blog-form__submit {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  align-self: flex-start;
}

.blog-form__submit:hover {
  background-color: var(--color-primary-dark);
}

.blog-form__submit:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.blog-form__error {
  padding: 0.75rem;
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border-radius: 4px;
  margin-top: 1rem;
}
</style>
