/**
 * Download utility functions for images and videos
 * Uses server-side proxy to bypass CORS restrictions
 */

/**
 * Download a file using the server-side proxy
 * @param url - The URL of the file to download
 * @param filename - The filename to save as
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  try {
    // Use server-side proxy to download
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
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
    // Show error to user instead of opening in new tab
    throw error;
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
    if (files.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
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
