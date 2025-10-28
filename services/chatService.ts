import { chatWithAgent } from "./agentService";

export async function chat(agentId: string, params: { message: string; context?: any }) {
  return chatWithAgent(agentId, params);
}


