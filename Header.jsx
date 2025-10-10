import React from 'react';
import { MapPin, Clock, Phone, ShoppingCart } from 'lucide-react';

const Header = ({ user, onSignInClick, cart, onCartClick, onLogoutClick, onOrderHistoryClick }) => {
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="bg-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">China 1</h1>
            <p className="text-gray-600 mt-1">Authentic Chinese Cuisine</p>
          </div>

          <div className="flex items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>957 Strickland Bridge Rd, Fayetteville</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>910-849-3232</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Open until 9:30 PM</span>
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-medium">Welcome, {user.first_name}!</span>
                <button
                  onClick={onOrderHistoryClick}
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  Order History
                </button>
                <button
                  onClick={onCartClick}
                  className="relative bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogoutClick}
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

