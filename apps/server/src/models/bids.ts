import { Schema, model } from 'mongoose';

const bidSchema = new Schema({
  // * Bid Details
  referenceId: {
    type: String,
    required: true,
  },
  listingId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  timeBid: {
    type: Number,
    required: true,
  },
  winningBid: {
    type: Boolean,
    required: false,
    default: false,
  }
});

export default model('Bid', bidSchema);