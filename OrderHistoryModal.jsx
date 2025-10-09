import React, { useState, useEffect } from 'react';
import { X, Clock, Package } from 'lucide-react';
import { supabase } from './supabaseClient';

const OrderHistoryModal = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Order History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Your order history will appear here once you place your first order
              </p>
            </div>
          ) : selectedOrder ? (
            <div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
              >
                Back to all orders
              </button>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{selectedOrder.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Order Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order Type:</span>
                      <span className="font-medium">{selectedOrder.order_type === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{selectedOrder.payment_method === 'cash' ? 'Cash' : 'Card'}</span>
                    </div>
                    {selectedOrder.delivery_address && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Address:</span>
                        <span className="font-medium text-right">{selectedOrder.delivery_address}</span>
                      </div>
                    )}
                    {selectedOrder.special_instructions && (
                      <div className="text-sm">
                        <span className="text-gray-600">Special Instructions:</span>
                        <p className="font-medium mt-1">{selectedOrder.special_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            {item.specialInstructions && (
                              <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                            )}
                          </div>
                          <span className="font-medium">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>${Number(selectedOrder.tax).toFixed(2)}</span>
                  </div>
                  {selectedOrder.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tip:</span>
                      <span>${Number(selectedOrder.tip).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span className="text-red-600">${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} - {order.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
                    </p>
                    <p className="font-semibold text-red-600">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
