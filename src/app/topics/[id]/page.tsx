import { notFound } from 'next/navigation';
import { getAllTopics, getTopicByFileId } from '@/lib/topics';
import TopicView from './TopicView';

export function generateStaticParams() {
  return getAllTopics().map((t) => ({ id: t.fileId }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const topic = getTopicByFileId(id);
  if (!topic) notFound();
  return <TopicView topic={topic} />;
}
