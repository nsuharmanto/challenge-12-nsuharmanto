export interface Author {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  username: string;
}

export interface Commentator {
  name: string;
  avatarUrl: string;
  comment: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tags?: string[]; 
  imageUrl?: string; 
  createdAt?: string; 
  likes?: number; 
  comments?: number; 
  author: Author; 
  commentators?: Commentator[];
}

export interface PostListResponse {
  data: Post[];
  total: number;
  page: number;
  lastPage: number;
}