import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    isNew: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },  
});

const Product = mongoose.model("Product", productSchema);

export default Product;
