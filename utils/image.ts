import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

/**
 * Builds Sanity CDN image URLs from an image field's asset reference.
 * SVGs are returned unmodified (the pipeline can't rasterize them); raster
 * images can be resized/cropped per use. Returns '' when no image is set.
 */
export function useImageUrl() {
  const { projectId, dataset } = useSanity().config
  const builder = createImageUrlBuilder({ projectId, dataset })

  const urlFor = (source: SanityImageSource | null | undefined) => {
    // Only a real image asset reference can become a URL. Anything else
    // (no image yet, or a leftover placeholder string) renders as no image.
    const ref = typeof source === 'string' ? source : (source as { asset?: { _ref?: string } } | null)?.asset?._ref
    if (!ref || !ref.startsWith('image-')) return null
    return builder.image(source as SanityImageSource)
  }

  return { urlFor }
}
