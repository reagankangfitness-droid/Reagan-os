import { kv } from "@vercel/kv";

// Key builders
export const keys = {
  habits: (date: string) => `reagan:habits:${date}`,
  income: (month: string) => `reagan:income:${month}`,
  saasIdeas: () => `reagan:saas_ideas`,
  contentBank: () => `reagan:content_bank`,
  trainingSessions: (date: string) => `reagan:training:sessions:${date}`,
  trainingBiometrics: (date: string) => `reagan:training:biometrics:${date}`,
  trainingConfig: () => `reagan:training:config`,
};

export { kv };
