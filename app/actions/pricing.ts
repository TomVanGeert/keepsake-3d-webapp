'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPricingConfig() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pricing_config')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching pricing config:', error);
    return [];
  }

  return data || [];
}

