import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users, Calendar } from 'lucide-react';
import { supabase } from './supabaseClient';

const Analytics = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    weekRevenue: 0,
    weekOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
  });
  const [topItems, setTopItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [ordersResult, customersResult, itemsResult] = await Promise.all([
      supabase.from('orders').select('total, created_at, status'),
      supabase.from('customers').select('id'),
      supabase.from('order_items').select('name, quantity, final_price'),
    ]);

    if (ordersResult.data) {
      const completedOrders = ordersResult.data.filter(o => o.status === 'completed');

      const todayOrders = completedOrders.filter(o => new Date(o.created_at) >= today);
      const weekOrders = completedOrders.filter(o => new Date(o.created_at) >= weekAgo);
      const monthOrders = completedOrders.filter(o => new Date(o.created_at) >= monthAgo);

      const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

      setStats({
        todayRevenue,
        todayOrders: todayOrders.length,
        weekRevenue,
        weekOrders: weekOrders.length,
        monthRevenue,
        monthOrders: monthOrders.length,
        totalCustomers: customersResult.data?.length || 0,
        avgOrderValue: completedOrders.length > 0
          ? completedOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) / completedOrders.length
          : 0,
      });

      setRecentOrders(ordersResult.data.slice(0, 5));
    }

    if (itemsResult.data) {
      const itemCounts = {};
      itemsResult.data.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += parseFloat(item.final_price) * item.quantity;
      });

      const sorted = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTopItems(sorted);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.todayOrders} orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">This Week</p>
          <p className="text-3xl font-bold text-gray-900">${stats.weekRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.weekOrders} orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-3xl font-bold text-gray-900">${stats.monthRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.monthOrders} orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">Avg: ${stats.avgOrderValue.toFixed(2)}/order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.count} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">${item.revenue.toFixed(2)}</p>
              </div>
            ))}
            {topItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">No items sold yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.created_at} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.status === 'completed' ? 'Order Completed' : `Order ${order.status}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">${parseFloat(order.total).toFixed(2)}</p>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
