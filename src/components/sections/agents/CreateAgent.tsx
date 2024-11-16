import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/constants';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

enum ApproachEnum {
  CONSERVATIVE = 'conservative',
  MEDIUM = 'medium',
  HIGH_RISK = 'high-risk',
  DEGEN = 'degen',
}

enum StepEnum {
  APPROACH = 'approach',
  PERSONALITY = 'personality',
  STRATEGY = 'strategy',
}

type Approach = ApproachEnum | '';

type Strategy = {
  stopLoss: string;
  exitTarget: string;
};

type Personality = {
  farcaster: string;
  prompt: string;
};

type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export default function CreateAgent() {
  const [step, setStep] = useState<StepEnum>(StepEnum.APPROACH);

  const [approach, setApproach] = useState<Approach>('');
  const [strategy, setStrategy] = useState<Strategy>({ stopLoss: '', exitTarget: '' });
  const [personality, setPersonality] = useState<Personality>({ farcaster: '', prompt: '' });

  const navigate = useNavigate();

  const onCreateAgent = async () => {
    const payload = {
      approach,
      strategy,
      personality,
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

      const { agentId } = await response.json();

      toast.success('Agent created successfully!');

      navigate(`/agents/${agentId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';

      toast.error(message);

      console.error('Create agent error:', error);
    } finally {
    }
  };

  return (
    <Tabs
      value={step}
      defaultValue={StepEnum.APPROACH}
      onValueChange={(value) => setStep(value as StepEnum)}
      className="h-full w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value={StepEnum.APPROACH}>Approach</TabsTrigger>
        <TabsTrigger value={StepEnum.PERSONALITY}>Personality</TabsTrigger>
        <TabsTrigger value={StepEnum.STRATEGY}>Strategy</TabsTrigger>
      </TabsList>

      <TabsContent value={StepEnum.APPROACH}>
        <Card className="flex flex-col">
          <CardHeader className="">
            <CardTitle>Approach</CardTitle>
            <CardDescription>Decide which behavior you want your agent to have.</CardDescription>
          </CardHeader>

          <CardContent className="flex w-full items-center">
            <div className="flex flex-1 gap-4">
              <Button
                variant="outline"
                className={`border-2 border-blue-600 text-blue-700 hover:bg-blue-50 ${approach === ApproachEnum.CONSERVATIVE ? 'bg-blue-100 ring-2 ring-blue-600 ring-offset-2' : ''}`}
                onClick={() => setApproach(ApproachEnum.CONSERVATIVE)}
              >
                Conservative
              </Button>
              <Button
                className={`bg-yellow-500 text-white hover:bg-yellow-600 ${approach === ApproachEnum.MEDIUM ? 'scale-105 ring-2 ring-yellow-600 ring-offset-2' : ''}`}
                onClick={() => setApproach(ApproachEnum.MEDIUM)}
              >
                Medium
              </Button>
              <Button
                className={`animate-pulse bg-orange-500 text-white hover:bg-orange-600 ${approach === ApproachEnum.HIGH_RISK ? 'scale-105 ring-2 ring-orange-600 ring-offset-2' : ''}`}
                onClick={() => setApproach(ApproachEnum.HIGH_RISK)}
              >
                High Risk
              </Button>
              <Button
                className={`transform animate-pulse bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-purple-700 hover:via-pink-600 hover:to-red-600 ${approach === ApproachEnum.DEGEN ? 'scale-110 ring-2 ring-purple-600 ring-offset-2' : ''}`}
                onClick={() => setApproach(ApproachEnum.DEGEN)}
              >
                dEGeN
              </Button>
            </div>

            <Button onClick={() => setStep(StepEnum.PERSONALITY)}>Next</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value={StepEnum.PERSONALITY}>
        <Card>
          <CardHeader>
            <CardTitle>Personality</CardTitle>
            <CardDescription>Give your agent whatever personality you want.</CardDescription>
          </CardHeader>

          <CardContent className="flex w-full items-end gap-10">
            <div className="flex flex-1 flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="farcaster">Farcaster Account</Label>
                <Input
                  id="farcaster"
                  type="text"
                  value={personality.farcaster}
                  onChange={(e) => setPersonality({ ...personality, farcaster: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prompt">Personality Prompt</Label>
                <Textarea
                  id="prompt"
                  value={personality.prompt}
                  onChange={(e) => setPersonality({ ...personality, prompt: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={() => setStep(StepEnum.STRATEGY)}>Next</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value={StepEnum.STRATEGY}>
        <Card>
          <CardHeader>
            <CardTitle>Strategy</CardTitle>
            <CardDescription>Determine the strategy your agent will use.</CardDescription>
          </CardHeader>

          <CardContent className="flex w-full items-end gap-10">
            <div className="flex flex-1 flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="text"
                  value={strategy.stopLoss}
                  onChange={(e) => setStrategy({ ...strategy, stopLoss: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="exitTarget">Exit Target</Label>
                <Input
                  id="exitTarget"
                  type="text"
                  value={strategy.exitTarget}
                  onChange={(e) => setStrategy({ ...strategy, exitTarget: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={onCreateAgent}>Create Agent</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
