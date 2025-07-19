import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAvatarUrl } from '@/helpers/avatar';

interface UserLike {
  id: number;
  name: string;
  headline: string | null;
  avatarUrl: string | null;
}

interface CommentAuthor {
  id: number;
  name: string;
  headline: string | null;
  avatarUrl: string | null;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

interface StatisticsModalProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  activeTab: 'like' | 'comment';
  onTabChange: (tab: 'like' | 'comment') => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({
  open,
  onClose,
  postId,
  activeTab,
  onTabChange,
}) => {
  const [users, setUsers] = useState<UserLike[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    if (activeTab === 'like') {
      fetch(`https://blogger-wph-api-production.up.railway.app/posts/${postId}/likes`)
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .finally(() => setLoading(false));
    } else if (activeTab === 'comment') {
      fetch(`https://blogger-wph-api-production.up.railway.app/posts/${postId}/comments`)
        .then((res) => res.json())
        .then((data) => setComments(data))
        .finally(() => setLoading(false));
    }
  }, [open, postId, activeTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-2xl shadow-lg w-[613px] max-w-full min-h-[576px] max-h-[756px] p-0 relative flex flex-col"
        style={{ height: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center w-full px-6 pt-6 pb-4 relative">
          <div className="flex items-center w-full justify-between">
            <h2 className="text-lg font-bold">Statistic</h2>
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
                <path d="M4 4L20 20M20 4L4 20" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div
          className="relative"
          style={{ marginLeft: 24, marginRight: 24 }}
        >
          <div className="flex border-b border-gray-300">
            <button
              className={`w-1/2 flex items-center justify-center gap-2 py-2 text-sm font-medium transition ${
                activeTab === 'like' ? 'text-blue-600' : 'text-gray-500'
              } cursor-pointer`}
              onClick={() => onTabChange('like')}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#2563eb" strokeWidth="1.5" />
              </svg>
              Like
            </button>
            <button
              className={`w-1/2 flex items-center justify-center gap-2 py-2 text-sm font-medium transition ${
                activeTab === 'comment' ? 'text-blue-600' : 'text-gray-500'
              } cursor-pointer`}
              onClick={() => onTabChange('comment')}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#2563eb" strokeWidth="1.5" />
              </svg>
              Comment
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-0.5 pointer-events-none">
            <div
              className="absolute h-0.5 bg-blue-600 transition-all duration-200"
              style={{
                width: '50%',
                left: activeTab === 'like' ? 0 : '50%',
              }}
            />
          </div>
        </div>
        
        <div
          className="px-6 pt-4 pb-6 flex-1 overflow-y-auto hide-scrollbar"
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
          {activeTab === 'like' ? (
            <>
              <div className="text-base font-semibold mb-4">
                Like ({users.length})
              </div>
              <div>
                {loading ? (
                  <div className="text-gray-400 py-8 text-center flex-1 flex items-center justify-center h-full">
                    Loading...
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-gray-400 py-8 text-center flex-1 flex items-center justify-center h-full">
                    No likes yet.
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                      <Image
                        src={getAvatarUrl(user.avatarUrl)}
                        alt={user.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.headline || 'Frontend Developer'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-semibold mb-4">
                Comment ({comments.length})
              </div>
              <div>
                {loading ? (
                  <div className="text-gray-400 py-8 text-center flex-1 flex items-center justify-center h-full">
                    Loading...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-gray-400 py-8 text-center flex-1 flex items-center justify-center h-full">
                    No comments yet.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start py-3 border-b border-gray-200 last:border-b-0">
                      <Image
                        src={getAvatarUrl(comment.author?.avatarUrl)}
                        alt={comment.author?.name || 'Commentator'}
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-gray-900">{comment.author?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                        <div
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ __html: comment.content || '' }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;