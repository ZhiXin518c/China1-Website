import React from 'react';

const MenuItemCard = ({ item, onCustomizeClick, customizeCount = 0 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-red-600">${item.price}</span>
          
          <button
            onClick={() => onCustomizeClick(item)}
            className="relative bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            + Customize
            {customizeCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {customizeCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-1">⚙️</span>
            <span>Customizable</span>
          </div>
          
          <div className="flex gap-2">
            {item.isPopular && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ⭐ Popular
              </span>
            )}
            {item.isSpicy && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🌶️ Spicy
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;

