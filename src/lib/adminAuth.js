import { supabase } from '../../supabaseClient';

export const adminLogin = async (username, password) => {
  const { data, error } = await supabase.rpc('admin_login', {
    p_username: username,
    p_password: password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Invalid username or password');
  }

  const adminUser = data[0];

  if (!adminUser.is_active) {
    throw new Error('Account is inactive');
  }

  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminUser.id);

  return adminUser;
};

export const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'manager');
};

export const requireAdmin = (adminUser) => {
  if (!adminUser || !isAdmin(adminUser)) {
    throw new Error('Admin access required');
  }
};
