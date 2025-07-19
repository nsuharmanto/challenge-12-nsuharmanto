'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getAvatarUrl } from '@/helpers/avatar';
import { stripHtml } from '@/helpers/stripHtml';
import { forceWrapLongWords } from '@/helpers/forceWrap';
import TagList from '@/components/ui/TagList';

type Author = {
  id: number;
  name: string;
  avatarUrl?: string;
  username: string;
};

type PostType = {
  id: number;
  title: string;
  imageUrl?: string;
  tags?: string[];
  author?: Author;
  createdAt?: string;
  content?: string;
  likes?: number;
  comments?: number;
};

type Props = {
  post: PostType;
  horizontal?: boolean;
  disableLink?: boolean; 
};

function HydrationSafeDate({ date }: { date?: string }) {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    if (date) {
      setDateStr(
        new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    }
  }, [date]);
  return <>{dateStr}</>;
}

export default function PostCard({ post, horizontal, disableLink }: Props) {
  return (
    <div
      className={`bg-white overflow-hidden w-full max-w-[807px] h-auto lg:h-[276px] ${
        horizontal ? 'flex flex-row' : 'flex flex-col'
      }`}
    >
      
      {post.imageUrl && (
        <div
          className={`relative ${
            horizontal
              ? 'w-[340px] h-[258px] mt-1 mb-1 lg:mt-2 lg:mb-2 flex-shrink-0'
              : 'w-full h-[200px]'
          }`}
        >
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover rounded-md"
            sizes={horizontal ? '276px' : '100vw'}
            priority={false}
          />
        </div>
      )}

      
      <div className="flex flex-col justify-between ml-4 lg:ml-6 flex-1">
        <div>
          
          {disableLink ? (
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-relaxed">
              {forceWrapLongWords(stripHtml(post.title || ''))}
            </h3>
          ) : (
            <Link href={`/post/${post.id}`}>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 transition-colors hover:text-blue-600">
                {forceWrapLongWords(stripHtml(post.title || ''))}
              </h3>
            </Link>
          )}
          
          <TagList tags={post.tags} maxTags={3} />
          <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(post.content || ''))}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {disableLink ? (
            <div className="flex items-center gap-2">
              <Image
                src={getAvatarUrl(post.author?.avatarUrl) || '/default-avatar.png'}
                alt={post.author?.name || 'Author'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="font-medium text-gray-900">{post.author?.name}</span>
              <span className="text-gray-400">•</span>
              {post.createdAt && (
                <span className="text-gray-600">
                  <HydrationSafeDate date={post.createdAt} />
                </span>
              )}
            </div>
          ) : (
            <Link href={`/profile/${post.author?.id}`} className="flex items-center gap-2">
              <Image
                src={getAvatarUrl(post.author?.avatarUrl) || '/default-avatar.png'}
                alt={post.author?.name || 'Author'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="font-medium transition-colors hover:text-blue-600">
                {post.author?.name}
              </span>
              <span className="text-gray-400 transition-colors hover:text-blue-600 ">•</span>
              {post.createdAt && (
                <span className="text-gray-600 transition-colors hover:text-blue-600">
                  <HydrationSafeDate date={post.createdAt} />
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center mt-4 gap-4">
          <div className="flex items-center text-gray-600">
            <Image
              src="/like-gray-icon.svg"
              alt="Like"
              width={16}
              height={16}
              className="mr-1"
            />
            <span className="text-sm">{post.likes ?? 0}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Image
              src="/Comment Icon.svg"
              alt="Comment"
              width={16}
              height={16}
              className="mr-1"
            />
            <span className="text-sm">{post.comments ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}