// models/categorySchema.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  category_name:{
    type:String,
  },
  is_subcategory:{
    type:Boolean
  },
  subCategory:{
    type:Object
  }
});

export const category = mongoose.model('category', categorySchema);