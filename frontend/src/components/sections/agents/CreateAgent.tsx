import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/constants';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

enum ApproachEnum {
  CONSERVATIVE = 'conservative',
  MEDIUM = 'medium',
  HIGH_RISK = 'high-risk',
  DEGEN = 'degen',
}

type Approach = ApproachEnum | '';

enum StepEnum {
  PERSONALITY = 'personality',
  STRATEGY = 'strategy',
}

type Strategy = {
  approach: Approach;
  stopLoss: string;
  exitTarget: string;
};

type Personality = {
  name: string;
  description: string;
  farcaster: string;
  prompt: string;
};

type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export default function CreateAgent() {
  const { address } = useAccount();
  const [step, setStep] = useState<StepEnum>(StepEnum.STRATEGY);
  const [strategy, setStrategy] = useState<Strategy>({
    approach: '',
    stopLoss: '',
    exitTarget: '',
  });
  const [personality, setPersonality] = useState<Personality>({
    name: '',
    description: '',
    farcaster: '',
    prompt: '',
  });

  const onCreateAgent = async () => {
    const payload = {
      name: personality.name,
      tag: personality.name,
      description: personality.description,
      risk_approach: strategy.approach,
      stop_loss_usd: strategy.stopLoss,
      exit_target_usd: strategy.exitTarget,
      personality_prompt: personality.prompt,
      farcaster_personalities: [personality.farcaster],
      owner_address: address,
    };

    try {
      const response = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to create agent');
      }

      await response.json();
      toast.success('Agent created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
      console.error('Create agent error:', error);
    }
  };

  return (
    <div className="relative min-h-[800px] w-full overflow-hidden rounded-xl bg-black">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10" />
      <div className="absolute -left-32 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-500/20 blur-[120px]" />

      <Tabs
        value={step}
        defaultValue={StepEnum.STRATEGY}
        onValueChange={(value) => setStep(value as StepEnum)}
        className="relative z-10 flex h-full flex-col p-6"
      >
        {/* Futuristic Tab Navigation */}
        <TabsList className="relative mx-auto mb-8 grid w-[400px] grid-cols-2 rounded-xl bg-white/5 p-1 backdrop-blur-sm before:absolute before:inset-0 before:z-0 before:animate-pulse before:rounded-xl before:bg-gradient-to-r before:from-blue-500/20 before:via-purple-500/20 before:to-pink-500/20">
          <TabsTrigger
            value={StepEnum.STRATEGY}
            className="relative z-10 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Strategy
          </TabsTrigger>
          <TabsTrigger
            value={StepEnum.PERSONALITY}
            className="relative z-10 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Personality
          </TabsTrigger>
        </TabsList>

        <TabsContent value={StepEnum.STRATEGY} className="flex-1">
          <div className="flex h-full flex-col gap-8 rounded-xl bg-white/5 p-8 backdrop-blur-md">
            <div className="space-y-4">
              <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                Choose Your Strategy
              </h2>
              <p className="text-gray-400">Select how your agent will behave in the market</p>
            </div>

            {/* Risk Level Selection */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  value: ApproachEnum.CONSERVATIVE,
                  label: 'Conservative',
                  textColorClass: 'text-blue-400',
                  hoverClass: 'hover:border-blue-500/50',
                  gradientClass: 'from-blue-500/10 via-transparent to-transparent',
                  bottomBarClass: 'from-blue-500 to-transparent',
                },
                {
                  value: ApproachEnum.MEDIUM,
                  label: 'Medium',
                  textColorClass: 'text-yellow-400',
                  hoverClass: 'hover:border-yellow-500/50',
                  gradientClass: 'from-yellow-500/10 via-transparent to-transparent',
                  bottomBarClass: 'from-yellow-500 to-transparent',
                },
                {
                  value: ApproachEnum.HIGH_RISK,
                  label: 'High Risk',
                  textColorClass: 'text-orange-400',
                  hoverClass: 'hover:border-orange-500/50',
                  gradientClass: 'from-orange-500/10 via-transparent to-transparent',
                  bottomBarClass: 'from-orange-500 to-transparent',
                },
                {
                  value: ApproachEnum.DEGEN,
                  label: 'dEGeN',
                  render: (isSelected: boolean) => (
                    <div className="flex flex-col items-center gap-2">
                      <span className="animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-xl font-black text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                        dEGeN
                      </span>
                      {isSelected && (
                        <span className="animate-pulse text-sm text-white/60">Selected</span>
                      )}
                      <div className="absolute -inset-[1px] -z-10 animate-pulse rounded-xl bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-red-500/50 blur-sm transition-all group-hover:blur-md" />
                    </div>
                  ),
                },
              ].map(
                ({
                  value,
                  label,
                  textColorClass,
                  hoverClass,
                  gradientClass,
                  bottomBarClass,
                  render,
                }) => (
                  <button
                    key={value}
                    onClick={() => setStrategy({ ...strategy, approach: value })}
                    className={`group relative h-32 overflow-hidden rounded-xl border-2 border-transparent bg-white/5 transition-all hover:scale-105 ${hoverClass}`}
                  >
                    {/* Hover Effects */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${bottomBarClass} ${
                        strategy.approach === value ? 'opacity-100' : 'opacity-0'
                      } transition-opacity`}
                    />

                    {/* Content */}
                    {render ? (
                      render(strategy.approach === value)
                    ) : (
                      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
                        <span className={`text-xl font-bold ${textColorClass}`}>{label}</span>
                        {strategy.approach === value && (
                          <span className="animate-pulse text-sm text-white/60">Selected</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              )}
            </div>

            {/* Trading Parameters */}
            <div className="grid gap-6 rounded-xl bg-white/5 p-6 backdrop-blur-sm lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-sm text-gray-400">
                  Stop Loss Target
                </Label>
                <div className="relative">
                  <Input
                    id="stopLoss"
                    type="text"
                    value={strategy.stopLoss}
                    onChange={(e) => setStrategy({ ...strategy, stopLoss: e.target.value })}
                    className="border-white/10 bg-white/5 pl-8 text-white placeholder:text-white/50 focus:border-white/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitTarget" className="text-sm text-gray-400">
                  Exit Target
                </Label>
                <div className="relative">
                  <Input
                    id="exitTarget"
                    type="text"
                    value={strategy.exitTarget}
                    onChange={(e) => setStrategy({ ...strategy, exitTarget: e.target.value })}
                    className="border-white/10 bg-white/5 pl-8 text-white placeholder:text-white/50 focus:border-white/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-auto flex justify-end">
              <Button
                onClick={() => setStep(StepEnum.PERSONALITY)}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-white transition-all hover:scale-105"
              >
                <span className="relative z-10">Continue to Personality</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value={StepEnum.PERSONALITY} className="flex-1">
          <div className="flex h-full flex-col gap-8 rounded-xl bg-white/5 p-8 backdrop-blur-md">
            <div className="space-y-4">
              <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
                Define Your Agent
              </h2>
              <p className="text-gray-400">Give your agent a unique personality</p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-400">
                    Agent Name
                  </Label>
                  <Input
                    id="name"
                    value={personality.name}
                    onChange={(e) => setPersonality({ ...personality, name: e.target.value })}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/20"
                    placeholder="Enter agent name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farcaster" className="text-sm text-gray-400">
                    Farcaster Account
                  </Label>
                  <Input
                    id="farcaster"
                    value={personality.farcaster}
                    onChange={(e) => setPersonality({ ...personality, farcaster: e.target.value })}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/20"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm text-gray-400">
                  Description
                </Label>
                <Input
                  id="description"
                  value={personality.description}
                  onChange={(e) => setPersonality({ ...personality, description: e.target.value })}
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/20"
                  placeholder="Describe your agent..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm text-gray-400">
                  Personality Prompt
                </Label>
                <Textarea
                  id="prompt"
                  value={personality.prompt}
                  onChange={(e) => setPersonality({ ...personality, prompt: e.target.value })}
                  className="min-h-[150px] border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-white/20"
                  placeholder="Define how your agent should behave..."
                />
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-auto flex justify-end">
              <Button
                onClick={onCreateAgent}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3 text-white transition-all hover:scale-105"
              >
                <span className="relative z-10">Create Agent</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
