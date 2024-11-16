import { Address, EthBalance, Identity, Name, Avatar } from '@coinbase/onchainkit/identity';
import {
  ConnectWallet,
  Wallet as WalletComponent,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';

interface WalletProps {
  onConnect: () => Promise<string>;
}

export function Wallet({ onConnect }: WalletProps) {
  return (
    <WalletComponent>
      <ConnectWallet onConnect={onConnect}>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>

      <WalletDropdown>
        <Identity className="px-4 pb-2 pt-3" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>

        <WalletDropdownBasename />

        <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
          Wallet
        </WalletDropdownLink>

        <WalletDropdownFundLink />

        <WalletDropdownDisconnect />
      </WalletDropdown>
    </WalletComponent>
  );
}
