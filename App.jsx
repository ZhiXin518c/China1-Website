import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, X, Minus, Plus } from 'lucide-react';
import Header from './Header';
import MenuItemCard from './MenuItemCard';
import CustomizationModal from './CustomizationModal';
import AuthModal from './AuthModal';
import CheckoutModal from './CheckoutModal';
import {
  restaurantInfo,
  menuCategories,
  menuItems,
  getMenuItemsByCategory,
  calculateItemPrice
} from './menuData';
import './App.css';

function App() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('lunch-specials');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleOrderPlaced = (order) => {
    console.log("Order placed successfully:", order);
    setCart([]); // Clear cart after order is placed
    setShowCart(false);
    alert("Order placed successfully! Your order ID is: " + order.id);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('china1_user');
    const savedToken = localStorage.getItem('china1_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Authentication functions
  const handleLogin = async (phone) => {
    try {
      const response = await fetch('https://8xhpiqcv5wkp.manus.space/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.customer);
        localStorage.setItem('china1_user', JSON.stringify(data.customer));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch('https://8xhpiqcv5wkp.manus.space/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        // Auto-login after registration
        const loginResult = await handleLogin(userData.phone);
        return loginResult;
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('china1_user');
    localStorage.removeItem('china1_token');
  };

  // Cart functions
  const addToCart = (item, customizations = {}, quantity = 1, specialInstructions = '') => {
    const basePrice = calculateItemPrice(item, customizations);
    const finalPrice = basePrice * quantity;
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: basePrice,
      finalPrice: finalPrice,
      quantity: quantity,
      customizations: customizations,
      specialInstructions: specialInstructions,
      image: item.image
    };

    console.log('Adding cart item:', cartItem);
    setCart(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Menu functions
  const handleCustomizeItem = (item) => {
    setSelectedItem(item);
    setShowCustomizationModal(true);
  };

  const getFilteredItems = () => {
    const categoryItems = getMenuItemsByCategory(selectedCategory);
    
    if (!searchQuery) return categoryItems;
    
    return categoryItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        user={user}
        onSignInClick={() => setShowAuthModal(true)}
        cart={cart}
        onCartClick={() => setShowCart(true)}
      />

      {/* Hero Section */}
      <section className="bg-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Fresh ingredients, traditional recipes,<br />exceptional taste
          </h1>
          <p className="text-xl mb-10 text-red-100">
            Order online for pickup or delivery
          </p>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Category Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {menuCategories.map((category, index) => {
            const colors = [
              'bg-orange-500 text-white', // Lunch Specials
              'bg-purple-500 text-white', // Combination Platters  
              'bg-teal-500 text-white',   // Special Pick 2 Meat
              'bg-pink-500 text-white',   // American Dishes
              'bg-indigo-500 text-white', // Appetizers
              'bg-orange-600 text-white'  // Soup
            ];
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id 
                    ? colors[index] || 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredItems().map((item, index) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onCustomizeClick={handleCustomizeItem}
              customizeCount={index + 1} // Add numbered badges to customize buttons
            />
          ))}
        </div>

        {/* No Results */}
        {getFilteredItems().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery 
                ? `No items found for "${searchQuery}"`
                : 'No items available in this category'
              }
            </p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {getCartItemCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-3 z-50"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">
            {getCartItemCount()} items - ${getCartTotal().toFixed(2)}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCart(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.finalPrice.toFixed(2)} each</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-500 mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-red-600">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => setShowCheckoutModal(true)} 
                      className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <CustomizationModal
        item={selectedItem}
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onAddToCart={addToCart}
      />

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        getCartTotal={getCartTotal}
        user={user}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}

export default App;
