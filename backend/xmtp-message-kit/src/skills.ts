import type { SkillGroup } from "@xmtp/message-kit";
import { handleOnChainAction } from "./handler/onChainActionHandler.js";
import { agentConfig } from "./config.js";

export const skills: any[] = [
  {
    ...agentConfig,
    skills: [
      {
        skill: "/get_wallet_details",
        handler: handleOnChainAction,
        description: "Get details about the Agent Wallet",
        examples: ["/get_wallet_details"],
        params: {},
      },
      {
        skill: "/get_balance [token]",
        handler: handleOnChainAction,
        description: "Check balance of specific tokens in the Agent Wallet",
        examples: ["/get_balance eth", "/get_balance usdc", "/get_balance all"],
        params: {
          token: {
            type: "string",
            default: "all",
          },
        },
      },
      {
        skill: "/request_faucet_funds [network]",
        handler: handleOnChainAction,
        description: "Request test tokens from faucet to the Agent Wallet",
        examples: ["/request_faucet_funds base_testnet", "/request_faucet_funds sepolia"],
        params: {
          network: {
            type: "string",
            values: ["base_testnet", "sepolia", "goerli"],
          },
        },
      },
      
      {
        skill: "/transfer [amount] [token] [to]",
        handler: handleOnChainAction,
        description: "Transfer tokens from the Agent Wallet to another address",
        examples: ["/transfer 0.1 eth 0x123...", "/transfer 100 usdc vitalik.eth"],
        params: {
          amount: {
            type: "number",
          },
          token: {
            type: "string",
            values: ["eth", "usdc", "dai"],
          },
          to: {
            type: "string",
          },
        },
      },
      {
        skill: "/trade [amount] [from] [to]",
        handler: handleOnChainAction,
        description: "Trade between tokens using best available DEX route",
        examples: ["/trade 1 eth usdc", "/trade 1000 usdc eth"],
        params: {
          amount: {
            type: "number",
          },
          from: {
            type: "string",
            values: ["eth", "usdc", "dai"],
          },
          to: {
            type: "string",
            values: ["eth", "usdc", "dai"],
          },
        },
      },
      {
        skill: "/deploy_token [name] [symbol] [supply]",
        handler: handleOnChainAction,
        description: "Deploy new ERC-20 token contract",
        examples: ["/deploy_token MyToken MTK 1000000"],
        params: {
          name: {
            type: "string",
          },
          symbol: {
            type: "string",
          },
          supply: {
            type: "number",
          },
        },
      },
    ],
  },
];
