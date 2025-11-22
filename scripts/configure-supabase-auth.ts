/**
 * Script to configure Supabase Authentication URLs
 * 
 * This script configures the Site URL and Redirect URLs for Supabase Authentication
 * using the Supabase Management API.
 * 
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your-access-token \
 *   PROJECT_ID=azriosdfhdmmmroqiksx \
 *   SITE_URL=https://keepsake-3d-webapp.vercel.app \
 *   npx tsx scripts/configure-supabase-auth.ts
 */

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.PROJECT_ID || 'azriosdfhdmmmroqiksx';
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://keepsake-3d-webapp.vercel.app';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN is required');
  console.error('\nTo get your access token:');
  console.error('1. Go to https://supabase.com/dashboard/account/tokens');
  console.error('2. Create a new access token');
  console.error('3. Set it as SUPABASE_ACCESS_TOKEN environment variable');
  process.exit(1);
}

const MANAGEMENT_API_BASE = 'https://api.supabase.com/v1';

interface AuthConfig {
  SITE_URL: string;
  URI_ALLOW_LIST: string[];
}

async function getCurrentAuthConfig(): Promise<AuthConfig | null> {
  try {
    const response = await fetch(
      `${MANAGEMENT_API_BASE}/projects/${PROJECT_ID}/config/auth`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.text();
      throw new Error(`Failed to get auth config: ${response.status} ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting auth config:', error);
    throw error;
  }
}

async function updateAuthConfig(config: Partial<AuthConfig>): Promise<void> {
  try {
    const currentConfig = await getCurrentAuthConfig();
    const updatedConfig: AuthConfig = {
      SITE_URL: config.SITE_URL || currentConfig?.SITE_URL || SITE_URL,
      URI_ALLOW_LIST: config.URI_ALLOW_LIST || currentConfig?.URI_ALLOW_LIST || [],
    };

    const response = await fetch(
      `${MANAGEMENT_API_BASE}/projects/${PROJECT_ID}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update auth config: ${response.status} ${error}`);
    }

    const result = await response.json();
    console.log('✅ Auth configuration updated successfully');
    console.log('   Site URL:', result.SITE_URL || updatedConfig.SITE_URL);
    console.log('   Redirect URLs:', result.URI_ALLOW_LIST || updatedConfig.URI_ALLOW_LIST);
  } catch (error) {
    console.error('Error updating auth config:', error);
    throw error;
  }
}

async function main() {
  console.log('🔧 Configuring Supabase Authentication URLs...\n');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Site URL: ${SITE_URL}\n`);

  const redirectUrls = [
    `${SITE_URL}/auth/callback`,
    `${SITE_URL}/**`,
  ];

  // Also add localhost for development
  if (!SITE_URL.includes('localhost')) {
    redirectUrls.push('http://localhost:3000/auth/callback');
    redirectUrls.push('http://localhost:3000/**');
  }

  try {
    await updateAuthConfig({
      SITE_URL: SITE_URL,
      URI_ALLOW_LIST: redirectUrls,
    });

    console.log('\n✅ Configuration complete!');
    console.log('\nNext steps:');
    console.log('1. Verify the configuration in Supabase Dashboard → Authentication → URL Configuration');
    console.log('2. Test email confirmation by signing up a new user');
  } catch (error) {
    console.error('\n❌ Failed to configure authentication URLs');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nAlternative: Configure manually in Supabase Dashboard:');
    console.error('1. Go to https://supabase.com/dashboard/project/' + PROJECT_ID);
    console.error('2. Navigate to Authentication → URL Configuration');
    console.error(`3. Set Site URL to: ${SITE_URL}`);
    console.error(`4. Add Redirect URLs: ${redirectUrls.join(', ')}`);
    process.exit(1);
  }
}

main();

