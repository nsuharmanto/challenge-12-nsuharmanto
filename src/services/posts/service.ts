import axios from 'axios';
import type { Post, PostListResponse } from '@/interfaces/post.interface';


export const getRecommendedPosts = async (): Promise<PostListResponse> => {
  try {
    const response = await axios.get(
      'https://blogger-wph-api-production.up.railway.app/posts/recommended?limit=10&page=1'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended posts:', error);
    return { data: [], total: 0, page: 1, lastPage: 1 };
  }
};


export const getMostLikedPosts = async (): Promise<PostListResponse> => {
  try {
    const response = await axios.get(
      'https://blogger-wph-api-production.up.railway.app/posts/most-liked?limit=5'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching most liked posts:', error);
    return { data: [], total: 0, page: 1, lastPage: 1 };
  }
};


export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const response = await axios.get(
      `https://blogger-wph-api-production.up.railway.app/posts/${id}`, { timeout: 15000 }
    );
    return {
      ...response.data,
      tags: response.data.tags || [], 
      author: {
        ...response.data.author,
        avatarUrl: response.data.author?.avatarUrl || '/default-avatar.png', 
      },
    };
  } catch (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    return null;
  }
};

export const searchPosts = async (query: string): Promise<PostListResponse> => {
  try {
    const response = await axios.get(
      `https://blogger-wph-api-production.up.railway.app/posts/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    return { data: [], total: 0, page: 1, lastPage: 1 };
  }
};