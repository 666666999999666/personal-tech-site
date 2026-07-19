import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { deepseek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

export function resolveModel(): LanguageModel {
  const provider = process.env.LLM_PROVIDER ?? "openai";
  const modelName = process.env.LLM_MODEL ?? "gpt-4o";

  switch (provider) {
    case "openai":
      return openai(modelName);
    case "anthropic":
      return anthropic(modelName);
    case "google":
      return google(modelName);
    case "deepseek":
      return deepseek(modelName);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
