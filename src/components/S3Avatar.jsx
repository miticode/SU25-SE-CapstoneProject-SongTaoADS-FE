import React, { useState, useEffect } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import { getImageFromS3 } from '../api/s3Service';

// Simple cache để tránh gọi API nhiều lần cho cùng một avatar
const avatarCache = new Map();
const CACHE_DURATION = 50 * 60 * 1000; // 50 phút

// Function để clear cache cho một key cụ thể
export const clearAvatarCache = (s3Key) => {
  if (s3Key) {
    avatarCache.delete(s3Key);
  }
};

// Function để clear toàn bộ cache
export const clearAllAvatarCache = () => {
  avatarCache.clear();
};

const S3Avatar = ({ s3Key, alt, sx, children, ...props }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAvatar = async () => {
      if (!s3Key) {
        setError(true);
        return;
      }

      // Kiểm tra cache trước
      const cached = avatarCache.get(s3Key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setAvatarUrl(cached.url);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const result = await getImageFromS3(s3Key);
        if (result.success) {
          setAvatarUrl(result.imageUrl);
          // Lưu vào cache
          avatarCache.set(s3Key, {
            url: result.imageUrl,
            timestamp: Date.now()
          });
        } else {
          console.error('Failed to get image for avatar:', result.message);
          setError(true);
        }
      } catch (err) {
        console.error('Error loading avatar:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [s3Key]);

  if (loading) {
    return (
      <Avatar sx={sx} {...props}>
        <CircularProgress size={Math.min(sx?.width || 40, sx?.height || 40) * 0.6} />
      </Avatar>
    );
  }

  if (error || !avatarUrl) {
    return (
      <Avatar sx={sx} {...props}>
        {children}
      </Avatar>
    );
  }

  return (
    <Avatar 
      src={avatarUrl} 
      alt={alt}
      sx={sx} 
      {...props}
      onError={() => setError(true)}
    >
      {children}
    </Avatar>
  );
};

export default S3Avatar;