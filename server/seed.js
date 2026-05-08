require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const ShippingOption = require('./models/ShippingOption');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      ShippingOption.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@chaiheritage.com',
      password: 'Admin@2024',
      role: 'admin',
      phone: '+254700000000',
      emailVerified: true,
    });
    console.log('✅ Admin created: admin@chaiheritage.com / Admin@2024');

    // Create test customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Customer@2024',
      role: 'customer',
      phone: '+254711111111',
      emailVerified: true,
    });
    console.log('✅ Customer created: john@example.com / Customer@2024');

    // Create categories — use create() so the pre-save slug hook runs
    const categories = await Promise.all([
      { name: 'Black Tea',   description: 'Bold, full-bodied teas with rich malty flavors from the finest estates.' },
      { name: 'Green Tea',   description: 'Light, refreshing teas packed with antioxidants and natural goodness.' },
      { name: 'Herbal Tea',  description: 'Caffeine-free blends from natural herbs, flowers, and spices.' },
      { name: 'Chai Blends', description: 'Traditional spiced tea blends inspired by East African heritage.' },
      { name: 'White Tea',   description: 'Delicate, minimally processed teas with subtle sweet flavors.' },
      { name: 'Gift Sets',   description: 'Curated tea collections perfect for gifting to tea lovers.' },
    ].map(c => Category.create(c)));
    console.log(`✅ ${categories.length} categories created.`);

    const catMap = {};
    categories.forEach((c) => { catMap[c.name] = c._id; });

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Kenya Highland Gold',
        description: 'Our flagship black tea, sourced from the lush highlands of Kenya at over 2000m altitude. This premium CTC tea delivers a bold, brisk cup with a beautiful golden-amber liquor and a smooth, malty finish. Perfect with or without milk.',
        price: 850,
        category: catMap['Black Tea'],
        stock: 150,
        weight: '250g',
        origin: 'Kericho, Kenya',
        brewingInstructions: 'Use freshly boiled water. Steep 3-5 minutes. Add milk and sugar to taste.',
        featured: true,
        images: [],
      },
      {
        name: 'Sunrise Breakfast Blend',
        description: 'A robust morning blend combining the best Kenyan and Assam teas. Full-bodied with a rich, deep color and invigorating flavor to start your day right. The perfect companion to your breakfast.',
        price: 720,
        category: catMap['Black Tea'],
        stock: 200,
        weight: '500g',
        origin: 'Kenya & Assam Blend',
        brewingInstructions: 'Brew with boiling water for 3-4 minutes. Best enjoyed with milk.',
        featured: true,
        images: [],
      },
      {
        name: 'Jade Mountain Green',
        description: 'A delicate green tea with a fresh, grassy aroma and light vegetal notes. Each leaf is carefully hand-processed to preserve the natural antioxidants and deliver a clean, refreshing cup.',
        price: 980,
        category: catMap['Green Tea'],
        stock: 100,
        weight: '200g',
        origin: 'Nandi Hills, Kenya',
        brewingInstructions: 'Water at 75°C. Steep 2-3 minutes. Do not use boiling water.',
        featured: true,
        images: [],
      },
      {
        name: 'Jasmine Pearl Green Tea',
        description: 'Exquisite hand-rolled green tea pearls infused with jasmine flowers. Each pearl slowly unfurls in hot water, releasing a heavenly floral aroma and smooth, sweet taste.',
        price: 1450,
        category: catMap['Green Tea'],
        stock: 60,
        weight: '150g',
        origin: 'Specialty Blend',
        brewingInstructions: 'Water at 80°C. Steep 3-4 minutes. Can be re-steeped 2-3 times.',
        featured: false,
        images: [],
      },
      {
        name: 'African Rooibos Sunset',
        description: 'A naturally caffeine-free herbal infusion with a warm, earthy flavor and hints of vanilla and caramel. Rich in antioxidants and minerals. Enjoyed any time of day.',
        price: 650,
        category: catMap['Herbal Tea'],
        stock: 120,
        weight: '200g',
        origin: 'South Africa',
        brewingInstructions: 'Boiling water. Steep 5-7 minutes for full flavor.',
        featured: false,
        images: [],
      },
      {
        name: 'Chamomile Calm',
        description: 'A soothing blend of whole chamomile flowers that delivers a gentle, honey-sweet cup perfect for unwinding after a long day. Naturally caffeine-free.',
        price: 580,
        category: catMap['Herbal Tea'],
        stock: 90,
        weight: '100g',
        origin: 'Egyptian Chamomile',
        brewingInstructions: 'Boiling water. Steep 5 minutes. Add honey to taste.',
        featured: false,
        images: [],
      },
      {
        name: 'Maasai Chai Spice',
        description: 'An authentic East African chai blend with bold black tea, cardamom, ginger, cinnamon, and cloves. This traditional recipe delivers warmth and complexity in every sip.',
        price: 890,
        category: catMap['Chai Blends'],
        stock: 180,
        weight: '300g',
        origin: 'Kenya',
        brewingInstructions: 'Simmer with milk and water for 5-8 minutes. Strain and add sugar to taste.',
        featured: true,
        images: [],
      },
      {
        name: 'Ginger Turmeric Chai',
        description: 'A wellness-boosting chai blend featuring bold black tea, fresh ginger, turmeric, and black pepper. Anti-inflammatory and delicious — your daily health ritual.',
        price: 950,
        category: catMap['Chai Blends'],
        stock: 100,
        weight: '250g',
        origin: 'Kenya',
        brewingInstructions: 'Simmer with milk for 5 minutes. Add honey for best flavor.',
        featured: false,
        images: [],
      },
      {
        name: 'Silver Needle Supreme',
        description: 'The most prized white tea, made from only the finest unopened buds. Delivers an extraordinarily delicate, sweet cup with notes of melon and honey.',
        price: 2200,
        category: catMap['White Tea'],
        stock: 30,
        weight: '100g',
        origin: 'Specialty Reserve',
        brewingInstructions: 'Water at 70-75°C. Steep 4-5 minutes. Can be re-steeped.',
        featured: true,
        images: [],
      },
      {
        name: 'Heritage Collection Gift Box',
        description: 'A beautifully packaged gift set featuring 6 of our most popular teas — Kenya Highland Gold, Jade Mountain Green, Maasai Chai Spice, Chamomile Calm, Silver Needle Supreme, and Sunrise Breakfast Blend. Each in a 50g tin.',
        price: 3500,
        category: catMap['Gift Sets'],
        stock: 40,
        weight: '300g (6x50g)',
        origin: 'Assorted',
        brewingInstructions: 'See individual tea instructions in box.',
        featured: true,
        images: [],
      },
      {
        name: 'Earl Grey Royale',
        description: 'Classic Earl Grey elevated with premium Kenyan black tea and natural bergamot oil. A sophisticated, citrus-kissed cup with a smooth, refined finish.',
        price: 780,
        category: catMap['Black Tea'],
        stock: 130,
        weight: '200g',
        origin: 'Kenya',
        brewingInstructions: 'Boiling water. Steep 3-4 minutes. Best without milk.',
        featured: false,
        images: [],
      },
      {
        name: 'Peppermint Bliss',
        description: 'Pure peppermint leaves delivering a cool, invigorating cup that aids digestion and refreshes the palate. Naturally caffeine-free and wonderfully aromatic.',
        price: 520,
        category: catMap['Herbal Tea'],
        stock: 110,
        weight: '100g',
        origin: 'Kenya',
        brewingInstructions: 'Boiling water. Steep 5-7 minutes for best results.',
        featured: false,
        images: [],
      },
    ]);
    console.log(`✅ ${products.length} products created.`);

    // Create shipping options
    const shippingOptions = await ShippingOption.insertMany([
      {
        name: 'Standard Shipping',
        description: 'Delivery within 5-7 business days',
        price: 250,
        estimatedDays: '5-7 business days',
        regions: ['Kenya'],
      },
      {
        name: 'Express Shipping',
        description: 'Delivery within 2-3 business days',
        price: 500,
        estimatedDays: '2-3 business days',
        regions: ['Kenya'],
      },
      {
        name: 'Same Day Delivery',
        description: 'Delivery within 24 hours (Nairobi only)',
        price: 800,
        estimatedDays: 'Same day',
        regions: ['Nairobi'],
      },
      {
        name: 'East Africa Shipping',
        description: 'Delivery within 7-14 business days',
        price: 1500,
        estimatedDays: '7-14 business days',
        regions: ['Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'South Sudan'],
      },
      {
        name: 'International Shipping',
        description: 'Worldwide delivery within 14-21 business days',
        price: 3500,
        estimatedDays: '14-21 business days',
        regions: ['International'],
      },
    ]);
    console.log(`✅ ${shippingOptions.length} shipping options created.`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
