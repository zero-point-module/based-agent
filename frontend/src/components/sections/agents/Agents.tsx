import { API_URL } from '@/config/constants';
import { useInfiniteQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

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
};

type AgentsResponse = Agent[];

const ITEMS_PER_PAGE = 12;

export default function Agents() {
  const { address } = useAccount();
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

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Agent ${i + 1}`,
      description: `This is a ${riskApproaches[i % 4].toLowerCase()} trading agent with advanced analytics capabilities.`,
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

  if (status === 'pending') return <div className="text-center">Loading...</div>;
  if (status === 'error') return <div className="text-center">Error loading agents</div>;
  if (!data?.pages[0]?.length) return <div className="text-center">No agents found</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.pages.map((group) =>
          group.map((agent) => (
            <Card key={agent.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Risk Approach:</span> {agent.risk_approach}
                  </div>
                  <div>
                    <span className="font-medium">Stop Loss:</span> ${agent.stop_loss_usd}
                  </div>
                  <div>
                    <span className="font-medium">Exit Target:</span> ${agent.exit_target_usd}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div
                  className={`rounded-full px-2 py-1 text-xs ${
                    agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {agent.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(agent.created_at).toLocaleDateString()}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div ref={ref} className="flex justify-center p-4">
        {isFetchingNextPage && <div>Loading more...</div>}
      </div>
    </div>
  );
}
