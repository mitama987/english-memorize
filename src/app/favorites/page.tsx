import { getAllTopics } from '@/lib/topics';
import FavoritesView from './FavoritesView';

export default function FavoritesPage() {
  const topics = getAllTopics();
  return <FavoritesView topics={topics} />;
}
