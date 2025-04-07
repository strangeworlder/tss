import { ref, computed } from 'vue'
import { getImageUrl } from '@/api/imageService'
import { fetchImageMetadata } from '@/api/imageService'
import type { ImageMetadata } from '@/types/image'
import { ImageSizeEnum } from '@/types/image'

export function useImage(filename: string) {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const metadata = ref<ImageMetadata | null>(null)

  const fetchMetadata = async () => {
    loading.value = true
    error.value = null

    try {
      metadata.value = await fetchImageMetadata(filename)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      loading.value = false
    }
  }

  // Computed URLs for different sizes
  const thumbnailUrl = computed(() => getImageUrl(filename, ImageSizeEnum.THUMBNAIL))
  const mediumUrl = computed(() => getImageUrl(filename, ImageSizeEnum.MEDIUM))
  const fullUrl = computed(() => getImageUrl(filename, ImageSizeEnum.FULL))

  return {
    loading,
    error,
    metadata,
    fetchMetadata,
    getUrl: (size?: ImageSizeEnum) => getImageUrl(filename, size),
    thumbnailUrl,
    mediumUrl,
    fullUrl,
  }
}
