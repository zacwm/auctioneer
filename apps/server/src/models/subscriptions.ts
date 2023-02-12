import { Schema, model } from 'mongoose';

const subscriptionSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  listingId: {
    type: String,
    required: true,
  },
});

export default model('Subscription', subscriptionSchema);