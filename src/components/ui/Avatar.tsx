import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getAvatarUrl } from '@/helpers/avatar';

export default function Avatar({
  src,
  alt,
  width = 80,
  height = 80,
  ...props
}: {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
} & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'>) {
  const safeSrc = src || '';
  const [imgSrc, setImgSrc] = useState(getAvatarUrl(safeSrc));

  useEffect(() => {
    setImgSrc(getAvatarUrl(safeSrc));
  }, [safeSrc]);

  return (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={imgSrc}
    alt={alt || 'User Avatar'}
    width={width}
    height={height}
    className="rounded-full object-cover"
    onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
    {...props}
  />
);
}