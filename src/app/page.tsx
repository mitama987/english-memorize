import Link from 'next/link';
import { getAllTopics } from '@/lib/topics';
import TopicListProgress from '@/components/TopicListProgress';

export default function Home() {
  const topics = getAllTopics();

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">English Memorize</h1>
        <p className="text-sm text-gray-600 mt-1">
          17 トピック × 各約20ブロック。1 個ずつ覚えるための学習補助。
        </p>
      </header>

      <div className="space-y-2">
        {topics.length === 0 ? (
          <p className="text-gray-500 text-sm">
            トピックがありません。`npm run build:data` を実行してください。
          </p>
        ) : (
          topics.map((topic) => (
            <Link
              key={topic.fileId}
              href={`/topics/${topic.fileId}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
            >
              <span className="inline-block font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {topic.fileId}
              </span>
              <h2 className="font-semibold text-base mt-1.5">{topic.title}</h2>
              <p className="text-sm text-gray-500">{topic.jaTitle}</p>
              <TopicListProgress topicId={topic.fileId} total={topic.blocks.length} />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
