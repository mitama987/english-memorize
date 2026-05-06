import Link from 'next/link';
import { getAllTopics } from '@/lib/topics';
import TopicListProgress from '@/components/TopicListProgress';

export default function Home() {
  const topics = getAllTopics();

  return (
    <main className="max-w-2xl md:max-w-5xl lg:max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 pb-16">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">English Memorize</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          17 トピック × 各約20ブロック。1 個ずつ覚えるための学習補助。
        </p>
      </header>

      {topics.length === 0 ? (
        <p className="text-gray-500 text-sm">
          トピックがありません。`npm run build:data` を実行してください。
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.fileId}
              href={`/topics/${topic.fileId}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:border-blue-400 hover:shadow-sm transition"
            >
              <span className="inline-block font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {topic.fileId}
              </span>
              <h2 className="font-semibold text-base md:text-lg mt-1.5 md:mt-2">{topic.title}</h2>
              <p className="text-sm text-gray-500">{topic.jaTitle}</p>
              <TopicListProgress topicId={topic.fileId} total={topic.blocks.length} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
