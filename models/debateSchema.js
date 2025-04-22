// models/debateSchema.js
import mongoose from "mongoose";

const debateSchema = new mongoose.Schema({
  category:[
    {
      type: Schema.Types.ObjectId, 
      ref: 'category'
    }
  ],
  subcategory: String,
  title: String,
  description:String,
  title_in_roko:String,
  title_in_soko:String,
  created_At:{
    type:new Date(),
  },
  ends_At:{
    type:new Date()
  },
  schedule_time:{
    type:new Date()
  },
  comments_count:Number,
  roko_count:Number,
  soko_count:Number,
  user_count:Number,
  image_url:String
});

export const debate = mongoose.model('debates', debateSchema);