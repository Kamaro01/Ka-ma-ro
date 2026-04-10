import { Metadata } from 'next';
import AIRecommendationInteractive from './components/AIRecommendationInteractive';

export const metadata: Metadata = {
  title: 'AI-Powered Recommendations - Ka-ma-ro',
  description:
    'Discover personalized product recommendations powered by artificial intelligence. Get smart suggestions based on your browsing history and preferences.',
  keywords:
    'AI recommendations, personalized shopping, smart suggestions, product discovery, Ka-ma-ro AI',
};

export default function AIRecommendationEnginePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AIRecommendationInteractive />
    </main>
  );
}
