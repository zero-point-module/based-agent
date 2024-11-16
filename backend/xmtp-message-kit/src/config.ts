// Setup dotenv
import dotenv from "dotenv";
import { env } from 'process';
dotenv.config();

export const agentConfig = {
  name: env.AGENT_NAME,
  tag: env.AGENT_TAG,
  description: env.AGENT_DESCRIPTION,
  owner: env.AGENT_OWNER,
  rpc: env.AGENT_RPC,
  collectionAddress: env.AGENT_COLLECTION_ADDRESS,
} as const;

export default agentConfig; 