/**
 * Environment Variable Validation
 * 
 * Validates required environment variables are present and properly formatted.
 * Fails fast on startup if critical config is missing.
 */

interface EnvConfig {
  // Required
  openaiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  
  // Optional
  elevenLabsApiKey?: string;
  nextAuthSecret?: string;
  nextAuthUrl?: string;
  nodeEnv: string;
  debug: boolean;
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates a single environment variable
 */
function validateEnvVar(
  name: string,
  value: string | undefined,
  required: boolean = true,
  validator?: (val: string) => boolean
): string | undefined {
  if (!value || value.trim() === '') {
    if (required) {
      throw new EnvironmentValidationError(
        `Missing required environment variable: ${name}\n` +
        `Please add it to your .env.local file. See .env.example for guidance.`
      );
    }
    return undefined;
  }

  if (validator && !validator(value)) {
    throw new EnvironmentValidationError(
      `Invalid format for environment variable: ${name}`
    );
  }

  return value;
}

/**
 * Validates all environment variables and returns typed config
 */
export function validateEnvironment(): EnvConfig {
  const errors: string[] = [];

  try {
    // Validate OpenAI API Key
    const openaiApiKey = validateEnvVar(
      'OPENAI_API_KEY',
      process.env.OPENAI_API_KEY,
      true,
      (val) => val.startsWith('sk-')
    );

    // Validate Supabase configuration
    const supabaseUrl = validateEnvVar(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      true,
      (val) => val.startsWith('https://')
    );

    const supabaseAnonKey = validateEnvVar(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      true,
      (val) => val.startsWith('eyJ')
    );

    const supabaseServiceRoleKey = validateEnvVar(
      'SUPABASE_SERVICE_ROLE_KEY',
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      true,
      (val) => val.startsWith('eyJ')
    );

    // Validate optional ElevenLabs (voice features)
    const elevenLabsApiKey = validateEnvVar(
      'ELEVENLABS_API_KEY',
      process.env.ELEVENLABS_API_KEY,
      false
    );

    // Validate optional NextAuth
    const nextAuthSecret = validateEnvVar(
      'NEXTAUTH_SECRET',
      process.env.NEXTAUTH_SECRET,
      false
    );

    const nextAuthUrl = validateEnvVar(
      'NEXTAUTH_URL',
      process.env.NEXTAUTH_URL,
      false
    );

    // Get environment settings
    const nodeEnv = process.env.NODE_ENV || 'development';
    const debug = process.env.DEBUG === 'true';

    // Log configuration status
    if (nodeEnv === 'development') {
      console.log('✅ Environment validation passed');
      console.log('📝 Configuration:');
      console.log(`   - Node Environment: ${nodeEnv}`);
      console.log(`   - OpenAI API: Configured`);
      console.log(`   - Supabase: Configured`);
      console.log(`   - Voice Features: ${elevenLabsApiKey ? 'Enabled' : 'Disabled (optional)'}`);
      console.log(`   - NextAuth: ${nextAuthSecret ? 'Enabled' : 'Disabled (optional)'}`);
      console.log(`   - Debug Mode: ${debug ? 'On' : 'Off'}`);
    }

    return {
      openaiApiKey: openaiApiKey!,
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
      supabaseServiceRoleKey: supabaseServiceRoleKey!,
      elevenLabsApiKey,
      nextAuthSecret,
      nextAuthUrl,
      nodeEnv,
      debug,
    };
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error('\n❌ Environment Validation Failed\n');
      console.error(error.message);
      console.error('\n📖 Quick Fix:');
      console.error('   1. Copy .env.example to .env.local');
      console.error('   2. Fill in your API keys');
      console.error('   3. Restart the development server\n');
      
      // In production, fail fast
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      throw error;
    }
    throw error;
  }
}

/**
 * Validates environment on module load (fail fast)
 */
let envConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnvironment();
  }
  return envConfig;
}

/**
 * Type-safe environment variable access
 */
export const env = {
  get openaiApiKey() {
    return getEnvConfig().openaiApiKey;
  },
  get supabaseUrl() {
    return getEnvConfig().supabaseUrl;
  },
  get supabaseAnonKey() {
    return getEnvConfig().supabaseAnonKey;
  },
  get supabaseServiceRoleKey() {
    return getEnvConfig().supabaseServiceRoleKey;
  },
  get elevenLabsApiKey() {
    return getEnvConfig().elevenLabsApiKey;
  },
  get nextAuthSecret() {
    return getEnvConfig().nextAuthSecret;
  },
  get nextAuthUrl() {
    return getEnvConfig().nextAuthUrl;
  },
  get nodeEnv() {
    return getEnvConfig().nodeEnv;
  },
  get debug() {
    return getEnvConfig().debug;
  },
  get isProduction() {
    return getEnvConfig().nodeEnv === 'production';
  },
  get isDevelopment() {
    return getEnvConfig().nodeEnv === 'development';
  },
};

