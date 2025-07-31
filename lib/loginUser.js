import { supabase } from './supabase';

export async function loginUser(email) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('Usuário não encontrado');
  }

  return data;
}
