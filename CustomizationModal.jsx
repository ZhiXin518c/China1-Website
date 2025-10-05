import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const CustomizationModal = ({ isOpen, onClose, item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    // Call the addToCart function with the correct parameters
    onAddToCart(item, customizations, quantity, specialInstructions);
    onClose();
    
    // Reset form
    setQuantity(1);
    setCustomizations({});
    setSpecialInstructions('');
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">{item.description}</p>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
              placeholder="e.g., no MSG, extra sauce, etc."
            />
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">
              ${(item.price * quantity).toFixed(2)}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;

