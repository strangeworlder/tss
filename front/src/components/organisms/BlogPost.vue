<!--
@component BlogPost
@description A component that displays a blog post with scheduling support.

@features
- Displays blog post content with markdown rendering
- Shows hero image if available
- Handles loading, error, and not found states
- Displays scheduled post preview and status
- Provides navigation back to blog listing
- Supports editing and canceling scheduled posts

@props {
  post: {
    type: IBlogPost
    required: true
    description: "The blog post data to display"
  }
  scheduledContent: {
    type: IScheduledContent
    required: false
    description: "The scheduled content data if the post is scheduled"
  }
  hasActiveUpdate: {
    type: boolean
    required: false
    description: "Whether there is an active update for the post"
  }
}

@events {
  edit: Emitted when the edit button is clicked
  cancel: Emitted when the cancel button is clicked
  retry: Emitted when the retry button is clicked
}

@accessibility
- Uses semantic HTML elements (article, div)
- Provides meaningful alt text for images
- Maintains proper heading hierarchy
- Supports keyboard navigation
- Provides clear error messages
-->

<script setup lang="ts">
import type { IBlogPost } from '@/types/blog';
import type { IUser } from '@/types/user';
import type { IScheduledContent } from '@/types/scheduling';
import { ref, computed } from 'vue';
import { formatDate } from '@/utils/date';
import BlogPostHeader from '@/components/molecules/BlogPostHeader.vue';
import BlogPostContent from '@/components/molecules/BlogPostContent.vue';
import BlogPostFooter from '@/components/molecules/BlogPostFooter.vue';
import CommentList from '@/components/organisms/CommentList.vue';
import CommentForm from '@/components/molecules/CommentForm.vue';
import ScheduledPostPreview from '@/components/molecules/ScheduledPostPreview.vue';
import ScheduledPostStatus from '@/components/molecules/ScheduledPostStatus.vue';
import { CommentParentTypeEnum } from '@/types/comment';
import { ScheduledContentStatusEnum } from '@/types/scheduling';

interface Props {
  post: IBlogPost;
  currentUser?: IUser;
  scheduledContent?: IScheduledContent;
  hasActiveUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  scheduledContent: undefined,
  hasActiveUpdate: false,
});

const emit = defineEmits<{
  (e: 'like'): void;
  (e: 'share'): void;
  (e: 'comment', content: string): void;
  (e: 'reply', commentId: string): void;
  (e: 'edit', commentId: string): void;
  (e: 'delete', commentId: string): void;
  (e: 'editScheduled', contentId: string): void;
  (e: 'cancelScheduled', contentId: string): void;
  (e: 'retry'): void;
}>();

const handleLike = (): void => {
  emit('like');
};

const handleShare = (): void => {
  emit('share');
};

const handleComment = (content: string): void => {
  emit('comment', content);
};

const handleReply = (commentId: string): void => {
  emit('reply', commentId);
};

const handleEdit = (commentId: string): void => {
  emit('edit', commentId);
};

const handleDelete = (commentId: string): void => {
  emit('delete', commentId);
};

const handleEditScheduled = (contentId: string): void => {
  emit('editScheduled', contentId);
};

const handleCancelScheduled = (contentId: string): void => {
  emit('cancelScheduled', contentId);
};

const handleRetry = (): void => {
  emit('retry');
};
</script>

<template>
  <article class="blog-post">
    <div v-if="scheduledContent" class="blog-post__scheduled">
      <ScheduledPostPreview
        :content-id="post.id"
        :publish-at="scheduledContent.publishAt.toISOString()"
        :content="post.content"
        :version="scheduledContent.version"
        :has-active-update="hasActiveUpdate"
        @edit="handleEditScheduled"
        @cancel="handleCancelScheduled"
      />
      <ScheduledPostStatus
        :status="scheduledContent.status as ScheduledContentStatusEnum"
        :has-active-update="hasActiveUpdate"
        @retry="handleRetry"
      />
    </div>
    <BlogPostHeader :post="post" />
    <BlogPostContent :post="post" />
    <BlogPostFooter
      :post="post"
      :current-user="currentUser"
      @like="handleLike"
      @share="handleShare"
    />
    <section class="blog-post__comments">
      <h2 class="blog-post__comments-title">Comments</h2>
      <CommentForm
        v-if="currentUser"
        :post-id="post.id"
        @submit="handleComment"
      />
      <CommentList
        :parent-id="post.id"
        :parent-type="CommentParentTypeEnum.POST"
        :current-user="currentUser"
        @reply="handleReply"
        @edit="handleEdit"
        @delete="handleDelete"
        @edit-scheduled="handleEditScheduled"
        @cancel-scheduled="handleCancelScheduled"
      />
    </section>
  </article>
</template>

<style scoped>
.blog-post {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.blog-post__scheduled {
  margin-bottom: var(--spacing-lg);
}

.blog-post__comments {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.blog-post__comments-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}
</style> 