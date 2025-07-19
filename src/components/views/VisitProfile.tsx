'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Loading from '@/app/loading';
import { stripHtml } from '@/helpers/stripHtml';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { forceWrapLongWords } from '@/helpers/forceWrap';
import TagList from '@/components/ui/TagList';

interface Author {
  id: number;
  name: string;
  headline: string;
  avatarUrl: string;
}

interface Post {
  id: number;
  title: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  author: Author;
  content: string;
}

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

function VisitPostCard({ post }: { post: Post }) {
  const router = useRouter();
  return (
    <div
      className="bg-white overflow-hidden w-full max-w-[807px] h-auto lg:h-[276px] flex flex-row mb-6 cursor-pointer"
      onClick={() => router.push(`/post/${post.id}`)}
    >
  
      <div className="relative w-[340px] h-[258px] mt-1 mb-1 lg:mt-2 lg:mb-2 flex-shrink-0">
        <Image
          src={post.imageUrl ? post.imageUrl : '/default-image.png'}
          alt={post.title}
          fill
          className="object-cover rounded-md"
          sizes="276px"
          priority={false}
        />
      </div>
      
      <div className="flex flex-col justify-between ml-4 lg:ml-6 flex-1 py-0">
        <div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(post.title || ''))}
          </h3>
          <TagList tags={post.tags} maxTags={3} />
          <p className="text-sm text-neutral-700 mb-4 line-clamp-2 leading-relaxed">
            {forceWrapLongWords(stripHtml(post.content || ''))}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <Image
            src={
              typeof post.author.avatarUrl === 'string' && post.author.avatarUrl
                ? (post.author.avatarUrl.startsWith('/')
                    ? `https://blogger-wph-api-production.up.railway.app${post.author.avatarUrl}`
                    : post.author.avatarUrl)
                : '/default-avatar.png'
            }
            alt={post.author.name}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-gray-600">
            <HydrationSafeDate date={post.createdAt} />
          </span> 
        </div>
        <div className="flex items-center gap-6 text-gray-500 text-base">
          <span className="flex items-center gap-2">
            <Image src="/like-gray-icon.svg" alt="Like" width={20} height={20} />
            {post.likes}
          </span>
          <span className="flex items-center gap-2">
            <Image src="/Comment Icon.svg" alt="Comment" width={20} height={20} />
            {post.comments}
          </span>
        </div>
      </div>
    </div>
  );
}
export default function VisitProfilePage() {
  const { userId } = useParams() as { userId?: string };

  const [user, setUser] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError('User ID not found.');
        setShowErrorDialog(true);
        setLoading(false);
        return;
      }

      try {
        const postRes = await fetch(
          `https://blogger-wph-api-production.up.railway.app/posts/by-user/${userId}?limit=10&page=1`
        );
        const postJson = await postRes.json();
        if (!postJson.user) {
          setError('User not found.');
          setShowErrorDialog(true);
          setUser(null);
          setPosts([]);
        } else {
          setUser(postJson.user);
          setPosts(postJson.data || []);
        }
      } catch {
        setError('An error occurred while fetching data.');
        setShowErrorDialog(true);
        setUser(null);
        setPosts([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <>
        <Header
          searchQuery=""
          onSearch={(query: string) => {
            router.push(`/?query=${encodeURIComponent(query)}`);
          }}
        />
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        searchQuery=""
        onSearch={(query: string) => {
          router.push(`/?query=${encodeURIComponent(query)}`);
        }}
      />
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex justify-center items-start py-20 md:py-32 relative">
          <div
            className="mx-auto bg-white"
            style={{
              width: '800px',
            }}
          >
            
            <AlertDialog.Root open={showErrorDialog} onOpenChange={setShowErrorDialog}>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-50" />
                <AlertDialog.Content className="fixed z-50 bg-white p-6 rounded-lg shadow-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px]">
                  <AlertDialog.Title className="font-bold text-lg mb-2">Error</AlertDialog.Title>
                  <AlertDialog.Description className="mb-4 text-gray-700">
                    {error}
                  </AlertDialog.Description>
                  <AlertDialog.Action asChild>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setShowErrorDialog(false)}
                    >
                      OK
                    </button>
                  </AlertDialog.Action>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>

            
            <div className="flex flex-row items-center px-0 pt-0 pb-0 gap-4">
              {user && (
                <>
                  <Image
                    src={
                      typeof user.avatarUrl === 'string' && user.avatarUrl
                        ? (user.avatarUrl.startsWith('/')
                            ? `https://blogger-wph-api-production.up.railway.app${user.avatarUrl}`
                            : user.avatarUrl)
                        : '/default-avatar.png'
                    }
                    alt={user.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold text-lg mb-1">{user.name}</div>
                    <div className="text-gray-500 text-md">{user.headline}</div>
                  </div>
                </>
              )}
            </div>
            <hr className="my-6 border-gray-300" />
            
            <div className="px-0">
              <div className="font-semibold text-xl mb-4">
                {posts.length > 0
                  ? `${posts.length} Post${posts.length > 1 ? 's' : ''}`
                  : ''}
              </div>
              {!error && posts.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <Image src="/nopost.svg" alt="No posts" width={96} height={96} className="mb-4" />
                  <div className="font-semibold text-gray-700 mb-1">No posts from this user yet</div>
                  <div className="text-gray-500 text-sm">Stay tuned for future posts</div>
                </div>
              ) : !error && (
                <div className="flex flex-col">
                  {posts.map((post, idx) => (
                    <div key={post.id}>
                      <VisitPostCard post={post} />
                      {idx !== posts.length - 1 && (
                        <hr className="border-t border-gray-300 my-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}