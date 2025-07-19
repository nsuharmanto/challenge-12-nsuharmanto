'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';
import EditProfileModal from '@/components/views/EditProfileModal';
import Loading from '@/app/loading';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import StatisticsModal from '@/components/views/StatisticsModal';
import Header from '@/components/layout/Header';
import { getAvatarUrl } from '@/helpers/avatar';
import { stripHtml } from '@/helpers/stripHtml';
import { forceWrapLongWords } from '@/helpers/forceWrap';
import TagList from '@/components/ui/TagList'; 
// import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

function PostCard({
  post,
  postIdx,
  postsLength,
  onStatistic,
  onEdit,
  onDelete,
}: {
  post: Post;
  postIdx: number;
  postsLength: number;
  onStatistic: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [createdAtStr, setCreatedAtStr] = useState('');
  const [updatedAtStr, setUpdatedAtStr] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCreatedAtStr(
      new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    setUpdatedAtStr(
      new Date(post.updatedAt || post.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [post.createdAt, post.updatedAt]);

  return (
    <div>
      <div
        className="flex bg-white px-0 py-6 overflow-hidden cursor-pointer"
        onClick={() => router.push(`/post/${post.id}`)}
      >
        <div className="flex-shrink-0 w-[340px] h-[258px] bg-gray-100 flex items-center justify-center mr-6 rounded-[6px]">
          <Image
            src={typeof post.imageUrl === 'string' && post.imageUrl ? post.imageUrl : '/sample-post.jpg'}
            alt={post.title}
            width={340}
            height={258}
            className="object-cover w-full h-full rounded-[6px]"
          />
        </div>
        
        <div className="flex flex-col flex-1 py-1">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(post.title || ''))}
          </h3>
          <TagList tags={post.tags} maxTags={3} />
          <p className="text-sm text-neutral-700 mb-4 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(post.content || ''))}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm font-normal mb-2 leading-relaxed">
            <span className="text-neutral-700">
              Created {createdAtStr}
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-700">
              Last updated {updatedAtStr}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-auto">
            <button
              className="text-[#0093DD] hover:underline text-sm font-semibold px-1 py-0.5 rounded transition cursor-pointer"
              onClick={e => { e.stopPropagation(); onStatistic(post.id); }}
            >
              Statistic
            </button>
            <button
              className="text-[#0093DD] hover:underline text-sm font-semibold px-1 py-0.5 rounded transition cursor-pointer"
              onClick={e => { e.stopPropagation(); onEdit(post.id); }}
            >
              Edit
            </button>
            <button
              className="text-red-500 hover:underline text-sm font-semibold px-1 py-0.5 rounded transition cursor-pointer"
              onClick={e => { e.stopPropagation(); onDelete(post.id); }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      {postIdx !== postsLength - 1 && (
        <div className="border-t border-neutral-200 mx-0" />
      )}
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl: string; headline: string }>({
    name: '',
    email: '',
    avatarUrl: '',
    headline: '',
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'yourPost' | 'changePassword'>('yourPost');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  
  const [showStatisticModal, setShowStatisticModal] = useState(false);
  const [statisticPostId, setStatisticPostId] = useState<number | null>(null);
  const [statisticTab, setStatisticTab] = useState<'like' | 'comment'>('like');

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('query') || '');
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.push(`/?query=${encodeURIComponent(query)}`);
  };

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastDesc, setToastDesc] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');

  useEffect(() => {
  if (toastOpen) {
      const timer = setTimeout(() => setToastOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastOpen]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const email = userData ? JSON.parse(userData).email : '';
        if (!token || !email) {
          router.push('/login');
          return;
        }

        const profileRes = await fetch(
          `https://blogger-wph-api-production.up.railway.app/users/by-email/${encodeURIComponent(email)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUser({
            name: profile.name,
            email: profile.email || '',
            avatarUrl: profile.avatarUrl || '',
            headline: profile.headline || '',
          });

          const postsRes = await fetch(
            `https://blogger-wph-api-production.up.railway.app/posts/by-user/${profile.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(Array.isArray(postsData.data) ? postsData.data : []);
          } else {
            setPosts([]);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetch profile/posts:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [router]);

  const handleSaveProfile = async ({
    name,
    headline,
    avatarFile,
  }: {
    name: string;
    headline: string;
    avatarFile?: File;
  }) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('headline', headline);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const res = await fetch(
        'https://blogger-wph-api-production.up.railway.app/users/profile',
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setUser({
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl
            ? `${updated.avatarUrl}?t=${Date.now()}`
            : '',
          headline: updated.headline,
        });
        
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: updated.name,
            email: updated.email,
            avatarUrl: updated.avatarUrl,
            avatar: updated.avatar,
            headline: updated.headline,
          })
        );
        window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
        setShowEditModal(false);
      }
    } catch {
      //error
    }
  };
  
  const handleDeleteClick = (postId: number) => {
    setSelectedPostId(postId);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `https://blogger-wph-api-production.up.railway.app/posts/${selectedPostId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        setPosts(posts.filter((post) => post.id !== selectedPostId));
        setToastTitle('Post deleted successfully!');
        setToastDesc('');
        setToastVariant('success');
        setToastOpen(true);
      } else {
        let errMsg = await res.text();
        if (res.status === 500) {
          errMsg = 'Internal Server Error (500). Please try again later or contact support.';
        }
        setToastTitle('Failed to delete post');
        setToastDesc(errMsg);
        setToastVariant('error');
        setToastOpen(true);
      }
    } catch (e) {
      setToastTitle('Failed to delete post');
      setToastDesc((e as Error).message);
      setToastVariant('error');
      setToastOpen(true);
    } finally {
      setShowDeleteModal(false);
      setSelectedPostId(null);
    }
  };

  const handleOpenStatistic = (postId: number) => {
    setStatisticPostId(postId);
    setStatisticTab('like');
    setShowStatisticModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Toast Message */}
      {toastOpen && (
        <div
          className={`fixed top-1 left-1/2 -translate-x-1/2 mt-[2px] z-[60] px-4 py-2 rounded shadow-lg ${
            toastVariant === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
          style={{ minWidth: 320, maxWidth: 500 }}
        >
          <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{toastTitle}</div>
          {toastDesc && (
            <div className="text-sm mt-1 whitespace-pre-line overflow-hidden text-ellipsis line-clamp-3">
              {toastDesc}
            </div>
          )}
          <button className="absolute top-2 right-2" onClick={() => setToastOpen(false)}>×</button>
        </div>
      )}

      <Header
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />
      
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    
      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeletePost}
      />
  
      {showStatisticModal && statisticPostId && (
        <StatisticsModal
          open={showStatisticModal}
          onClose={() => setShowStatisticModal(false)}
          postId={statisticPostId}
          activeTab={statisticTab}
          onTabChange={setStatisticTab}
        />
      )}
      <div className="w-full md:pt-32.5 md:max-w-[800px]">
        <div className="bg-white rounded-xl border border-gray-300 px-6 py-4 mb-16 flex items-center justify-between"
          style={{ boxShadow: '0 0 0 1px #E5E7EB' }}>
          <div className="flex items-center gap-6">
            <Image
              src={getAvatarUrl(user.avatarUrl)}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 text-sm">{user.headline}</p>
              <p className="text-gray-500 text-xs mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-[#0093DD] hover:underline decoration-2 font-semibold text-sm cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="flex mb-3 text-sm font-semibold w-[354px] border-b border-gray-300">
          <button
            className={`w-1/2 px-4 pb-2 text-center ${
              activeTab === 'yourPost'
                ? 'border-b-3 border-[#0093DD] text-[#0093DD]'
                : 'border-b-3 border-transparent text-gray-600'
            } cursor-pointer`}
            onClick={() => setActiveTab('yourPost')}
          >
            Your Post
          </button>
          <button
            className={`w-1/2 px-4 pb-2 text-center ${
              activeTab === 'changePassword'
                ? 'border-b-3 border-[#0093DD] text-[#0093DD]'
                : 'border-b-3 border-transparent text-gray-600'
            } cursor-pointer`}
            onClick={() => setActiveTab('changePassword')}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'yourPost' ? (
          posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Image
                src="/nopost.svg"
                alt="No Post"
                width={140}
                height={140}
                className="mb-6"
              />
              <h3 className="font-semibold text-center text-base mb-2">
                Your writing journey starts here
              </h3>
              <p className="text-gray-600 text-center text-sm mb-6">
                No posts yet, but every great writer starts with the first one.
              </p>
              <Button onClick={() => router.push('/write-post')} className="cursor-pointer">
                Write Post
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-0 px-0">
                <h2 className="text-base font-semibold text-gray-900 pl-2">
                  {posts.length} Post{posts.length > 1 ? 's' : ''}
                </h2>
                <Button onClick={() => router.push('/write-post')} className="cursor-pointer">
                  Write Post
                </Button>
              </div>
              
              <div className="border-t border-gray-300 mb-0 mt-5" />
              
              <div className="mb-39">
                {posts.map((post, postIdx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    postIdx={postIdx}
                    postsLength={posts.length}
                    onStatistic={handleOpenStatistic}
                    onEdit={(id) => router.push(`/edit-post/${id}`)}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </>
          )
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}