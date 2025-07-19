'use client';

import React from 'react';
import Image from 'next/image';
import { getAvatarUrl } from '@/helpers/avatar';
import { stripHtml } from '@/helpers/stripHtml';
import { forceWrapLongWords } from '@/helpers/forceWrap';


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

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  comments: Comment[];
  commentCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSend: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  open,
  onClose,
  comments,
  commentCount,
  textareaRef,
  onSend,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-white w-[613px] h-auto p-0 rounded-lg shadow-lg relative overflow-hidden flex flex-col"
        style={{
          maxHeight: 'calc(100vh - 122px)',
          margin: '0 auto',
        }}
      >
        
        <div className="bg-white px-6 pt-6 pb-0 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Comments ({commentCount})
            </h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center"
              style={{ lineHeight: 1 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 6L18 18M18 6L6 18" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="text-sm font-bold text-gray-900 mb-2">Give your Comments</p>
          <textarea
            ref={textareaRef}
            className="w-full h-[120px] border border-gray-300 rounded-lg px-2 py-2 text-sm resize-none focus:border-gray-500 focus:outline-none mb-4"
            placeholder="Enter your comment"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          ></textarea>
          <div className="flex justify-end pb-2">
            <button
              className="w-[120px] h-[40px] bg-blue-500 text-white rounded-full text-sm font-medium cursor-pointer"
              onClick={onSend}
            >
              Send
            </button>
          </div>
          <div className="mt-5 border-b border-gray-300" />
        </div>
        
        <div
          className="overflow-y-auto flex-1 px-6 pt-3 pb-6 hide-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {comments.length > 0 ? (
            comments.map((comment, index) => {
              const avatarSrc = getAvatarUrl(comment.author?.avatarUrl);
              console.log('avatarSrc:', avatarSrc);
              return (
                <div
                  key={`${comment.id}-${index}`}
                  className="flex flex-col border-b border-gray-200 last:border-b-0 py-3"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={getAvatarUrl(comment.author?.avatarUrl)}
                      alt={comment.author?.name ? `Avatar of ${comment.author.name}` : 'Commentator'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comment.author?.name || 'Unknown'}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-sm text-gray-500 mt-2 ml-0 lg:ml-0 leading-relaxed"         
                  >
                    {forceWrapLongWords(stripHtml(comment.content || ''))}
                  </div>
                </div>
                
              );
            })
          ) : (
            <div className="text-gray-400 py-8 text-center flex-1 flex items-center justify-center h-full">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;