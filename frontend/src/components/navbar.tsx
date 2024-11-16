import { Wallet } from './wallet';
import { createSiweMessage } from 'viem/siwe';
import { useAccount, useSignMessage } from 'wagmi';

interface NavbarProps {
  agentName: string;
}

export function Navbar({ agentName }: NavbarProps) {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const onConnect = async () => {
    const message = createSiweMessage({
      address: address ?? ('' as `0x${string}`),
      chainId: chainId ?? 0,
      domain: 'example.com',
      nonce: 'foobarbaz',
      uri: 'https://example.com/path',
      version: '1',
    });

    const signedMessage = await signMessageAsync({ message });

    return signedMessage;
  };

  return (
    <header className="z-30 flex h-16 items-center justify-between border-b border-white/10 px-6">
      <div className="flex items-center gap-3">
        <span className="font-medium">{agentName}</span>
      </div>

      <Wallet onConnect={onConnect} />
    </header>
  );
}
