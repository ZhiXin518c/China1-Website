import React, { useState, useEffect } from 'react';
import { LogOut, Package, Menu as MenuIcon, Settings, Bell, BarChart3, Users } from 'lucide-react';
import { supabase } from './supabaseClient';
import OrderManagement from './OrderManagement';
import MenuManagement from './MenuManagement';
import Analytics from './Analytics';
import CustomerManagement from './CustomerManagement';

const AdminPanel = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadStats();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from('orders')
      .select('status, total, created_at')
      .gte('created_at', today.toISOString());

    if (orders) {
      const pending = orders.filter(o => o.status === 'pending').length;
      const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

      setStats({
        pendingOrders: pending,
        todayOrders: orders.length,
        todayRevenue: revenue,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">China 1 Admin Panel</h1>
              <p className="text-sm text-gray-600">Welcome, {admin.full_name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 px-6 py-2 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.pendingOrders}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${stats.todayRevenue.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Revenue</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <nav className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="h-4 w-4" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MenuIcon className="h-4 w-4" />
              Menu
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'customers'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              Customers
            </button>
          </nav>
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'customers' && <CustomerManagement />}
      </main>
    </div>
  );
};

export default AdminPanel;
