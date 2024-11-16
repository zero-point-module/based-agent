import { clearMemory, SkillResponse } from "@xmtp/message-kit";
import { clearInfoCache } from "@xmtp/message-kit";

export async function clear() {
  clearMemory();
  clearInfoCache();
}

export function formatResponse(result: any): SkillResponse {
  if (result.success) {
    return {
      code: 200,
      message: `🚀 Transaction sent! \nDetails: ${JSON.stringify(result, null, 2)}`,
    };
  }
  return {
    code: 500,
    message: `😅 Ooops! Something went wrong: ${result.error || "Unknown error"}`,
  };
}
