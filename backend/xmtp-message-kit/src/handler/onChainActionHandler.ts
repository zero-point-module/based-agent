import { HandlerContext, SkillResponse } from "@xmtp/message-kit";
import { agentConfig } from "../config.js";
import { formatResponse } from "../utils.js";
import { ethers } from "ethers";

export async function handleOnChainAction(
  context: HandlerContext
): Promise<SkillResponse | undefined> {
  const {
    message: {
      sender,
      content: { skill, params },
    },
  } = context;

  console.log("Handling on-chain action:", skill);
  console.log("Sender address:", sender.address);

  // Validate sender permissions
  if (!sender.address || !isAuthorizedSender(sender.address)) {
    return {
      code: 403,
      message: "⚠️ Unauthorized: Only Agent Commandship Holders can perform on-chain actions",
    };
  }

  try {
    switch (skill) {
      case "get_wallet_details": {
        const result = await forwardToService("get_wallet_details", {}, {});
        return formatResponse(result);
      }

      case "get_balance": {
        const { token } = params;
        const result = await forwardToService("get_balance", { token }, {});
        return formatResponse(result);
      }

      case "transfer": {
        const { amount, token, to } = params;
        if (!amount || !token || !to) {
          return {
            code: 400,
            message: "Missing required parameters. Need amount, token, and destination address.",
          };
        }

        const result = await forwardToService("transfer", { amount, token, to }, {});
        return formatResponse(result);
      }

      case "trade": {
        const { amount, from, to } = params;
        if (!amount || !from || !to) {
          return {
            code: 400,
            message: "Missing required parameters. Need amount, from token, and to token.",
          };
        }

        const result = await forwardToService("trade", { amount, from, to }, {});
        return formatResponse(result);
      }

      case "check_authorization": {
        if (!sender.address) {
          return {
            code: 400,
            message: "No sender address provided",
          };
        }
        const isAuthorized = await isAuthorizedSender(sender.address);
        return {
          code: 200,
          message: isAuthorized
            ? "✅ Welcome aboard captain! You've got access - time to make some smart investment moves!"
            : "⚠️ Access denied! Looks like you need this Agent Commandship NFT to influence on it's on-chain desitions. Think of it as your agent ownership pass!",
        };
      }

      case "trending_tokens": {
        const tokens = await getTrendingTokens();
        return {
          code: 200,
          message:
            "Some top trending tokens:\n" +
            (tokens as any[])
              .map(token => `${token.symbol} (${token.gain.toFixed(2)}%)`)
              .join("\n"),
          data: tokens,
        };
      }

      default:
        return { code: 400, message: "Skill not found." };
    }
  } catch (error) {
    console.error("OnChain action error:", error);
    return {
      code: 500,
      message: `❌ Error executing ${skill}: ${(error as Error).message}`,
    };
  }
}

async function isAuthorizedSender(address: string): Promise<boolean> {
  if (!process.env.AGENT_COLLECTION_ADDRESS) {
    throw new Error("AGENT_COLLECTION_ADDRESS is not set");
  }

  try {
    const provider = new ethers.JsonRpcProvider(agentConfig.rpc);
    const contract = new ethers.Contract(
      process.env.AGENT_COLLECTION_ADDRESS,
      ["function balanceOf(address owner) view returns (uint256)"],
      provider
    );

    const balance = await contract.balanceOf(address);

    console.log("Checking balance for address:", address);
    console.log("Balance:", balance);

    return balance > 0;
  } catch (error) {
    console.error("Error checking NFT balance:", error);
    return false;
  }
}

async function getTrendingTokens(): Promise<string[]> {
  if (!process.env.COINMARKETCAP_API_KEY) {
    throw new Error("COINMARKETCAP_API_KEY is not set");
  }

  const response = await fetch(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?sort=percent_change_24h&sort_dir=desc",
    {
      headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "" },
    }
  );
  const data: any = await response.json();
  // pick the 100 fastest growing tokens
  const tokens = data.data.slice(0, 100).map((token: any) => ({
    symbol: token.symbol,
    name: token.name,
    gain: token.quote.USD.percent_change_24h,
  }));
  // pick 3 random from the list
  const randomTokens = tokens.sort(() => 0.5 - Math.random()).slice(0, 3);
  console.log("Trending tokens:", randomTokens);
  return randomTokens;
}

async function forwardToService(
  action: string,
  params: Record<string, any>,
  context: any
): Promise<any> {
  // TODO: Implement your service client call here
  // This is where you'd call your external service
  // const service: OnChainService = getServiceClient();
  // return service.executeAction(action, params, context);

  

  // Temporary mock response
  return {
    success: true,
    action,
    params,
    timestamp: context.timestamp,
  };
}
