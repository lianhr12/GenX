/**
 * Download utility functions for images and videos
 * Uses fetch + blob to force download instead of opening in browser
 */

/**
 * Download a file from URL
 * @param url - The URL of the file to download
 * @param filename - The filename to save as
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab if fetch fails (e.g., CORS issues)
    window.open(url, '_blank');
  }
}

/**
 * Download multiple files
 * @param files - Array of { url, filename } objects
 */
export async function downloadFiles(
  files: Array<{ url: string; filename: string }>
): Promise<void> {
  for (const file of files) {
    await downloadFile(file.url, file.filename);
    // Small delay between downloads to prevent browser blocking
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

/**
 * Download a video file
 * @param url - The video URL
 * @param id - The video ID for filename
 */
export async function downloadVideo(url: string, id: string): Promise<void> {
  const filename = `${id}.mp4`;
  await downloadFile(url, filename);
}

/**
 * Download image files
 * @param urls - Array of image URLs
 * @param id - The base ID for filenames
 */
export async function downloadImages(
  urls: string[],
  id: string
): Promise<void> {
  const files = urls.map((url, index) => ({
    url,
    filename: urls.length === 1 ? `${id}.png` : `${id}-${index + 1}.png`,
  }));
  await downloadFiles(files);
}
