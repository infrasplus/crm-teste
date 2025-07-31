import { supabase } from './supabase';

export async function insertUser({ name, email }) {
  const { data, error } = await supabase
    .from('user')
    .insert([{ name, email }]);

  if (error) {
    throw error;
  }

  return data?.[0];
}
