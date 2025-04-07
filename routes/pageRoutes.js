import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
dotenv.config();

const router = express.Router();


router.post("/admin", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

  
    return res.status(200).json({ message: "Welcome Admin" });
  } catch (error) {
    console.error("Admin route error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create Product
router.post("/admin/products", async (req, res) => {
  const { name, price, img, isNew, isOnSale, isBestSeller, category, quantity } = req.body;

  try {
    if (!name || !price || !img || !category || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      price,
      img,
      isNew,
      isOnSale,
      isBestSeller,
      category,
      quantity,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});


// Get All Products
router.get("/admin/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Update Product
router.put("/admin/products/:id", async (req, res) => {
  const { name, price, img, isNew, isOnSale, isBestSeller, category, quantity } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        img,
        isNew,
        isOnSale,
        isBestSeller,
        category,
        quantity,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});


// Delete Product
router.delete("/admin/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});


router.post("/orders", async (req, res) => {
  console.log("Incoming order request:", JSON.stringify(req.body, null, 2));

  const { orderItems, totalPrice } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token, user not found" });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Validate Product IDs and Stock Availability
    for (const item of orderItems) {
      if (!mongoose.isValidObjectId(item.product)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }

      const existingProduct = await Product.findById(item.product);

      if (!existingProduct) {
        return res.status(400).json({ message: `Product with ID ${item.product} not found` });
      }

      // Check if stock is available
      if (existingProduct.quantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product: ${existingProduct.name}`,
        });
      }
    }

    // Create Order
    const order = await Order.create({
      user: user._id,
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice,
    });

    console.log("Order created:", order);

    // Update product quantity after order creation
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }, // Reduce stock
      });
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: error.message || "Error creating order" });
  }
});


router.get("/orders/my-orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token, user not found" });
    }

    const orders = await Order.find({ user: user._id }).populate("orderItems.product");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

//  Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not exists", redirectTo: "/register" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, 
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});


// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Test Route for Home Page
router.get("/", (req, res) => res.json({ message: "This is Home Page" }));

// Test Route for Shop Page
router.get("/shop", (req, res) => res.json({ message: "This is Shop Page" }));

// Test Route for Blog Page
router.get("/blog", (req, res) => res.json({ message: "This is Blog Page" }));

// Test Route for Contact Page
router.get("/contacts", (req, res) => res.json({ message: "This is Contact Page" }));

// Fetch products for the homepage
router.get("/products/home", async (req, res) => {
  try {
    const products = await Product.find().limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching home products" });
  }
});

// Fetch products with sorting and filtering
router.get("/products", async (req, res) => {
  try {
    let { category, sort, priceRange, page = 1, limit = 100000 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};

    // Fix Category Handling
    if (category && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    //  Fix Price Range Handling
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      query.price = {};
      if (!isNaN(min)) query.price.$gte = min;
      if (!isNaN(max)) query.price.$lte = max;
    }

    // Fix Sorting Issue
    let sortQuery = {};
    if (sort?.toLowerCase() === "low-to-high") {
      sortQuery.price = 1;
    } else if (sort?.toLowerCase() === "high-to-low") {
      sortQuery.price = -1;
    }

    // Fetch Products
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    let products = await Product.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});


// Get distinct product categories  
router.get("/products/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

export default router;
