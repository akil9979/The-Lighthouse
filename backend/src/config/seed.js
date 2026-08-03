const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const menuItems = [
  // ── Breakfast ──
  {
    name: 'Idli Sambar',
    description: 'Soft steamed rice cakes served with a tangy lentil soup and fresh coconut chutney.',
    price: 180,
    category: 'breakfast',
    isVeg: true,
    allergens: ['gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Idli_Sambar.jpg',
    preparationTime: 15,
    sortOrder: 1,
    calories: 220,
    workoutTags: ['Light & Fresh'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Extra Sambar', price: 25 },
    { name: 'Extra Coconut Chutney', price: 20 },
    { name: 'Ghee', price: 30 }
  ],
  variants: [
    { name: '2 Pieces', priceModifier: 0 },
    { name: '4 Pieces', priceModifier: 70 }
  ]
}
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy golden crepe filled with spiced potato filling, served with sambar and chutney.',
    price: 220,
    category: 'breakfast',
    isVeg: true,
    allergens: ['gluten'],
    tags: ['popular', 'chef-special'],
    isAvailable: true,
    image: '/images/MasalaDosa.jpg',
    preparationTime: 20,
    sortOrder: 2,
    calories: 310,
    workoutTags: ['Light & Fresh'],
    badge: 'Bestseller',
    // ---- customizations added ----
    customizations: {
      allowMultipleToppings: true,
      toppings: [
        { name: 'Extra Chutney', price: 20 },
        { name: 'Extra Sambar', price: 25 },
        { name: 'Ghee Roast', price: 30 }
      ],
      variants: [
        { name: 'Regular', priceModifier: 0 },
        { name: 'Mysore Masala', priceModifier: 40 },
        { name: 'Cheese Dosa', priceModifier: 60 }
      ]
    }
  },
  {
    name: 'Chicken Keema Dosa',
    description: 'Crispy dosa stuffed with spiced minced chicken, onions and fresh herbs.',
    price: 320,
    category: 'breakfast',
    isVeg: false,
    allergens: ['gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Chicken_Keema_Dosa.jpg',
    preparationTime: 25,
    sortOrder: 3,
    calories: 430,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Extra Chicken Keema', price: 80 },
    { name: 'Cheese', price: 40 },
    { name: 'Extra Chutney', price: 20 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Double Keema', priceModifier: 100 }
  ]
}
  },
  // ── Lunch ──
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in a rich, creamy tomato-based gravy. A North Indian classic.',
    price: 380,
    category: 'lunch',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular', 'chef-special'],
    isAvailable: true,
    image: '/images/Paneer_Butter_Masala.jpg',
    preparationTime: 25,
    sortOrder: 1,
    calories: 520,
    workoutTags: ['Indulgent'],
    badge: "Chef's Pick",
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Butter Naan', price: 45 },
    { name: 'Jeera Rice', price: 70 },
    { name: 'Extra Paneer', price: 80 }
  ],
  variants: [
    { name: 'Half', priceModifier: -100 },
    { name: 'Full', priceModifier: 0 }
  ]
}
  },
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a velvety, mildly spiced tomato and cream sauce.',
    price: 420,
    category: 'lunch',
    isVeg: false,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Butter_Chicken.jpg',
    preparationTime: 30,
    sortOrder: 2,
    calories: 590,
    workoutTags: ['Post-Workout Fuel'],
    badge: 'Bestseller',
    // ---- customizations added ----
    customizations: {
      allowMultipleToppings: true,
      toppings: [
        { name: 'Butter Naan', price: 45 },
        { name: 'Extra Gravy', price: 60 },
        { name: 'Garlic Naan', price: 55 }
      ],
      variants: [
        { name: 'Half', priceModifier: -120 },
        { name: 'Full', priceModifier: 0 }
      ]
    }
  },
  {
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice layered with slow-cooked chicken in dum style. A royal delicacy.',
    price: 480,
    category: 'lunch',
    isVeg: false,
    allergens: ['gluten'],
    tags: ['chef-special', 'popular'],
    isAvailable: true,
    image: '/images/Hyderabadi_Chicken_Biryani.jpg',
    preparationTime: 45,
    sortOrder: 3,
    calories: 640,
    workoutTags: ['Post-Workout Fuel'],
    badge: "Chef's Pick",
    // ---- customizations added ----
    customizations: {
      allowMultipleToppings: true,
      toppings: [
        { name: 'Boiled Egg', price: 25 },
        { name: 'Extra Raita', price: 20 },
        { name: 'Mirchi ka Salan', price: 35 }
      ],
      variants: [
        { name: 'Half', priceModifier: -150 },
        { name: 'Full', priceModifier: 0 },
        { name: 'Family Pack (serves 3)', priceModifier: 350 }
      ]
    }
  },
  // ── Dinner ──
  {
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese in a smoky, spiced masala sauce. Perfect for a fine dining evening.',
    price: 420,
    category: 'dinner',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['chef-special'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 30,
    sortOrder: 1,
    calories: 480,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Butter Naan', price: 45 },
    { name: 'Garlic Naan', price: 55 },
    { name: 'Extra Paneer', price: 80 }
  ],
  variants: [
    { name: 'Half', priceModifier: -120 },
    { name: 'Full', priceModifier: 0 }
  ]
}
  },
  {
    name: 'Coastal Fish Curry',
    description: 'Fresh catch cooked in a coconut milk base with tangy kokum and coastal spices.',
    price: 540,
    category: 'dinner',
    isVeg: false,
    allergens: ['fish'],
    tags: ['seasonal', 'chef-special'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 35,
    sortOrder: 2,
    calories: 410,
    workoutTags: ['Post-Workout Fuel'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Steamed Rice', price: 60 },
    { name: 'Extra Fish Piece', price: 140 },
    { name: 'Appam', price: 45 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 150 }
  ]
}
  },
  {
    name: 'Dal Makhani',
    description: 'Slow-simmered black lentils in a rich buttery tomato sauce, finished with cream.',
    price: 340,
    category: 'dinner',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/dinner.jpg',
    preparationTime: 40,
    sortOrder: 3,
    calories: 380,
    workoutTags: ['Indulgent'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Butter Naan', price: 45 },
    { name: 'Jeera Rice', price: 70 },
    { name: 'Extra Butter', price: 25 }
  ],
  variants: [
    { name: 'Half', priceModifier: -90 },
    { name: 'Full', priceModifier: 0 }
  ]
}
  },
  // ── Desserts ──
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup. A timeless classic.',
    price: 160,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy', 'gluten'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Gulab_Jamun.jpg',
    preparationTime: 10,
    sortOrder: 1,
    calories: 300,
    workoutTags: ['Indulgent'],
    badge: 'Bestseller',
    // ---- customizations added ----
    customizations: {
      allowMultipleToppings: true,
      toppings: [
        { name: 'Vanilla Ice Cream Scoop', price: 50 },
        { name: 'Extra Syrup', price: 15 },
        { name: 'Chopped Pistachio', price: 25 }
      ],
      variants: [
        { name: '2 pieces', priceModifier: 0 },
        { name: '4 pieces', priceModifier: 100 }
      ]
    }
  },
  {
    name: 'Kulfi',
    description: 'Traditional Indian ice cream in pistachio and rose flavour, served on a stick.',
    price: 180,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy', 'nuts'],
    tags: ['popular', 'seasonal'],
    isAvailable: true,
    image: '/images/Kulfi.jpg',
    preparationTime: 5,
    sortOrder: 2,
    calories: 270,
    workoutTags: ['Indulgent'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Rabdi', price: 40 },
    { name: 'Chopped Pistachio', price: 25 },
    { name: 'Rose Syrup', price: 20 }
  ],
  variants: [
    { name: 'Single Stick', priceModifier: 0 },
    { name: 'Double Stick', priceModifier: 150 }
  ]
}
  },
  {
    name: 'Rasmalai',
    description: 'Delicate cottage cheese discs floating in saffron-infused chilled milk.',
    price: 200,
    category: 'desserts',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['chef-special'],
    isAvailable: true,
    image: '/images/Rasmalai.jpg',
    preparationTime: 10,
    sortOrder: 3,
    calories: 260,
    workoutTags: ['Indulgent'],
    badge: null,
    customizations: {
  allowMultipleToppings: true,
  toppings: [
    { name: 'Extra Rabdi', price: 40 },
    { name: 'Saffron', price: 30 },
    { name: 'Pistachio', price: 25 }
  ],
  variants: [
    { name: '2 Pieces', priceModifier: 0 },
    { name: '4 Pieces', priceModifier: 120 }
  ]
}
  },
  // ── Drinks ──
  {
    name: 'Mango Lassi',
    description: 'Thick yogurt blended with fresh Alphonso mango pulp and a hint of cardamom.',
    price: 150,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular', 'seasonal'],
    isAvailable: true,
    image: '/images/Mango_Lassi.jpg',
    preparationTime: 5,
    sortOrder: 1,
    calories: 210,
    workoutTags: ['Pre-Workout Energy'],
    badge: null,
    customizations: {
  allowMultipleToppings: false,
  toppings: [
    { name: 'Extra Mango', price: 30 },
    { name: 'Vanilla Ice Cream', price: 40 },
    { name: 'Dry Fruits', price: 35 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 50 }
  ]
}
  },
  {
    name: 'Masala Chai',
    description: 'Spiced Indian tea brewed with ginger, cardamom, cinnamon and full cream milk.',
    price: 80,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Masala_Chai.jpg',
    preparationTime: 5,
    sortOrder: 2,
    calories: 90,
    workoutTags: ['Light & Fresh'],
    badge: null,
    customizations: {
  allowMultipleToppings: false,
  toppings: [
    { name: 'Extra Ginger', price: 10 },
    { name: 'Extra Cardamom', price: 10 },
    { name: 'Less Sugar', price: 0 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 30 }
  ]
}
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Chilled sparkling water with freshly squeezed lime, mint and your choice of sweet or salted.',
    price: 100,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/Fresh_Lime_Soda.jpg',
    preparationTime: 3,
    sortOrder: 3,
    calories: 60,
    workoutTags: ['Light & Fresh'],
    badge: null,
    // ---- customizations added ----
    customizations: {
      allowMultipleToppings: false,
      toppings: [
        { name: 'Sweet', price: 0 },
        { name: 'Salted', price: 0 },
        { name: 'Mint-Lime Fusion', price: 10 }
      ],
      variants: []
    }
  },
  {
    name: 'Virgin Mojito',
    description: 'Muddled fresh mint with lime juice, sugar and club soda. Refreshingly cool.',
    price: 180,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: [],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 5,
    sortOrder: 4,
    calories: 70,
    workoutTags: ['Light & Fresh'],
    badge: null,
    customizations: {
  allowMultipleToppings: false,
  toppings: [
    { name: 'Extra Mint', price: 10 },
    { name: 'Extra Lime', price: 10 },
    { name: 'Crushed Ice', price: 0 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 40 }
  ]
}
  },
  {
    name: 'Filter Coffee',
    description: 'South Indian filter coffee — decoction brewed from dark roast, served with frothy milk.',
    price: 90,
    category: 'drinks',
    isVeg: true,
    allergens: ['dairy'],
    tags: ['popular'],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 5,
    sortOrder: 5,
    calories: 85,
    workoutTags: ['Light & Fresh'],
    badge: null,
    customizations: {
  allowMultipleToppings: false,
  toppings: [
    { name: 'Extra Decoction', price: 20 },
    { name: 'Extra Foam', price: 10 },
    { name: 'Less Sugar', price: 0 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Strong', priceModifier: 20 },
    { name: 'Large', priceModifier: 30 }
  ]
}
  },
  {
    name: 'Kokum Sharbat',
    description: 'Chilled kokum concentrate with cumin and rock salt — a Konkan coastal digestive.',
    price: 120,
    category: 'drinks',
    isVeg: true,
    allergens: [],
    tags: ['seasonal', 'new'],
    isAvailable: true,
    image: '/images/drinks.jpg',
    preparationTime: 3,
    sortOrder: 6,
    calories: 50,
    workoutTags: ['Light & Fresh'],
    badge: null,
    customizations: {
  allowMultipleToppings: false,
  toppings: [
    { name: 'Mint Leaves', price: 10 },
    { name: 'Soda', price: 15 },
    { name: 'Extra Ice', price: 0 }
  ],
  variants: [
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 30 }
  ]
}
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lighthouse');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await MenuItem.deleteMany();
    await Review.deleteMany();

    // Seed users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@thelighthouse.com',
        password: 'Admin@123',
        phone: '9876543210',
        role: 'admin',
        dietaryPreference: 'all'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        dietaryPreference: 'veg'
      }
    ]);
    console.log('👤 Users seeded:', users.length);

    // Seed tables
    const tables = await Table.create([
      { tableNumber: 1, capacity: 2, section: 'window', description: 'Romantic window seat' },
      { tableNumber: 2, capacity: 2, section: 'main', description: 'Cozy corner table' },
      { tableNumber: 3, capacity: 4, section: 'main', description: 'Family table' },
      { tableNumber: 4, capacity: 4, section: 'window', description: 'Bright window table' },
      { tableNumber: 5, capacity: 6, section: 'private', description: 'Private dining room' },
      { tableNumber: 6, capacity: 6, section: 'main', description: 'Large group table' },
      { tableNumber: 7, capacity: 8, section: 'private', description: 'VIP private room' },
      { tableNumber: 8, capacity: 2, section: 'outdoor', description: 'Outdoor patio table' },
      { tableNumber: 9, capacity: 4, section: 'outdoor', description: 'Outdoor family table' }
    ]);
    console.log('🪑 Tables seeded:', tables.length);

    // Seed menu items
    // Note: rating, reviewCount, and orderCount are NOT set here —
    // they use the schema defaults (0) and populate dynamically as
    // real reviews/orders come in through the app.
    const menu = await MenuItem.create(menuItems);
    console.log('🍽️  Menu items seeded:', menu.length);

    // Seed sample reviews (restaurant-level, not tied to a specific dish —
    // see PR notes on Review model scope)
    const reviews = await Review.create([
      {
        user: users[1]._id,
        rating: 5,
        comment: 'The Hyderabadi Biryani is absolutely divine. Best fine dining experience in the city!',
      },
      {
        user: users[1]._id,
        rating: 5,
        comment: 'Rasmalai was heavenly. The ambience matches the quality of food perfectly.',
      }
    ]);
    console.log('⭐ Reviews seeded:', reviews.length);

    console.log('\n✅ Seed data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();