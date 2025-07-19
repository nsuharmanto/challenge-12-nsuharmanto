'use client';

import React from 'react';
import EditPost from '@/components/views/EditPost';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <EditPost postId={id} />;
}