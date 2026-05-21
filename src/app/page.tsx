import Link from 'next/link';
import { getAllTopics } from '@/lib/topics';
import TopicListProgress from '@/components/TopicListProgress';
import StatsHero from '@/components/StatsHero';
import FavoritesNavBadge from '@/components/FavoritesNavBadge';
import { SparklesIcon } from '@/components/Icons';

export default function Home() {
  const topics = getAllTopics();

  return (
    <main className="max-w-2xl md:max-w-5xl lg:max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12 pb-20">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium glass"
            style={{ color: 'var(--text-secondary)' }}
          >
            <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#d946ef' }} />
            <span>17 topics × ~20 blocks each</span>
          </div>
          <FavoritesNavBadge />
        </div>
        <h1 className="heading-display text-4xl md:text-6xl lg:text-7xl mb-3">
          Memorize<br />
          <span className="text-gradient">Yourself</span><span style={{ color: 'var(--text-primary)' }}>.</span>
        </h1>
        <p className="text-base md:text-lg max-w-xl" style={{ color: 'var(--text-secondary)' }}>
          自己紹介プロファイル17トピックを、1ブロックずつ完全に身体化する英語学習ツール。
          初対面ネイティブとの 1〜2 時間が「逃げない・固まらない」場に変わる。
        </p>
      </header>

      <section className="mb-8 md:mb-10">
        <StatsHero topics={topics} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 md:mb-4" style={{ color: 'var(--text-muted)' }}>
          Topics
        </h2>
        {topics.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            トピックがありません。`npm run build:data` を実行してください。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {topics.map((topic, idx) => (
              <Link
                key={topic.fileId}
                href={`/topics/${topic.fileId}`}
                className="group relative block rounded-2xl p-5 md:p-6 glass transition-all hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer overflow-hidden"
              >
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'var(--grad-brand-soft)', filter: 'blur(24px)' }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {topic.fileId}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      Topic {idx + 1}
                    </span>
                  </div>
                  <h2 className="heading-display text-xl md:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                    {topic.title}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {topic.jaTitle}
                  </p>
                  <TopicListProgress topicId={topic.fileId} total={topic.blocks.length} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        <p>1ブロック = ひと呼吸で言える話題のかたまり。</p>
        <p className="mt-1">音声を聴き、口に乗せ、覚える。</p>
      </footer>
    </main>
  );
}
