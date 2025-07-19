import { getPostById } from '@/services/posts/service';
import PostDetail from '@/components/views/PostDetail';
import { notFound } from 'next/navigation';

type PostDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailProps) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);
  if (!post) {
    notFound();
  }

  return (
    <main className="py-8">
      <PostDetail post={post} />
    </main>
  );
}