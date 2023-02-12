import { Schema, model } from 'mongoose';

const generalSchema = new Schema({
  tags: {
    type: String,
    default: ""
  }
});

export default model('General', generalSchema);