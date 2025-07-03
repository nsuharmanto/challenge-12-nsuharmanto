'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/posts', {
        title,
        content,
        tags: tags.split(',').map(t => t.trim()),
        imageUrl,
      });
      router.push('/');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object' &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        alert(
          (err as { response: { data: { message: string } } }).response.data.message
        );
      } else {
        alert('Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-10 mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Create New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-primary-400 text-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="border border-gray-300 rounded-lg w-full px-4 py-2 min-h-[120px] focus:outline-primary-400 text-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Programming, Frontend, Coding"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-primary-400 text-base"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Paste image URL here"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-primary-400 text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </main>
  );
}