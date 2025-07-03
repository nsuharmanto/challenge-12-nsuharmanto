'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Post } from '@/interfaces/post.interface';

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

export default function PostDetail({ post }: Props) {
  const tags = post.tags || [];
  const [showAllComments, setShowAllComments] = useState(false);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false); 


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access this page.');
      router.push('/login');
      return;
    }

    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://blogger-wph-api-production.up.railway.app/comments/${post.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
        const data: Comment[] = await response.json();
        setFilteredComments(data);
        setCommentCount(data.length);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [post.id, router]);

  const handleAddComment = async (newComment: string) => {
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        console.error('No token found. Please login first.');
        return;
      }

      const response = await fetch(
        `https://blogger-wph-api-production.up.railway.app/comments/${post.id}`,
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
      `https://blogger-wph-api-production.up.railway.app/posts/${post.id}/like`,
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
      setIsLiked(!isLiked); // Toggle status like
    } else {
      console.error('Failed to update like status', await response.text());
    }
  } catch (error) {
    console.error('Error updating like status:', error);
    }
  };


  return (
    <article className="w-full max-w-[800px] mx-auto pt-32 pb-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 leading-tight">
        {post.title}
      </h1>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-sm text-gray-600 font-medium border border-gray-300 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
        <Image
          src={
            post.author?.avatarUrl
              ? post.author.avatarUrl.startsWith('/uploads')
                ? `https://blogger-wph-api-production.up.railway.app${post.author.avatarUrl}`
                : post.author.avatarUrl
              : '/default-avatar.png'
          }
          alt={post.author?.name || 'User'}
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="font-medium">{post.author?.name}</span>
        {post.createdAt && (
          <>
            <span className="mx-1">•</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
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
      {post.imageUrl && (
        <div className="w-full mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={700}
            height={350}
            className="w-full h-auto object-cover rounded-[6px]"
            priority
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>
      )}
      <div className="prose max-w-none text-gray-800 text-base leading-relaxed mb-4">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      <hr className="border-t border-gray-200 my-4" />
      <div className="w-[800px] min-h-[332px] bg-white">
        <h2 className="text-xl font-bold mb-4">Comments ({commentCount})</h2>
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={
              post.author?.avatarUrl
                ? post.author.avatarUrl.startsWith('/uploads')
                  ? `https://blogger-wph-api-production.up.railway.app${post.author.avatarUrl}`
                  : post.author.avatarUrl
                : '/default-avatar.png'
            }
            alt={post.author?.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-sm font-medium text-gray-900">{post.author?.name}</span>
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
            <div key={`${comment.id}-${index}`} className="flex gap-4 items-start border-t border-gray-200 py-3">
              <Image
                  src={
                    comment.author?.avatarUrl
                      ? comment.author.avatarUrl.startsWith('/uploads')
                        ? `https://blogger-wph-api-production.up.railway.app${comment.author.avatarUrl}`
                        : comment.author.avatarUrl
                      : '/default-avatar.png'
                  }
                  alt={comment.author?.name || 'Commentator'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{comment.author?.name || 'Unknown'}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{comment.content}</p>
              </div>
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
      <hr className="border-t border-gray-200 my-6" />   
      {showAllComments && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.60)' }}
          >
          <div
            className="bg-white w-[613px] h-auto p-6 rounded-lg shadow-lg relative overflow-hidden"
            style={{
              maxHeight: 'calc(100vh - 122px)',
              margin: '0 auto', 
            }}
          >
          
          <button
          aria-label="Close and go to homepage"
          onClick={() => router.push('/')}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center"
          style={{ lineHeight: 1 }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 6L14 14M14 6L6 14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            className="overflow-y-auto space-y-6 scrollbar-hide"
            style={{
              maxHeight: 'calc(100vh - 122px)', 
              paddingBottom: '16px', 
              boxSizing: 'border-box'
            }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments ({commentCount})</h2>
            <p className="text-sm font-bold text-gray-900 mb-2">Give your Comments</p>
            <textarea
              ref={textareaRef}
              className="w-full h-[120px] border border-gray-300 rounded-lg px-2 py-2 text-sm resize-none focus:border-gray-500 focus:outline-none mb-4"
              placeholder="Enter your comment"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            ></textarea>
            <div className="flex justify-end border-b border-gray-200 pb-6">
              <button
                className="w-[120px] h-[40px] bg-blue-500 text-white rounded-full text-sm font-medium cursor-pointer"
                onClick={handleSendComment}
              >
                Send
              </button>
            </div>
            {filteredComments.map((comment, index) => (
              <div key={`${comment.id}-${index}`} className="flex items-start gap-4 border-b border-gray-200 pb-4 mb-6">
                <Image
                  src={
                    comment.author?.avatarUrl
                      ? comment.author.avatarUrl.startsWith('/uploads')
                        ? `https://blogger-wph-api-production.up.railway.app${comment.author.avatarUrl}`
                        : comment.author.avatarUrl
                      : '/default-avatar.png'
                  }
                  alt={comment.author?.name || 'Commentator'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{comment.author?.name || 'Unknown'}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </article>
  );
}