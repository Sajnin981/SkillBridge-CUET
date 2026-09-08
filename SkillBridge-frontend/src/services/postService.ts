import { api, type ApiEnvelope } from '@/api/axios';

interface BackendPostUser {
  _id: string;
  fullName?: string;
  companyName?: string;
  avatarUrl?: string;
  logoUrl?: string;
}

interface BackendPostLike {
  user: string;
  userModel: 'Student' | 'Company';
}

interface BackendPostComment {
  _id: string;
  user?: BackendPostUser;
  text: string;
  createdAt: string;
}

interface BackendPostItem {
  _id: string;
  author?: BackendPostUser;
  authorModel: 'Student' | 'Company';
  content: string;
  imageUrl?: string;
  likes?: BackendPostLike[];
  comments?: BackendPostComment[];
  createdAt: string;
}

export interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorType: 'student' | 'company';
  content: string;
  imageUrl: string;
  likes: number;
  likedByMe: boolean;
  comments: { id: string; userName: string; text: string; createdAt: string }[];
  createdAt: string;
}

function actorModelFromRole(role: 'student' | 'company') {
  return role === 'student' ? 'Student' : 'Company';
}

function mapPost(post: BackendPostItem, myRole: 'student' | 'company', myId: string): PostItem {
  const author = (typeof post.author === 'object' ? post.author : {}) as BackendPostUser;
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likes = Array.isArray(post.likes) ? post.likes : [];

  return {
    id: post._id,
    authorId: post.author?._id || '',
    authorName: author.fullName || author.companyName || 'User',
    authorAvatar: author.avatarUrl || author.logoUrl || '',
    authorType: post.authorModel === 'Student' ? 'student' : 'company',
    content: post.content || '',
    imageUrl: post.imageUrl || '',
    likes: likes.length,
    likedByMe: likes.some((like: BackendPostLike) => like.user === myId && like.userModel === actorModelFromRole(myRole)),
    comments: comments.map((comment: BackendPostComment) => ({
      id: comment._id,
      userName: comment.user?.fullName || comment.user?.companyName || 'User',
      text: comment.text,
      createdAt: comment.createdAt,
    })),
    createdAt: post.createdAt,
  };
}

export const postService = {
  async list(params: { authorId?: string; authorType?: 'student' | 'company' }, myRole: 'student' | 'company', myId: string): Promise<PostItem[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendPostItem[] }>>('/posts', { params });
    return res.data.data.items.map((item) => mapPost(item, myRole, myId));
  },

  async create(content: string, imageFile?: File) {
    if (imageFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('postImage', imageFile);
      await api.post<ApiEnvelope>('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return;
    }
    await api.post<ApiEnvelope>('/posts', { content });
  },

  async remove(id: string) {
    await api.delete<ApiEnvelope>(`/posts/${id}`);
  },

  async like(id: string) {
    await api.post<ApiEnvelope>(`/posts/${id}/like`);
  },

  async unlike(id: string) {
    await api.delete<ApiEnvelope>(`/posts/${id}/like`);
  },

  async comment(id: string, text: string) {
    await api.post<ApiEnvelope>(`/posts/${id}/comments`, { text });
  },
};
