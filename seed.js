import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function getRandomBoolean() {
  return Math.random() < 0.5;
}

const products = [
  {
    name: "Nike Air Max",
    price: 120.00,
    img: "images/product-1.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Shoes",
    quantity:0
  },
  {
    name: "Pique Biker Jacket",
    price: 67.24,
    img: "images/product-2.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 20
  },
  {
    name: "Multi-Pocket Chest Bag",
    price: 43.48,
    img: "images/product-3.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Bags",
    quantity: 10
  },
  {
    name: "Diagonal Textured Cap",
    price: 60.90,
    img: "images/product-4.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 25
  },
  {
    name: "Leather Backpack",
    price: 31.37,
    img: "images/product-5.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Bags",
    quantity: 18
  },
  {
    name: "Ankle Boots",
    price: 98.49,
    img: "images/product-6.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Shoes",
    quantity: 12
  },
  {
    name: "T-Shirt Contrast Pocket",
    price: 49.66,
    img: "images/product-7.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 30
  },
  {
    name: "Basic Flowing Scarf",
    price: 26.28,
    img: "images/product-8.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Women",
    quantity: 22
  },
  {
    name: "Nike Air Zoom",
    price: 115.00,
    img: "images/product-9.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Shoes",
    quantity: 14
  },
  {
    name: "Classic Biker Jacket",
    price: 75.00,
    img: "images/product-10.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 18
  },
  {
    name: "Outdoor Chest Bag",
    price: 50.00,
    img: "images/product-11.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Bags",
    quantity: 8
  },
  {
    name: "Textured Sports Cap",
    price: 45.50,
    img: "images/product-12.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 20
  },
  {
    name: "Sporty Running Shoes",
    price: 110.00,
    img: "images/product-13.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Shoes",
    quantity: 25
  },
  {
    name: "Slim Fit Jeans",
    price: 55.00,
    img: "images/product-14.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Men",
    quantity: 18
  },
  {
    name: "Crossbody Leather Bag",
    price: 65.00,
    img: "images/product-15.jpg",
    isNew: getRandomBoolean(),
    isOnSale: getRandomBoolean(),
    isBestSeller: getRandomBoolean(),
    category: "Bags",
    quantity: 12
  },
];

async function seedDatabase() {
  try {
    await Product.deleteMany({});
    console.log(" Old products deleted.");

    await Product.insertMany(products);
    console.log(" New products inserted successfully.");

    mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error(" Error seeding database:", error);
    mongoose.connection.close();
  }
}

seedDatabase();
