import { HandlerContext, SkillResponse } from "@xmtp/message-kit";
import { agentConfig } from "../config.js";
import { formatResponse } from "../utils.js";

export async function handleOnChainAction(
  context: HandlerContext
): Promise<SkillResponse | undefined> {
  const {
    message: {
      sender,
      content: { skill, params },
    },
  } = context;

  // Validate sender permissions
  if (!isAuthorizedSender(sender?.address)) {
    return {
      code: 403,
      message: "⚠️ Unauthorized: Only specific addresses can perform this action",
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

function isAuthorizedSender(address?: string): boolean {
  if (!address) return false;
  return address.toLowerCase() === agentConfig.owner.toLowerCase();
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

