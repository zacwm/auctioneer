// Notifications - Handle the checking if should create notifications & the creation of notifications

import {v4 as uuidv4} from 'uuid';
import twilio from 'twilio';
const { Twilio } = twilio;

let TwilioClient;

let TwilioClientInterval = setInterval(() => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    TwilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    clearInterval(TwilioClientInterval);
    console.log("Twilio credentials loaded")
  } else {
    console.log("Waiting for Twilio credentials");
  }
}, 1000);

import Notifications from './models/notifications';
import Subscriptions from './models/subscriptions';
import Listings from './models/listings';
import Users from './models/users';
import Bids from './models/bids';

// ## Public
const outbid = async (listingId: string, outbidUserId: string, bidderId: string, newBidPrice: number) => {
  if (outbidUserId === bidderId) return; // Don't send notification if outbid user is the bidder (they are the highest bidder
  
  // Check if outbidUser has a subscription for this listing
  const subscription = await Subscriptions.findOne({ userId: outbidUserId, listingId });

  const listing = await Listings.findOne({ listingId: listingId });
  if (!listing) return;

  if (subscription) {
    // Create notification
    const message = `You have been outbid on the listing for ${listing.name}\n\nThe new bid price is $${newBidPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

    createNotification(outbidUserId, "outbid", message, listingId);
  }
}

const listingTimeLeft = async (listing: any, minutesRemaining: number) => {
  if (!listing.listingId || !listing.name) return;

  const subscribedUsers = await Subscriptions.find({ listingId: listing.listingId });

  subscribedUsers.forEach(async (user) => {
    const lastNotificationMinutes = listing.lastNotificationMinutes;

    // convert to hours if possible
    let timeString;
    if (minutesRemaining >= 60) {
      timeString = `${Math.floor(minutesRemaining / 60)} hours`;
    } else {
      timeString = `${minutesRemaining} minutes`;
    }

    if (lastNotificationMinutes !== minutesRemaining) {
      // Create notification
      const message = `The listing for ${listing.name} has ${timeString} remaining!`;
      createNotification(user.userId, "timeLeft", message, listing.listingId);
    }
  });
}

const listingFinished = async (listing: any) => {
  if (!listing.listingId || !listing.name) return;

  const subscribedUsers = await Subscriptions.find({ listingId: listing.listingId });

  subscribedUsers.forEach(async (user) => {
    // Create notification
    const message = `The listing for ${listing.name} has finished!`;

    createNotification(user.userId, "finished", message, listing.listingId);
  });
}

const wonListing = async (data: any) => {
  const { listingId, name, userId, bidAmount } = data;
  createNotification(userId, "won", `You won the listing for ${name} for $${bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}!`, listingId);
}

const createNotification = async (
  userId: string,
  type: string,
  message: string,
  listingId: string,
  doSMS: boolean = true
) => {
  const user = await Users.findOne({ userId: userId });
  if (!user) return;

  const notificationId = uuidv4();

  let texted = false;

  // Send text message
  if (user.phoneNumber && doSMS) {
    sendTextMessage(user.phoneNumber, message);
    texted = true;
  }

  const notification = new Notifications({
    notificationId: notificationId,
    userId: userId,
    type: type,
    message: message,
    listingId: listingId,
    unixTimestamp: Date.now() / 1000,
    texted: texted,
  });

  await notification.save();
}

const getUserNotifications = async (userId: string) => {
  if (!userId) return;

  const notifications = await Notifications.find({ userId: userId }).sort({ unixTimestamp: -1 });

  const notificationsArray = (notifications || []).map((notification) => {
    return {
      notificationId: notification.notificationId,
      type: notification.type,
      message: notification.message,
      listingId: notification.listingId,
      read: notification.read,
      unixTimestamp: notification.unixTimestamp,
    };
  });

  return notificationsArray;
}

// ## Internal only 
const userWon = async (listingId: string, userId: string) => {
  console.info(`User '${userId}' won listing '${listingId}'`);
}

const sendTextMessage = async (phoneNumber: string, message: string) => {
  // Parse aus mobile number to full number
  let fullNumber;
  // If number starts with 04
  if (phoneNumber.startsWith("04")) {
    fullNumber = "+61" + phoneNumber.substring(1);
  } else if (phoneNumber.startsWith("+61")) {
    fullNumber = phoneNumber;
  } else {
    return;
  }

  TwilioClient.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullNumber,
      body: message,
    })
    .then(async (message) => {
      console.info(`Message sent to ${phoneNumber} - SID: ${message.sid}`);
    })
    .catch((err) => {
      console.warn(`Message failed to send to ${phoneNumber}`);
      console.warn(err);
    });
}

export default {
  outbid,
  listingTimeLeft,
  listingFinished,
  wonListing,
  createNotification,
  getUserNotifications,
}