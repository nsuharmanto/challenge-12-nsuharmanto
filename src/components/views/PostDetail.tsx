'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import type { Post } from '@/interfaces/post.interface';
import { getAvatarUrl } from '@/helpers/avatar';
import CommentsModal from './CommentsModal';
import { stripHtml } from '@/helpers/stripHtml';
import { forceWrapLongWords } from '@/helpers/forceWrap';
import TagList from '@/components/ui/TagList';

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
};

type Props = {
  post: Post;
};

function HydrationSafeDate({ date, format = 'long' }: { date?: string; format?: 'short' | 'long' }) {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    if (date) {
      setDateStr(
        new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: format,
          year: 'numeric',
        })
      );
    }
  }, [date, format]);
  return <>{dateStr}</>;
}

function AnotherPostCard({ ap, onClick }: { ap: Post; onClick: () => void }) {
  return (
    <div
      className="bg-white overflow-hidden w-full max-w-[807px] h-auto lg:h-[276px] flex flex-row cursor-pointer"
      onClick={onClick}
    >
      
      {ap.imageUrl && (
        <div className="relative w-[340px] h-[258px] mt-1 mb-1 lg:mt-2 lg:mb-2 flex-shrink-0">
          <Image
            src={getAvatarUrl(ap.imageUrl)}
            alt={ap.title}
            fill
            className="object-cover rounded-md"
            sizes="276px"
            priority={false}
          />
        </div>
      )}
      
      <div className="flex flex-col justify-between ml-4 lg:ml-6 flex-1 py-0">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-neutral-900 mb-2 line-clamp-2">
            {forceWrapLongWords(stripHtml(ap.title || ''))}
          </h3>
          <TagList tags={ap.tags} maxTags={3} />
          <p className="text-sm text-neutral-700 mb-4 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(ap.content || ''))}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={getAvatarUrl(ap.author?.avatarUrl)}
            alt={ap.author?.name || 'User'}
            width={28}
            height={28}
            className="rounded-full object-cover"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
          <span className="text-sm font-medium text-neutral-900">{ap.author?.name}</span>
          <span className="text-neutral-400">•</span>
          <span className="text-sm text-neutral-600">
            <HydrationSafeDate date={ap.createdAt} format="long" />
          </span>
        </div>
        <div className="flex items-center gap-6 text-gray-500 text-base">
          <span className="flex items-center gap-2">
            <Image src="/like-gray-icon.svg" alt="Like" width={20} height={20} />
            {ap.likes ?? 0}
          </span>
          <span className="flex items-center gap-2">
            <Image src="/Comment Icon.svg" alt="Comment" width={20} height={20} />
            {ap.comments ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PostDetail({ post }: Props) {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [author, setAuthor] = useState(post.author);
  const [anotherPosts, setAnotherPosts] = useState<Post[]>([]);
  const tags = currentPost.tags || [];
  const [showAllComments, setShowAllComments] = useState(false);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [likes, setLikes] = useState(currentPost.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!author?.id) return;
      try {
        const res = await fetch(
          `https://blogger-wph-api-production.up.railway.app/users/${author.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setAuthor((prev) => ({
            ...prev,
            avatarUrl: data.avatarUrl || prev.avatarUrl,
            name: data.name || prev.name,
          }));
        }
      } catch {
        // handle error
      }
    };
    fetchAuthor();
  }, [author?.id]);

  useEffect(() => {
    const fetchAnotherPosts = async () => {
      if (!currentPost.author?.id) return;
      try {
        const res = await fetch(
          `https://blogger-wph-api-production.up.railway.app/posts/by-user/${currentPost.author.id}?limit=10&page=1`
        );
        const data = await res.json();
        setAnotherPosts(
          (data.data || []).filter((p: Post) => p.id !== currentPost.id)
        );
      } catch {
        // handle error
      }
    };
    fetchAnotherPosts();
  }, [currentPost.id, currentPost.author?.id]);

  useEffect(() => {
    setLikes(currentPost.likes || 0);
    setIsLiked(false);
    setCommentCount(0);
    setFilteredComments([]);
    setShowAllComments(false);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access this page.');
      router.push('/login');
      return;
    }
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://blogger-wph-api-production.up.railway.app/comments/${currentPost.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: Comment[] = await response.json();
        setFilteredComments(data);
        setCommentCount(data.length);
      } catch {
        // handle error
      }
    };
    fetchComments();
    // eslint-disable-next-line
  }, [currentPost.id]);

  const handleAddComment = async (newComment: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. Please login first.');
        return;
      }

      const response = await fetch(
        `https://blogger-wph-api-production.up.railway.app/comments/${currentPost.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );

      if (response.ok) {
        const addedComment: Comment = await response.json();
        setFilteredComments([addedComment, ...filteredComments]);
        setCommentCount((prevCount) => prevCount + 1);
      } else {
        console.error('Failed to add comment', await response.text());
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSendComment = () => {
    const newComment = textareaRef.current?.value.trim();
    if (newComment) {
      handleAddComment(newComment);
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
    }
  };

  const handleLikePost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like this post.');
        router.push('/login');
        return;
      }

      const response = await fetch(
        `https://blogger-wph-api-production.up.railway.app/posts/${currentPost.id}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
        }
      );

      if (response.ok) {
        setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
        setIsLiked(!isLiked);
      } else {
        console.error('Failed to update like status', await response.text());
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  return (
    <>
      <Header
        searchQuery=""
        onSearch={(query: string) => {
          router.push(`/?query=${encodeURIComponent(query)}`);
        }}
      />
      <article className="w-full max-w-[800px] mx-auto pt-32 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 leading-tight">
          {currentPost.title}
        </h1>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, idx) => (
              <span
                key={`tag-${currentPost.id}-${tag}-${idx}`}
                className="text-sm text-gray-600 font-medium border border-gray-300 px-2 py-1 rounded-[8px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-900 mb-6 gap-2">
          <Image
            src={getAvatarUrl(author?.avatarUrl)}
            alt={author?.name || 'User'}
            width={40}
            height={40}
            className="rounded-full object-cover"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
          <span className="font-medium">{author?.name}</span>
          {currentPost.createdAt && (
            <>
              <span className="mx-1 text-gray-400">•</span>
              <span className="text-gray-600">
                <HydrationSafeDate date={currentPost.createdAt} format="long" />
              </span>
            </>
          )}
        </div>
        <div className="flex gap-6 text-sm text-gray-600 font-medium mb-6">
          <span className="flex items-center gap-1">
            <button
              className={`flex items-center gap-1 cursor-pointer ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
              onClick={handleLikePost}
            >
              <Image
                src={isLiked ? '/like-blue-icon.svg' : '/like-gray-icon.svg'}
                alt="Like"
                width={18}
                height={18}
              />
              {likes}
            </button>
          </span>
          <span className="flex items-center gap-1">
            <Image src="/Comment Icon.svg" alt="Comment" width={18} height={18} />
            {commentCount}
          </span>
        </div>
        <hr className="border-t border-gray-200 my-6" />
        {currentPost.imageUrl && (
          <div className="w-full mb-8">
            <Image
              src={getAvatarUrl(currentPost.imageUrl)}
              alt={currentPost.title}
              width={700}
              height={350}
              className="w-full h-auto object-cover rounded-[6px]"
              priority
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        )}
        <div className="prose max-w-none text-gray-800 text-base leading-relaxed mb-4">
          <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
        </div>
        <hr className="border-t border-gray-200 my-4" />
        <div className="w-[800px] min-h-[332px] bg-white">
          <h2 className="text-xl font-bold mb-4">Comments ({commentCount})</h2>
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={getAvatarUrl(author?.avatarUrl)}
              alt={author?.name || 'User'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
            />
            <span className="text-sm font-medium text-gray-900">{author?.name}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 mb-2">Give your comments</p>
          <textarea
            ref={textareaRef}
            className="w-full h-[140px] border border-gray-300 rounded-[12px] px-4 py-2 text-sm resize-none focus:border-gray-500 focus:outline-none"
            placeholder="Enter your comment"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
          ></textarea>
          <div className="flex justify-end mt-4">
            <button
              className="w-[204px] h-[48px] mb-2 bg-blue-500 text-white rounded-full text-sm font-medium cursor-pointer"
              onClick={handleSendComment}
            >
              Send
            </button>
          </div>

          <div className="space-y-4 mt-4">
            {filteredComments.slice(0, 3).map((comment, index) => (
              <div
                key={`${comment.id}-${index}`}
                className="border-t border-gray-200 py-3 flex flex-col"
              >
                <div className="flex gap-4 items-start">
                  <Image
                    src={getAvatarUrl(comment.author?.avatarUrl)}
                    alt={comment.author?.name || 'Commentator'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{comment.author?.name || 'Unknown'}</p>
                    <span className="text-xs text-gray-500 block mt-1">
                      <HydrationSafeDate date={comment.createdAt} format="long" />
                    </span>
                  </div>
                </div>
                <p
                  className="text-sm text-gray-500 mt-3 ml-0 leading-relaxed"                 
                >
                  {forceWrapLongWords(stripHtml(comment.content || ''))}
                </p>
              </div>
            ))}
            <div className="flex justify-start mt-4">
              <button
                className="text-blue-500 text-sm font-medium hover:underline cursor-pointer"
                onClick={() => setShowAllComments(true)}
              >
                See All Comments
              </button>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-200 my-4" />
        <CommentsModal
          open={showAllComments}
          onClose={() => setShowAllComments(false)}
          comments={filteredComments}
          commentCount={commentCount}
          textareaRef={textareaRef}
          onSend={handleSendComment}
        />

        {anotherPosts.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Another Post</h2>
            <div className="flex flex-col gap-9">
              {anotherPosts.map((ap) => (
                <AnotherPostCard key={ap.id} ap={ap} onClick={() => setCurrentPost(ap)} />
              ))}
            </div>
          </>
        )}
      </article>
    </>
  );
}