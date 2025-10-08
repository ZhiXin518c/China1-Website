import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, Truck, AlertCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

const OrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();

      const channel = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, (payload) => {
          setOrder(payload.new);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  const loadOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!error && data) {
      setOrder(data);
    }
    setLoading(false);
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Received', icon: Package },
      { key: 'preparing', label: 'Preparing', icon: Clock },
      { key: 'ready', label: 'Ready', icon: CheckCircle },
      { key: 'completed', label: order?.order_type === 'delivery' ? 'Delivered' : 'Picked Up', icon: Truck },
    ];

    const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statusOrder.indexOf(order?.status);

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900 mb-2">Order Cancelled</p>
        <p className="text-gray-600">This order has been cancelled</p>
      </div>
    );
  }

  const steps = getStatusSteps();
  const estimatedTime = order.estimated_ready_time
    ? new Date(order.estimated_ready_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {estimatedTime && !['completed', 'cancelled'].includes(order.status) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800 mb-1">Estimated Ready Time</p>
          <p className="text-2xl font-bold text-blue-900">{estimatedTime}</p>
        </div>
      )}

      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative pb-8 last:pb-0">
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 bottom-0 w-0.5 ${
                    step.isActive ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="relative flex items-start gap-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    step.isActive
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${step.isCurrent ? 'ring-4 ring-green-100 animate-pulse' : ''}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 pt-2">
                  <p
                    className={`font-semibold ${
                      step.isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.isCurrent && (
                    <p className="text-sm text-green-600 mt-1">In Progress</p>
                  )}
                  {step.isActive && !step.isCurrent && (
                    <p className="text-sm text-gray-500 mt-1">Completed</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {order.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-semibold text-green-900">Order Complete!</p>
          <p className="text-sm text-green-700 mt-1">Thank you for your order</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
