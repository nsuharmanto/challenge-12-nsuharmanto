import { getPostById } from '@/services/posts/service';
import PostDetail from '@/components/views/PostDetail';
import { notFound } from 'next/navigation';

type PostDetailProps = {
  params: Promise<{ id: string }>; // Ubah menjadi Promise
};

export default async function PostDetailPage({ params }: PostDetailProps) {
  const resolvedParams = await params; // Await params
  const post = await getPostById(resolvedParams.id); // Gunakan resolvedParams.id

  if (!post) {
    notFound();
  }

  return (
    <main className="py-8">
      <PostDetail post={post} />
    </main>
  );
}