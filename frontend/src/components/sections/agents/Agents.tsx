// import { API_URL } from '@/config/constants';
import { useInfiniteQuery } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { useTransition } from 'react';
import { useNavigate } from 'react-router-dom';

// type ApiError = {
//   message: string;
//   code?: string;
//   status?: number;
// };

type Agent = {
  tag: string;
  risk_approach: string;
  farcaster_personalities: string[];
  stop_loss_usd: number;
  created_at: string;
  is_active: boolean;
  last_active_at: string;
  name: string;
  description: string;
  id: number;
  personality_prompt: string;
  exit_target_usd: number;
  owner_address: string;
  updated_at: string;
  image_url: string; // New field
};

// type AgentsResponse = Agent[];

const ITEMS_PER_PAGE = 12;

export default function Agents() {
  const navigate = useNavigate();
  const [_, startTransition] = useTransition();
  // const { address } = useAccount();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['agents'],
    queryFn: ({ pageParam }) => fetchAgents(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < ITEMS_PER_PAGE) return undefined;
      return allPages.length;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const generateMockAgents = (count: number): Agent[] => {
    const riskApproaches = ['Conservative', 'Moderate', 'Aggressive', 'Dynamic'];
    const personalities = ['Analyst', 'Trader', 'Observer', 'Risk-Taker'];
    const descriptions = [
      'A sophisticated AI trading agent that leverages advanced analytics and market sentiment analysis.',
      'An intelligent trading system designed to identify and capitalize on market inefficiencies.',
      'A data-driven agent that combines technical analysis with real-time market data.',
      'A strategic trading bot that uses machine learning to adapt to market conditions.',
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Trading Agent ${i + 1}`,
      description: descriptions[i % descriptions.length],
      tag: `tag-${i + 1}`,
      risk_approach: riskApproaches[i % 4],
      farcaster_personalities: [personalities[i % 4], personalities[(i + 1) % 4]],
      stop_loss_usd: Math.floor(Math.random() * 1000) + 500,
      exit_target_usd: Math.floor(Math.random() * 5000) + 2000,
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: Math.random() > 0.3,
      last_active_at: new Date(Date.now() - Math.random() * 1000000).toISOString(),
      personality_prompt: `Personality prompt for Agent ${i + 1}`,
      owner_address: '0x1234...5678',
      image_url: `https://picsum.photos/seed/${i + 1}/200/200`, // Random images
    }));
  };

  const MOCK_AGENTS = generateMockAgents(30);

  const fetchAgents = async (page: number) => {
    // try {
    //   const response = await fetch(
    //     `${API_URL}/agents/owner/${address}?page=${page}&limit=${ITEMS_PER_PAGE}`
    //   );
    //   if (!response.ok) {
    //     const error: ApiError = await response.json();
    //     throw new Error(error.message || 'Failed to fetch agents');
    //   }
    //   const data: AgentsResponse = await response.json();
    //   return data;
    // } catch (error) {
    //   const message = error instanceof Error ? error.message : 'Something went wrong';
    //   toast.error(message);
    //   console.error('Fetch agents error:', error);
    //   return [];

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return MOCK_AGENTS.slice(startIndex, endIndex);
  };

  const handleNavigation = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  if (status === 'pending') return <div className="text-center">Loading...</div>;
  if (status === 'error') return <div className="text-center">Error loading agents</div>;
  if (!data?.pages[0]?.length) return <div className="text-center">No agents found</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.pages.map((group) =>
          group.map((agent) => (
            <Card
              key={agent.id}
              onClick={() => handleNavigation('/create-agents')}
              className="group relative h-[425px] cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br from-black via-gray-900 to-black transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              {/* Glowing orb effect */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl transition-all duration-500 group-hover:bg-blue-500/30" />

              {/* Content container */}
              <div className="relative z-10 flex h-full flex-col p-4">
                {/* Top section with image and status */}
                <div className="flex items-start justify-between">
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl">
                    <img
                      src={agent.image_url}
                      alt={agent.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Status Chip */}
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                      agent.is_active
                        ? 'bg-green-500/20 text-green-200'
                        : 'bg-red-500/20 text-red-200'
                    } backdrop-blur-sm`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        agent.is_active ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    <span className="text-xs font-medium">
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Agent info */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{agent.description}</p>
                  </div>

                  {/* Stats with custom styling */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 truncate rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                      <p className="text-xs text-gray-500">Risk Level</p>
                      <p className="truncate font-mono text-sm font-bold text-white">
                        {agent.risk_approach}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                      <p className="text-xs text-gray-500">Stop Loss</p>
                      <p className="font-mono text-sm font-bold text-white">
                        ${agent.stop_loss_usd}
                      </p>
                    </div>
                  </div>

                  {/* Personality tags */}
                  <div className="flex flex-wrap gap-2">
                    {agent.farcaster_personalities.map((personality) => (
                      <span
                        key={personality}
                        className="truncate rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                      >
                        {personality}
                      </span>
                    ))}
                  </div>

                  {/* Bottom stats */}
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                    <span>Target: ${agent.exit_target_usd}</span>
                    <span>{new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div ref={ref} className="flex justify-center p-4">
        {isFetchingNextPage && <div className="text-sm text-gray-500">Loading more agents...</div>}
      </div>
    </div>
  );
}
