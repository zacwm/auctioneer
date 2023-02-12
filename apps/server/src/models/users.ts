import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  profileSetup: {
    type: Boolean,
    required: true,
    default: false,
  },

  // * User Details
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  postcode: {
    type: String,
    required: false,
  },
  admin: {
    type: Boolean,
    required: false,
  },
  banned: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default model('User', userSchema);

