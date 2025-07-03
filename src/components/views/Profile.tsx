'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
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
  const router = useRouter();

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

        // Fetch profile
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

          // Fetch posts by userId
          const postsRes = await fetch(
            `https://blogger-wph-api-production.up.railway.app/posts/by-user/${profile.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(Array.isArray(postsData.data) ? postsData.data : []);
            
            console.log(
              'DATA TAGS:',
              Array.isArray(postsData.data)
                ? postsData.data.map((p: { id: number; tags: string[] }) => ({ id: p.id, tags: p.tags }))
                : []
            );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  const avatarSrc =
    user.avatarUrl && user.avatarUrl.startsWith('/')
      ? `https://blogger-wph-api-production.up.railway.app${user.avatarUrl}`
      : user.avatarUrl || '/default-avatar.png';

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <div className="w-full md:pt-32.5 md:max-w-[800px]">
        
        <div className="bg-white rounded-xl border border-gray-300 px-6 py-4 mb-16 flex items-center justify-between"
          style={{ boxShadow: '0 0 0 1px #E5E7EB' }}>
          <div className="flex items-center gap-6">
            <Image
              src={avatarSrc}
              alt={user.name || 'User Avatar'}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 text-sm">{user.headline}</p>
              <p className="text-gray-500 text-xs mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/edit-profile')}
            className="text-[#0093DD] hover:underline decoration-2 font-semibold text-sm"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="flex mb-3 text-sm font-semibold w-[354px] border-b border-neutral-300">
          <button
            className={`w-1/2 px-4 pb-2 text-center ${
              activeTab === 'yourPost'
                ? 'border-b-4 border-[#0093DD] text-[#0093DD]'
                : 'border-b-4 border-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('yourPost')}
          >
            Your Post
          </button>
          <button
            className={`w-1/2 px-4 pb-2 text-center ${
              activeTab === 'changePassword'
                ? 'border-b-4 border-[#0093DD] text-[#0093DD]'
                : 'border-b-4 border-transparent text-gray-600'
            }`}
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
              <Button onClick={() => router.push('/write-post')}>
                Write Post
              </Button>
            </div>
          ) : (
            <>
              
              <div className="flex items-center justify-between mb-0 px-0">
                <h2 className="text-base font-semibold text-gray-900 pl-2">
                  {posts.length} Post
                </h2>
                <Button onClick={() => router.push('/write-post')}>
                  Write Post
                </Button>
              </div>
              
              <div className="border-t border-neutral-200 mb-0 mt-5" />
              
              <div className="mb-44">
                {posts.map((post, postIdx) => (
                  <div key={`post-${post.id}`}>
                    
                    <div className="flex bg-white px-0 py-6">
                     
                      <div className="flex-shrink-0 w-[180px] h-[140px] bg-gray-100 flex items-center justify-center mr-6 ml-2">
                        <Image
                          src={typeof post.imageUrl === 'string' && post.imageUrl ? post.imageUrl : '/sample-post.jpg'}
                          alt={post.title}
                          width={180}
                          height={140}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-1 pr-2">
                        <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {post.tags?.map((tag, tagIdx) => (
                            <span
                              key={`tag-${post.id}-${tagIdx}`}
                              className="border border-neutral-300 text-gray-700 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {post.content || ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                          <span>
                            Created {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>
                            | Last updated {new Date(post.updatedAt || post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-[#0093DD] hover:underline text-xs font-semibold px-1 py-0.5 rounded transition">Statistic</button>
                          <button className="text-[#0093DD] hover:underline text-xs font-semibold px-1 py-0.5 rounded transition">Edit</button>
                          <button className="text-red-500 hover:underline text-xs font-semibold px-1 py-0.5 rounded transition">Delete</button>
                        </div>
                      </div>
                    </div>
                    
                    {postIdx !== posts.length - 1 && (
                      <div className="border-t border-neutral-200 mx-0" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          
          <form className="max-w-sm mx-auto mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" className="w-full border border-neutral-300 focus-border-neutral-350 rounded-[12px] px-3 py-2 text-sm focus:ring-0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" className="w-full border border-neutral-300 focus-border-neutral-350 rounded-[12px] px-3 py-2 text-sm focus:ring-0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" className="w-full border border-neutral-300 focus-border-neutral-350 rounded-[12px] px-3 py-2 text-sm focus:ring-0" />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0093DD] text-white py-2 rounded-full font-semibold text-base hover:bg-blue-500 transition"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}