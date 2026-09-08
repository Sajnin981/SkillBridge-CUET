import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Heart, Trash2, ImagePlus } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { postService, type PostItem } from '@/services/postService';
import { resolveAssetUrl } from '@/api/axios';
import { timeAgo } from '@/lib/utils';

interface PostFeedProps {
  myId: string;
  myRole: 'student' | 'company';
  authorId: string;
  authorType: 'student' | 'company';
  canCreate: boolean;
  focusPostId?: string;
}

export function PostFeed({ myId, myRole, authorId, authorType, canCreate, focusPostId }: PostFeedProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const imageRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    postService.list({ authorId, authorType }, myRole, myId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [authorId, authorType, myId, myRole]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!focusPostId || loading) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(`post-${focusPostId}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [focusPostId, loading, items]);

  const createPost = async () => {
    if (!content.trim()) return;
    try {
      await postService.create(content.trim(), imageFile);
      setContent('');
      setImageFile(undefined);
      load();
      toast({ title: 'Post published', variant: 'success' });
    } catch {
      toast({ title: 'Could not publish post', variant: 'error' });
    }
  };

  const toggleLike = async (post: PostItem) => {
    try {
      if (post.likedByMe) await postService.unlike(post.id);
      else await postService.like(post.id);
      load();
    } catch {
      toast({ title: 'Could not update like', variant: 'error' });
    }
  };

  const addComment = async (postId: string) => {
    const text = (commentDraft[postId] || '').trim();
    if (!text) return;
    try {
      await postService.comment(postId, text);
      setCommentDraft((prev) => ({ ...prev, [postId]: '' }));
      load();
    } catch {
      toast({ title: 'Could not add comment', variant: 'error' });
    }
  };

  const removePost = async (id: string) => {
    try {
      await postService.remove(id);
      load();
      toast({ title: 'Post deleted', variant: 'success' });
    } catch {
      toast({ title: 'Could not delete post', variant: 'error' });
    }
  };

  return (
    <Card>
      <CardHeader title="Posts" subtitle="Professional updates and activity" />
      {canCreate && (
        <div className="mb-4 space-y-2">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[90px] resize-y" placeholder="Share what you are working on, achievements, or updates..." />
          <div className="flex items-center gap-2">
            <input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0])} />
            <Button variant="outline" size="sm" onClick={() => imageRef.current?.click()}><ImagePlus className="h-4 w-4" />Attach image</Button>
            {imageFile && <span className="text-xs text-ink-500">{imageFile.name}</span>}
            <div className="ml-auto"><Button size="sm" onClick={createPost}>Post</Button></div>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-ink-400">Loading posts...</p> : items.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No posts yet" description="Posts will appear here when this profile shares updates." />
      ) : (
        <div className="space-y-4">
          {items.map((post) => (
            <div id={`post-${post.id}`} key={post.id} className={`rounded-xl border p-4 ${focusPostId === post.id ? 'border-brand-300 ring-1 ring-brand-200' : 'border-ink-100'}`}>
              <div className="flex items-center gap-3">
                <Avatar name={post.authorName} src={post.authorAvatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-800">{post.authorName}</p>
                  <p className="text-xs text-ink-400">{timeAgo(post.createdAt)}</p>
                </div>
                {post.authorId === myId && <Button variant="ghost" size="sm" onClick={() => removePost(post.id)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>}
              </div>
              <p className="mt-3 text-sm text-ink-700">{post.content}</p>
              {post.imageUrl && <img src={resolveAssetUrl(post.imageUrl)} alt="Post" className="mt-3 max-h-80 w-full rounded-lg object-cover" />}
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleLike(post)}><Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-danger-500 text-danger-500' : ''}`} />{post.likes}</Button>
                <span className="text-xs text-ink-500">{post.comments.length} comments</span>
              </div>
              <div className="mt-3 space-y-2">
                {post.comments.map((comment) => <p key={comment.id} className="rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-700"><span className="font-semibold">{comment.userName}:</span> {comment.text}</p>)}
                <div className="flex gap-2">
                  <input value={commentDraft[post.id] || ''} onChange={(e) => setCommentDraft((prev) => ({ ...prev, [post.id]: e.target.value }))} className="input h-9" placeholder="Write a comment" />
                  <Button size="sm" onClick={() => addComment(post.id)}>Comment</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
