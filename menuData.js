// Restaurant information
export const restaurantInfo = {
  name: 'China 1',
  subtitle: 'Authentic Chinese Cuisine',
  phone: '910-849-3232',
  address: '1831 Skibo Rd, Fayetteville',
  hours: {
    Monday: 'Closed',
    Tuesday: '11:00 AM - 9:30 PM',
    Wednesday: '11:00 AM - 9:30 PM',
    Thursday: '11:00 AM - 9:30 PM',
    Friday: '11:00 AM - 10:00 PM',
    Saturday: '11:00 AM - 10:00 PM',
    Sunday: '12:00 PM - 9:30 PM'
  },
  features: ['Dine-in', 'Takeout', 'Delivery', 'Catering'],
  taxRate: 0.0825,
  deliveryFee: 2.99,
  minimumDelivery: 15.00
};

// Menu categories
export const menuCategories = [
  {
    id: 'lunch-specials',
    name: 'Lunch Specials',
    description: 'Served 11:00am-3:00pm, Tue-Sat',
    icon: '🍱'
  },
  {
    id: 'combination-platters',
    name: 'Combination Platters',
    description: 'Complete meals with rice & egg roll',
    icon: '🍽️'
  },
  {
    id: 'special-pick-2-meat',
    name: 'Special Pick 2 Meat',
    description: 'Choose any 2 meat dishes',
    icon: '🍖'
  },
  {
    id: 'american-dishes',
    name: 'American Dishes',
    description: 'Wings and fried favorites',
    icon: '🍗'
  },
  {
    id: 'appetizers',
    name: 'Appetizers',
    description: 'Perfect starters for your meal',
    icon: '🥟'
  },
  {
    id: 'soup',
    name: 'Soup',
    description: 'Traditional Chinese soups',
    icon: '🍲'
  }
];

// Menu items
export const menuItems = {
  'lunch-specials': [
    {
      id: 'l1-pork-chow-mein',
      name: 'L1 Pork Chow Mein',
      price: 8.95,
      description: 'Served with fried rice or white rice & pork egg roll',
      category: 'lunch-specials',
      isPopular: false,
      isSpicy: false
    },
    {
      id: 'l1-chicken-chow-mein',
      name: 'L1 Chicken Chow Mein',
      price: 8.95,
      description: 'Served with fried rice or white rice & pork egg roll',
      category: 'lunch-specials',
      isPopular: true,
      isSpicy: false
    },
    {
      id: 'l1-shrimp-chow-mein',
      name: 'L1 Shrimp Chow Mein',
      price: 8.95,
      description: 'Served with fried rice or white rice & pork egg roll',
      category: 'lunch-specials',
      isPopular: true,
      isSpicy: false
    },
    {
      id: 'l2-chicken-broccoli',
      name: 'L2 Chicken w. Broccoli',
      price: 8.95,
      description: 'Tender chicken with fresh broccoli in brown sauce',
      category: 'lunch-specials',
      isPopular: false,
      isSpicy: false
    },
    {
      id: 'l19-general-tso',
      name: 'L19 General Tso\'s Chicken',
      price: 8.95,
      description: 'Crispy chicken in sweet and spicy sauce',
      category: 'lunch-specials',
      isPopular: false,
      isSpicy: true
    },
    {
      id: 'l20-sesame-chicken',
      name: 'L20 Sesame Chicken',
      price: 8.95,
      description: 'Crispy chicken with sesame seeds in sweet sauce',
      category: 'lunch-specials',
      isPopular: false,
      isSpicy: false
    }
  ],
  'combination-platters': [
    {
      id: 'c1-sweet-sour-pork',
      name: 'C1 Sweet & Sour Pork',
      price: 12.95,
      description: 'Served with fried rice and egg roll',
      category: 'combination-platters',
      isPopular: true,
      isSpicy: false
    },
    {
      id: 'c2-sweet-sour-chicken',
      name: 'C2 Sweet & Sour Chicken',
      price: 12.95,
      description: 'Served with fried rice and egg roll',
      category: 'combination-platters',
      isPopular: false,
      isSpicy: false
    },
    {
      id: 'c3-chicken-broccoli',
      name: 'C3 Chicken with Broccoli',
      price: 12.95,
      description: 'Served with fried rice and egg roll',
      category: 'combination-platters',
      isPopular: false,
      isSpicy: false
    }
  ],
  'special-pick-2-meat': [
    {
      id: 'pick2-combo',
      name: 'Pick 2 Meat Combination',
      price: 15.95,
      description: 'Choose any 2 meat dishes with fried rice',
      category: 'special-pick-2-meat',
      isPopular: true,
      isSpicy: false
    }
  ],
  'american-dishes': [
    {
      id: 'buffalo-wings',
      name: 'Buffalo Wings (8 pcs)',
      price: 9.95,
      description: 'Crispy wings with buffalo sauce',
      category: 'american-dishes',
      isPopular: true,
      isSpicy: true
    },
    {
      id: 'fried-chicken-wings',
      name: 'Fried Chicken Wings (8 pcs)',
      price: 8.95,
      description: 'Crispy fried chicken wings',
      category: 'american-dishes',
      isPopular: false,
      isSpicy: false
    },
    {
      id: 'chicken-tenders',
      name: 'Chicken Tenders (4 pcs)',
      price: 7.95,
      description: 'Crispy chicken tenders with dipping sauce',
      category: 'american-dishes',
      isPopular: false,
      isSpicy: false
    }
  ],
  'appetizers': [
    {
      id: 'spring-rolls',
      name: 'Spring Rolls (2 pcs)',
      price: 3.95,
      description: 'Crispy vegetable spring rolls',
      category: 'appetizers',
      isPopular: false,
      isSpicy: false
    },
    {
      id: 'crab-rangoon',
      name: 'Crab Rangoon (6 pcs)',
      price: 5.95,
      description: 'Crispy wontons filled with crab and cream cheese',
      category: 'appetizers',
      isPopular: true,
      isSpicy: false
    },
    {
      id: 'pot-stickers',
      name: 'Pot Stickers (6 pcs)',
      price: 6.95,
      description: 'Pan-fried pork dumplings',
      category: 'appetizers',
      isPopular: true,
      isSpicy: false
    }
  ],
  'soup': [
    {
      id: 'wonton-soup',
      name: 'Wonton Soup',
      price: 6.95,
      description: 'Traditional pork wontons in clear broth',
      category: 'soup',
      isPopular: true,
      isSpicy: false
    },
    {
      id: 'hot-sour-soup',
      name: 'Hot & Sour Soup',
      price: 6.95,
      description: 'Spicy and tangy traditional soup',
      category: 'soup',
      isPopular: false,
      isSpicy: true
    },
    {
      id: 'egg-drop-soup',
      name: 'Egg Drop Soup',
      price: 5.95,
      description: 'Classic Chinese egg drop soup',
      category: 'soup',
      isPopular: false,
      isSpicy: false
    }
  ]
};

// Helper functions
export const getMenuItemsByCategory = (categoryId) => {
  return menuItems[categoryId] || [];
};

export const calculateItemPrice = (item, customizations = {}) => {
  let price = item.price;
  // Add customization price adjustments here if needed
  return price;
};

export const getAllMenuItems = () => {
  return Object.values(menuItems).flat();
};

export const searchMenuItems = (query) => {
  const allItems = getAllMenuItems();
  return allItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );
};

