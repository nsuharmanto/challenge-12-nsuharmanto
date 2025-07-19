'use client';

import { useState } from 'react';
import { searchPosts } from '@/services/posts/service';
import PostCard from '@/components/views/PostCard';
import type { Post } from '@/interfaces/post.interface';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchPosts(query);
      setPosts(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-8 px-2 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Search Posts</h1>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, tag, or author"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-80 focus:outline-primary-400 text-base"
        />
        <button
          type="submit"
          className="bg-primary-400 hover:bg-primary-500 text-white font-bold px-6 py-2 rounded-lg transition"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 && !loading && (
          <p className="text-center text-gray-500 col-span-full">No posts found.</p>
        )}
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}