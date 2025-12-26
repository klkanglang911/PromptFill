/**
 * 图片压缩工具
 * 使用 Canvas API 压缩图片到指定大小
 */

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxSizeKB - 最大文件大小 (KB)，默认 500KB
 * @param {number} options.maxWidth - 最大宽度，默认 1920px
 * @param {number} options.maxHeight - 最大高度，默认 1920px
 * @param {number} options.initialQuality - 初始质量，默认 0.9
 * @returns {Promise<Blob>} 压缩后的图片 Blob
 */
export async function compressImage(file, options = {}) {
  const {
    maxSizeKB = 500,
    maxWidth = 1920,
    maxHeight = 1920,
    initialQuality = 0.9
  } = options;

  const maxSizeBytes = maxSizeKB * 1024;

  // 如果文件已经小于目标大小，直接返回
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 计算缩放后的尺寸
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 尝试不同质量压缩
      let quality = initialQuality;
      const minQuality = 0.1;
      const qualityStep = 0.1;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }

            // 如果已达到目标大小或质量已最低
            if (blob.size <= maxSizeBytes || quality <= minQuality) {
              console.log(`📸 图片压缩完成: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (质量: ${(quality * 100).toFixed(0)}%)`);
              resolve(blob);
            } else {
              // 降低质量继续压缩
              quality -= qualityStep;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 加载图片
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 上传图片到服务器（带压缩）
 * @param {File} file - 原始图片文件
 * @param {Object} options - 选项
 * @param {number} options.maxSizeKB - 最大文件大小 (KB)
 * @param {Function} options.onProgress - 进度回调
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImageWithCompression(file, options = {}) {
  const { maxSizeKB = 500, onProgress } = options;
  // API_BASE 已包含 /api 前缀，直接拼接后续路径
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  try {
    onProgress?.({ stage: 'compressing', progress: 0 });

    // 压缩图片
    const compressedBlob = await compressImage(file, { maxSizeKB });

    onProgress?.({ stage: 'uploading', progress: 30 });

    // 创建 FormData
    const formData = new FormData();
    const filename = file.name.replace(/\.[^.]+$/, '.jpg'); // 强制使用 .jpg 扩展名
    formData.append('image', compressedBlob, filename);

    // 上传到服务器
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    onProgress?.({ stage: 'processing', progress: 80 });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || '上传失败');
    }

    onProgress?.({ stage: 'done', progress: 100 });

    return {
      success: true,
      url: result.url,
      filename: result.filename,
      originalSize: file.size,
      compressedSize: compressedBlob.size
    };
  } catch (error) {
    console.error('图片上传失败:', error);
    return {
      success: false,
      error: error.message || '上传失败'
    };
  }
}

/**
 * 验证文件类型和大小
 * @param {File} file - 文件
 * @param {Object} options - 选项
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file, options = {}) {
  const { maxSizeMB = 20, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

  if (!file) {
    return { valid: false, error: '请选择文件' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP' };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `文件大小超过限制（最大 ${maxSizeMB}MB）` };
  }

  return { valid: true };
}
