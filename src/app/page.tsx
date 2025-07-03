'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PostCard from '@/components/views/PostCard';
import Image from 'next/image';
import { recommendedPosts } from '@/dummyData/recommendedPosts';
import { mostLikedPosts } from '@/dummyData/mostLikedPosts';
import type { Post } from '@/interfaces/post.interface';

export default function HomePage() {
  const isBackendAvailable = process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === 'true';
  const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const [posts, setPosts] = useState<Post[]>([]);
  const [mostLiked, setMostLiked] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isBackendAvailable) {
          let url = '';
          if (searchQuery && searchQuery.trim() !== '') {
            url = `${baseApiUrl}/posts/search?query=${encodeURIComponent(searchQuery)}&limit=${postsPerPage}&page=${currentPage}`;
          } else {
            url = `${baseApiUrl}/posts/recommended?limit=${postsPerPage}&page=${currentPage}`;
          }
          const recommendedRes = await fetch(url);
          const mostLikedRes = await fetch(`${baseApiUrl}/posts/most-liked?limit=10&page=1`);

          if (!recommendedRes.ok || !mostLikedRes.ok) {
            throw new Error('Failed to fetch data from backend');
          }

          const recommendedData = await recommendedRes.json();
          const mostLikedData = await mostLikedRes.json();

          setPosts(
            recommendedData.data.map((post: Post) => ({
              ...post,
              author: {
                ...post.author,
                avatarUrl: post.author?.avatarUrl
                  ? post.author.avatarUrl.startsWith('http')
                    ? post.author.avatarUrl
                    : post.author.avatarUrl.startsWith('/uploads')
                      ? `https://blogger-wph-api-production.up.railway.app${post.author.avatarUrl}`
                      : post.author.avatarUrl
                  : '/default-avatar.png'
              }
            }))
          );
          setMostLiked(
            mostLikedData.data.map((post: Post) => ({
              ...post,
              author: {
                ...post.author,
                avatarUrl: post.author?.avatarUrl
                  ? post.author.avatarUrl.startsWith('http')
                    ? post.author.avatarUrl
                    : `https://blogger-wph-api-production.up.railway.app${post.author.avatarUrl}`
                  : '/default-avatar.png'
              }
            }))
          );

          if (recommendedData.total) {
            setTotalPages(Math.ceil(recommendedData.total / postsPerPage));
          } else {
            setTotalPages(1);
          }
        } else {
          let filtered = recommendedPosts.data;
          if (searchQuery) {
            filtered = filtered.filter(post =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setPosts(filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage));
          setMostLiked(mostLikedPosts.data.slice(0, 10));
          setTotalPages(Math.ceil(filtered.length / postsPerPage));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        let filtered = recommendedPosts.data;
        if (searchQuery) {
          filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setPosts(filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage));
        setMostLiked(mostLikedPosts.data.slice(0, 10));
        setTotalPages(Math.ceil(filtered.length / postsPerPage));
      }
    };

    fetchData();
  }, [isBackendAvailable, baseApiUrl, currentPage, postsPerPage, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage <= 2) end = Math.min(totalPages, 3);
    if (currentPage >= totalPages - 1) start = Math.max(1, totalPages - 2);

    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`mx-1 w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
          currentPage === 1
            ? 'bg-[#0093DD] text-white font-bold'
            : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
        }`}
        style={{
          border: 'none',
          background: currentPage === 1 ? '#0093DD' : 'none',
          cursor: currentPage === 1 ? 'default' : 'pointer',
        }}
      >
        1
      </button>
    );

    if (start > 2) {
      pages.push(
        <span key="start-ellipsis" className="mx-1 text-gray-400 select-none">...</span>
      );
    }

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`mx-1 w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
              currentPage === i
                ? 'bg-[#0093DD] text-white font-bold'
                : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
            }`}
            style={{
              border: 'none',
              background: currentPage === i ? '#0093DD' : 'none',
              cursor: currentPage === i ? 'default' : 'pointer',
            }}
          >
            {i}
          </button>
        );
      }
    }

    if (end < totalPages - 1) {
      pages.push(
        <span key="end-ellipsis" className="mx-1 text-gray-400 select-none">...</span>
      );
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`mx-1 w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
            currentPage === totalPages
              ? 'bg-[#0093DD] text-white font-bold'
              : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
          }`}
          style={{
            border: 'none',
            background: currentPage === totalPages ? '#0093DD' : 'none',
            cursor: currentPage === totalPages ? 'default' : 'pointer'
          }}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <main className="pt-32 bg-white min-h-screen">
      <Header onSearch={handleSearch} /> 
      <div className="w-full px-6 md:px-20 py-0" style={{ position: 'relative' }}>
        <div className="flex flex-col lg:flex-row gap-12">
          <section className="w-full max-w-[807px] ml-10">
            <h2 className="text-2xl font-bold mb-9 text-gray-900">Recommend For You</h2>
            <div className="relative">
              <div className="flex flex-col w-full max-w-[807px]">
                {posts.length === 0 ? (
                  <p className="text-gray-500">No posts found.</p>
                ) : (
                  posts.map((post: Post, index) => (
                    <div key={post.id} className="w-full max-w-[807px]">
                      <PostCard
                        post={post}
                        horizontal
                        {...(!isLoggedIn && { disableLink: true })}
                      />
                      {index < posts.length - 1 && (
                        <hr className="border-t border-gray-200 my-6" />
                      )}
                    </div>
                  ))
                )}
                {posts.length > 0 && <hr className="border-t border-gray-200 my-6" />}
              </div>
              {/* Overlay hanya untuk konten utama, tidak menutupi pagination */}
              {!isLoggedIn && (
                <div
                  className="absolute inset-0 z-40 bg-transparent"
                  style={{ pointerEvents: 'all', cursor: 'default' }}
                />
              )}
            </div>
            {/* Pagination: tampilkan hanya jika totalPages > 1 */}
            {totalPages > 1 && (
              <div className="flex justify-center mb-39 items-center gap-1 select-none">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`group flex items-center px-2 py-1 text-sm text-gray-600 hover:text-blue-500 transition ${
                    currentPage === 1 ? 'opacity-50 cursor-default' : 'cursor-pointer'
                  }`}
                  style={{ background: 'none', border: 'none' }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                    className="mr-1 stroke-current transition-colors"
                  >
                    <path
                      d="M13 16l-5-5 5-5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-blue-500"
                    />
                  </svg>
                  Previous
                </button>
                
                {renderPagination()}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`group flex items-center px-2 py-1 text-sm text-gray-600 hover:text-blue-500 transition ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{ background: 'none', border: 'none' }}
                >
                  Next
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                    className="ml-1 stroke-current transition-colors"
                  >
                    <path
                      d="M7 4l5 5-5 5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-blue-500"
                    />
                  </svg>
                </button>
              </div>
            )}
          </section>

          <div className="hidden lg:block border-l border-gray-200 h-[1673px]"></div>

          <aside className="w-full lg:w-80 shrink-0 hidden lg:block">
            <div className="bg-white">
              <h3 className="text-lg font-semibold mb-5 text-gray-900">Most Liked</h3>
              <div className="flex flex-col gap-0">
                {mostLiked?.map((post: Post, index) => (
                  <div key={post.id} className="flex flex-col">
                    <div className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-2">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2 mb-4">{post.content}</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-gray-600">
                        <Image
                          src="/like-gray-icon.svg"
                          alt="Like"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        <span className="text-sm">{post.likes ?? 0}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Image
                          src="/Comment Icon.svg"
                          alt="Comment"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        <span className="text-sm">{post.comments ?? 0}</span>
                      </div>
                    </div>
                    {index < mostLiked.length - 1 && (
                      <hr className="border-t border-gray-200 my-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}