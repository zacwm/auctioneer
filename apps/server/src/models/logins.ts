import { Schema, model } from 'mongoose';

const loginSchema = new Schema({
  userId: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
  },
  loginExpires: {
    type: Date,
    required: false,
  },
  mobileCode: {
    type: String,
    required: true,
  },
  mobileCodeExpires: {
    type: Date,
    required: false,
  },
  usedCode: {
    type: Boolean,
    required: false,
    default: false,
  },
  codeRequestedAt: {
    type: Number,
    required: true,
  },
});

export default model('Login', loginSchema);