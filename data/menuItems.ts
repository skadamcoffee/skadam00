export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  popular?: boolean;
  ingredients?: string[];
  inventory?: {
    quantity: number;
    alertThreshold?: number;
    alertEnabled: boolean;
    unit: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
}

export const menuItems: MenuItem[] = [
  // Coffee
  {
    id: 'espresso',
    name: 'Classic Espresso',
    description: 'Rich, bold espresso shot made from our signature blend of premium coffee beans.',
    price: '8.50 TND',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop',
    category: 'coffee',
    popular: true,
    ingredients: ['Espresso beans', 'Water'],
    inventory: {
      quantity: 50,
      alertThreshold: 10,
      alertEnabled: true,
      unit: 'cups'
    }
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Perfect balance of espresso, steamed milk, and velvety foam topped with cocoa powder.',
    price: '11.50 TND',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    category: 'coffee',
    popular: true,
    ingredients: ['Espresso', 'Steamed milk', 'Milk foam', 'Cocoa powder'],
    inventory: {
      quantity: 35,
      alertThreshold: 15,
      alertEnabled: true,
      unit: 'cups'
    }
  },
  {
    id: 'latte',
    name: 'Caffe Latte',
    description: 'Smooth espresso with steamed milk and a light layer of foam, perfect for any time of day.',
    price: '12.75 TND',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    category: 'coffee',
    ingredients: ['Espresso', 'Steamed milk', 'Milk foam'],
    inventory: {
      quantity: 8,
      alertThreshold: 10,
      alertEnabled: true,
      unit: 'cups'
    }
  },
  {
    id: 'americano',
    name: 'Americano',
    description: 'Bold espresso shots diluted with hot water for a clean, strong coffee experience.',
    price: '9.00 TND',
    image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop',
    category: 'coffee',
    ingredients: ['Espresso', 'Hot water'],
    inventory: {
      quantity: 25,
      alertThreshold: 5,
      alertEnabled: false,
      unit: 'cups'
    }
  },
  {
    id: 'mocha',
    name: 'Chocolate Mocha',
    description: 'Decadent blend of espresso, chocolate syrup, and steamed milk topped with whipped cream.',
    price: '14.00 TND',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'coffee',
    ingredients: ['Espresso', 'Chocolate syrup', 'Steamed milk', 'Whipped cream'],
    inventory: {
      quantity: 20,
      alertThreshold: 8,
      alertEnabled: true,
      unit: 'cups'
    }
  },

  // Tea & Beverages
  {
    id: 'earl-grey',
    name: 'Earl Grey Tea',
    description: 'Classic black tea blend with bergamot oil, served with lemon and honey on the side.',
    price: '8.00 TND',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    category: 'tea',
    ingredients: ['Earl Grey tea', 'Bergamot oil', 'Lemon', 'Honey']
  },
  {
    id: 'green-tea',
    name: 'Jasmine Green Tea',
    description: 'Delicate green tea infused with jasmine flowers for a fragrant and refreshing experience.',
    price: '8.50 TND',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    category: 'tea',
    popular: true,
    ingredients: ['Green tea', 'Jasmine flowers']
  },
  {
    id: 'chai-latte',
    name: 'Spiced Chai Latte',
    description: 'Aromatic blend of black tea, warm spices, and steamed milk with a touch of sweetness.',
    price: '11.00 TND',
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop',
    category: 'tea',
    ingredients: ['Black tea', 'Cinnamon', 'Cardamom', 'Ginger', 'Steamed milk']
  },
  {
    id: 'iced-tea',
    name: 'Fresh Iced Tea',
    description: 'Refreshing cold-brewed tea served over ice with fresh mint and lemon slices.',
    price: '9.00 TND',
    image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&h=300&fit=crop',
    category: 'tea',
    ingredients: ['Cold-brewed tea', 'Ice', 'Fresh mint', 'Lemon']
  },

  // Pastries
  {
    id: 'croissant',
    name: 'Butter Croissant',
    description: 'Flaky, buttery croissant baked fresh daily with layers of golden pastry.',
    price: '8.00 TND',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    category: 'pastries',
    popular: true,
    ingredients: ['Flour', 'Butter', 'Yeast', 'Salt']
  },
  {
    id: 'muffin',
    name: 'Blueberry Muffin',
    description: 'Moist and fluffy muffin packed with fresh blueberries and a hint of vanilla.',
    price: '10.50 TND',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop',
    category: 'pastries',
    ingredients: ['Flour', 'Fresh blueberries', 'Vanilla', 'Sugar', 'Eggs']
  },
  {
    id: 'danish',
    name: 'Almond Danish',
    description: 'Sweet pastry filled with almond cream and topped with sliced almonds and powdered sugar.',
    price: '11.50 TND',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    category: 'pastries',
    ingredients: ['Pastry dough', 'Almond cream', 'Sliced almonds', 'Powdered sugar']
  },
  {
    id: 'scone',
    name: 'English Scone',
    description: 'Traditional scone served with clotted cream and strawberry jam.',
    price: '9.00 TND',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&h=300&fit=crop',
    category: 'pastries',
    ingredients: ['Flour', 'Butter', 'Cream', 'Clotted cream', 'Strawberry jam']
  },

  // Food
  {
    id: 'club-sandwich',
    name: 'Club Sandwich',
    description: 'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo on toasted bread.',
    price: '20.50 TND',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
    category: 'food',
    popular: true,
    ingredients: ['Turkey', 'Bacon', 'Lettuce', 'Tomato', 'Mayo', 'Toasted bread']
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    description: 'Smashed avocado on sourdough bread topped with cherry tomatoes, feta, and olive oil.',
    price: '17.50 TND',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
    category: 'food',
    ingredients: ['Avocado', 'Sourdough bread', 'Cherry tomatoes', 'Feta cheese', 'Olive oil']
  },
  {
    id: 'bagel',
    name: 'Everything Bagel',
    description: 'Fresh bagel with cream cheese, smoked salmon, capers, and red onion.',
    price: '23.50 TND',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    category: 'food',
    ingredients: ['Everything bagel', 'Cream cheese', 'Smoked salmon', 'Capers', 'Red onion']
  },
  {
    id: 'soup',
    name: 'Tomato Basil Soup',
    description: 'Creamy tomato soup with fresh basil, served with a grilled cheese sandwich.',
    price: '15.75 TND',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    category: 'food',
    ingredients: ['Tomatoes', 'Fresh basil', 'Cream', 'Grilled cheese sandwich']
  }
];

export const categories: Category[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Artisan coffee blends',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    color: '#8B4513'
  },
  {
    id: 'tea',
    name: 'Tea & Beverages',
    description: 'Premium teas & drinks',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    color: '#228B22'
  },
  {
    id: 'pastries',
    name: 'Pastries',
    description: 'Fresh baked goods',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    color: '#DAA520'
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Sandwiches & meals',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
    color: '#CD853F'
  }
];