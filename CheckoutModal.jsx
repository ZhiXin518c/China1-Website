import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

const CheckoutModal = ({ isOpen, onClose, cart, getCartTotal, user, onOrderPlaced }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    orderType: 'pickup',
    paymentMethod: 'cash',
    specialInstructions: ''
  });

  if (!isOpen) return null;

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice || item.basePrice || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.0825; // 8.25% tax
  };

  const calculateDeliveryFee = () => {
    return formData.orderType === 'delivery' ? 2.99 : 0;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateDeliveryFee();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setOrderError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please sign in to place an order');
      }

      const orderData = {
        customer_id: user.id,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_phone: formData.phone,
        customer_email: formData.email,
        order_type: formData.orderType,
        payment_method: formData.paymentMethod,
        special_instructions: formData.specialInstructions || '',
        subtotal: Number(calculateSubtotal().toFixed(2)),
        tax: Number(calculateTax().toFixed(2)),
        delivery_fee: Number(calculateDeliveryFee().toFixed(2)),
        total: Number(calculateGrandTotal().toFixed(2)),
        status: 'pending',
        estimated_ready_time: new Date(Date.now() + 30 * 60000).toISOString(),
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: String(item.menuItemId || 'unknown'),
        name: String(item.name || 'Unknown Item'),
        quantity: Number(item.quantity || 1),
        base_price: Number(item.basePrice || 0),
        final_price: Number((item.finalPrice || item.basePrice || 0)),
        customizations: item.customizations || {},
        special_instructions: String(item.specialInstructions || '')
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      if (onOrderPlaced) {
        onOrderPlaced(order);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setOrderSuccess(false);
    setOrderError('');
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      orderType: 'pickup',
      paymentMethod: 'cash',
      specialInstructions: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation shortly.
          </p>
          <button
            onClick={handleClose}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Checkout ({currentStep}/3)</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Message */}
        {orderError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{orderError}</p>
          </div>
        )}

        {/* Step 1: Customer Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(910) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.email}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Details */}
        {currentStep === 2 && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Order Details</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">How would you like to get your order?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderType"
                    value="pickup"
                    checked={formData.orderType === 'pickup'}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="mr-2"
                  />
                  <span>Pickup (20-30 min)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={formData.orderType === 'delivery'}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="mr-2"
                  />
                  <span>Delivery (+$2.99, 45-60 min)</span>
                </label>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., no MSG, extra sauce, etc."
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.25%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                {formData.orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>${calculateDeliveryFee().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t pt-1">
                  <span>Total:</span>
                  <span>${calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-green-600 mr-2">💵</span>
                  <span>Cash on Pickup/Delivery</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-blue-600 mr-2">💳</span>
                  <span>Credit/Debit Card (Online)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
