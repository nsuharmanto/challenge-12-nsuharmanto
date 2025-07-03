import Link from 'next/link';
import Image from 'next/image';

type Props = {
  post: {
    id: number;
    title: string;
    imageUrl?: string;
    tags?: string[];
    author?: { name: string; avatarUrl?: string };
    createdAt?: string;
    content?: string;
    likes?: number;
    comments?: number;
  };
  horizontal?: boolean;
  disableLink?: boolean;
};

// Helper untuk handle avatar url relatif/backend
const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  if (avatarUrl.startsWith('/uploads')) {
    return `https://blogger-wph-api-production.up.railway.app${avatarUrl}`;
  }
  // fallback ke lokal
  return avatarUrl;
};

export default function PostCard({ post, horizontal, disableLink }: Props) {
  const cardContent = (
    <div
      className={`bg-white overflow-hidden w-full max-w-[807px] h-auto lg:h-[276px] ${
        horizontal ? 'flex flex-row' : 'flex flex-col'
      }`}
    >
      {/* Image Section */}
      {post.imageUrl && (
        <div className={`relative ${horizontal ? 'w-[340px] h-[258px] mt-1 mb-1 lg:mt-2 lg:mb-2 flex-shrink-0' : 'w-full h-[200px]'}`}>
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

      {/* Content Section */}
      <div className="flex flex-col justify-between ml-4 lg:ml-6 flex-1">
        <div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
          <div className="flex gap-2 mb-4 overflow-hidden whitespace-nowrap">
            {post.tags?.slice(0, 3).map((tag, idx) => (
              <span
                key={`tag-${post.id}-${idx}`}
                className="px-3 py-1 text-xs lg:text-sm bg-white border border-gray-200 text-gray-600 rounded-[8px]">
                {tag}
              </span>
            ))}
            {post.tags && post.tags.length > 3 && (
              <span className="px-1 py-1 text-sm lg:text-md">
                ...
              </span>
            )}
          </div>
          <p className="text-sm lg:text-base text-gray-700 line-clamp-2">{post.content}</p>
        </div>
        <div className="flex items-center mt-4">
          <Image
            src={getAvatarUrl(post.author?.avatarUrl)}
            alt={post.author?.name || 'Author'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <p className="text-sm text-gray-900 font-medium">{post.author?.name}</p>
            {post.createdAt && (
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
        {/* Like and Comment Section */}
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

  return disableLink ? cardContent : (
    <Link href={`/post/${post.id}`} className="block">
      {cardContent}
    </Link>
  );
}