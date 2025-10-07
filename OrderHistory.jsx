import React, { useState, useEffect } from 'react';
import { Package, Clock, CircleCheck as CheckCircle, Circle as XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from './supabaseClient';

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      loadOrders();

      const channel = supabase
        .channel('customer-orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        }, () => {
          loadOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No orders yet</p>
        <p className="text-sm text-gray-500 mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Order History</h3>
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border border-gray-200">
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-500">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{formatDateTime(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">${parseFloat(order.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.order_items?.length || 0} items</p>
                </div>
                {expandedOrder === order.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {expandedOrder === order.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">ORDER DETAILS</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Order Type:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">{order.order_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">{order.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">ITEMS</p>
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm bg-white p-3 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.quantity}x {item.name}
                          </p>
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {Array.isArray(value) ? value.join(', ') : value}
                                </span>
                              ))}
                            </p>
                          )}
                          {item.special_instructions && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 ml-4">
                          ${(parseFloat(item.final_price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.special_instructions && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">SPECIAL INSTRUCTIONS</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                      {order.special_instructions}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">PRICE BREAKDOWN</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">${parseFloat(order.tax).toFixed(2)}</span>
                    </div>
                    {parseFloat(order.delivery_fee) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-900">${parseFloat(order.delivery_fee).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-red-600">${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {order.estimated_ready_time && ['pending', 'preparing'].includes(order.status) && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">ESTIMATED READY TIME</p>
                    <p className="text-sm text-blue-900">
                      {new Date(order.estimated_ready_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
