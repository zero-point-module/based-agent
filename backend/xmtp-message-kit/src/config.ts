// Setup dotenv
import dotenv from "dotenv";
import { env } from 'process';
dotenv.config();

export const agentConfig = {
  name: env.AGENT_NAME,
  tag: env.AGENT_TAG,
  description: env.AGENT_DESCRIPTION,
  owner: env.AGENT_OWNER,
} as const;

export default agentConfig; 