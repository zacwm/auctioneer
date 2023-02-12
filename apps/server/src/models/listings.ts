import { Schema, model } from 'mongoose';

const listingSchema = new Schema({
  // * Listing Details
  listingId: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  // * Listing Details
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  reservePrice: {
    type: Number,
    required: false,
    default: 0,
  },
  featureImageIndex: {
    type: String,
    required: false,
    default: "0",
  },
  imagesPaths: {
    type: [String],
    required: false,
  },
  bidIncrementRequirement: {
    type: Number,
    required: false,
    default: 1,
  },
  finishUnix: {
    type: Number,
    required: true,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: String,
    required: false,
    default: "",
  },
  adminNotes: {
    type: String,
    required: false,
    default: "",
  },
  winningBid: {
    type: String,
    required: false,
  },
  notifiedWinningBidder: {
    type: Boolean,
    required: false,
  },

  // Notifications
  lastNotificationMinutes: {
    type: Number,
    required: false,
  },
});

export default model('Listing', listingSchema);
