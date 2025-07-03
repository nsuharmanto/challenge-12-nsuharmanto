'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import PostCard from '@/components/views/PostCard';
import Image from 'next/image';
import type { Post } from '@/interfaces/post.interface';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function handleSearch() {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/posts/search?query=${encodeURIComponent(initialQuery)}&limit=10&page=1`
      );
      const data = await res.json();
      setPosts(data.data || []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }

  return (
  <main className="flex flex-col bg-white">
    <Header />
    <div className="px-4 md:px-6 lg:px-32 pt-[128px]">
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-6"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      )}

      {!loading && posts.length > 0 && initialQuery && (
        <div className="w-full flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 mb-9">
            Result for <span className="font-bold">&quot;{initialQuery}&quot;</span>
          </h2>
          <div className="flex flex-col gap-9 mb-9">
            {posts.map(post => (
              <PostCard key={post.id} post={post} horizontal />
            ))}
          </div>
        </div>
      )}

      {!loading && searched && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: '532px' }}>
          <Image src="/nopost.svg" alt="No results" width={118} height={135} />
          <p className="mt-6 text-lg font-semibold text-gray-700">No results found</p>
          <p className="text-gray-500 mb-6">Try using different keywords</p>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  </main>
  );
}