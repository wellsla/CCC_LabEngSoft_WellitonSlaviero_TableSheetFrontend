/**
 * Utility functions for handling image and document URLs
 */

/**
 * Default placeholder URLs for different types of content
 */
export const PLACEHOLDER_URLS = {
  AVATAR: 'https://placehold.co/200x200.png?text=User',
  PORTRAIT: 'https://placehold.co/300x400.png?text=Character',
  COVER: 'https://placehold.co/800x400.png?text=Game+Cover',
  DOCUMENT: 'https://placehold.co/400x600.png?text=Document',
};

/**
 * Ensures a valid image URL is returned, using a placeholder if the provided URL is invalid
 * @param url The URL to validate
 * @param placeholderUrl The placeholder URL to use if the provided URL is invalid
 * @returns A valid URL (either the original if valid, or the placeholder)
 */
export function ensureValidImageUrl(
  url: string | null | undefined,
  placeholderUrl: string
): string {
  // If URL is null, undefined, or empty string, return the placeholder
  if (!url) {
    return placeholderUrl;
  }

  // Return the original URL (it will be validated when loaded by the browser)
  return url;
}

/**
 * Ensures a valid avatar URL is returned
 * @param url The avatar URL to validate
 * @returns A valid avatar URL
 */
export function ensureValidAvatarUrl(url: string | null | undefined): string {
  return ensureValidImageUrl(url, PLACEHOLDER_URLS.AVATAR);
}

/**
 * Ensures a valid portrait URL is returned
 * @param url The portrait URL to validate
 * @returns A valid portrait URL
 */
export function ensureValidPortraitUrl(url: string | null | undefined): string {
  return ensureValidImageUrl(url, PLACEHOLDER_URLS.PORTRAIT);
}

/**
 * Ensures a valid cover image URL is returned
 * @param url The cover image URL to validate
 * @returns A valid cover image URL
 */
export function ensureValidCoverImageUrl(url: string | null | undefined): string {
  return ensureValidImageUrl(url, PLACEHOLDER_URLS.COVER);
}

/**
 * Ensures a valid document URL is returned
 * @param url The document URL to validate
 * @returns A valid document URL
 */
export function ensureValidDocumentUrl(url: string | null | undefined): string {
  return ensureValidImageUrl(url, PLACEHOLDER_URLS.DOCUMENT);
}
