/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@apollo/client' {
  import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client/core'
  import { useQuery, useMutation, useApolloClient } from '@apollo/client/vue'
  export { useQuery, useMutation, useApolloClient }
  export { ApolloClient, InMemoryCache, ApolloLink }
}

declare module 'marked' {
  import { marked } from 'marked'
  export { marked }
  export default marked
}

declare module 'pinia' {
  import { defineStore } from 'pinia'
  export { defineStore }
}

declare module '@/stores/auth' {
  export { useAuthStore } from '@/stores/authStore'
}

declare module 'dompurify' {
  const DOMPurify: {
    sanitize: (content: string) => string
  }
  export default DOMPurify
}
