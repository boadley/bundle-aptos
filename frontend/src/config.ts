export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Bundle',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Spend Crypto on Anything in Nigeria',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    icon: import.meta.env.VITE_APP_ICON || 'https://avatars.githubusercontent.com/u/179229932'
  },
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  },
  treasury: {
    address: import.meta.env.VITE_TREASURY_ADDRESS as string
  }
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'VITE_TREASURY_ADDRESS'
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;