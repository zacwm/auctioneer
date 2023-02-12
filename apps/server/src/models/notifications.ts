import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  notificationId: {
    type: String,
    required: true,
  },
  type: {
    // 'message', 'outbid', 'won', 'finished'
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  listingId: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  },
  unixTimestamp: {
    type: Number,
    required: true,
  },
  texted: {
    type: Boolean,
    required: true,
  }
});

export default model('Notification', notificationSchema);