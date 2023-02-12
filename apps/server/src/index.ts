import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookiesession from 'cookie-session';
import cors from 'cors';

import Notifications from './notifications';

import loginsModel from './models/logins';
import usersModel from './models/users';
import listingsModel from './models/listings';
import bidsModel from './models/bids';
import subscriptionsModel from './models/subscriptions';
import generalModel from './models/general';

import adminRoute from './api/admin';
import authRoute from './api/auth';
import userRoute from './api/user';
import imagesRoute from './api/images';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const session = cookiesession({
  name: process.env.COOKIE_NAME,
  keys: process.env.COOKIE_KEYS?.split(',') || [],
  maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  sameSite: 'none',
  secure: true,
});

// ALlow CORS
app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));
app.set('trust proxy', 1)
app.use(express.json());
app.use(session);

// # API HTTP paths
app.use('/admin', adminRoute);
app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/images', imagesRoute);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send({ online: true });
});

// # Websocket
let lastListingItemsUpdate: any = null;

const listingItems = async (callback?: any) => {
  lastListingItemsUpdate = new Date();

  const listings = await listingsModel.find({ $or: [{ hidden: false }, { hidden: { $exists: false } }] });
  const listingParsed = [];

  // Fetch highest bid for each listing and add it to the listing object
  for (let i = 0; i < listings.length; i++) {
    const listing: any = listings[i];
    const listingBids = await bidsModel.find({
      listingId: listing.listingId
    }).sort({ bidAmount: -1 });
    const listingHighestBid = listingBids[0];

    const listingObject = {
      listingId: listing.listingId,
      name: listing.name,
      description: listing.description,
      startingPrice: listing.startingPrice,
      reservePrice: listing.reservePrice,
      featureImageIndex: parseInt(listing.featureImageIndex),
      imagesPaths: listing.imagesPaths,
      currentBid: listing.currentBid,
      highestBid: listingHighestBid ? listingHighestBid.bidAmount : listing.startingPrice,
      bidCount: listingBids.length,
      finishUnixTimestamp: listing.finishUnix,
      finished: listing.finished,
      hidden: listing.hidden,
      highestUserId: listingHighestBid ? listingHighestBid.userId : null,
      tags: listing.tags,
    }

    listingParsed.push(listingObject);
  }

  // Sort lowest finishUnixTimestamp to first, but finished items to last
  listingParsed.sort((a: any, b: any) => {
    if (a.finished && !b.finished) {
      return 1;
    } else if (!a.finished && b.finished) {
      return -1;
    } else {
      return a.finishUnixTimestamp - b.finishUnixTimestamp;
    }
  });

  if (callback) {
    callback(listingParsed);
  } else {
    io.emit('itemsUpdate', listingParsed);
  }
};

let updateListingItemsInterval: any = setInterval(() => {
  // If update was less than 3 seconds ago, don't update
  if (lastListingItemsUpdate && (new Date().getTime() - lastListingItemsUpdate.getTime()) < 3000) {
    return;
  }

  listingItems();
}, 5000);

io.on('connection', (socket) => {
  let login: any;
  let user: any;

  socket.on('setLoginToken', async (tokenSet: string, callback: (status: any) => void) => {
    if (!tokenSet || !callback) {
      callback("Invalid parameters");
      return;
    }

    if (typeof tokenSet !== 'string' || typeof callback !== 'function') {
      if (typeof callback === 'function') {
        callback("Invalid parameters");
      }
      return;
    }

    // Check if token is valid
    const loginDoc = await loginsModel.findOne({ accessToken: tokenSet });

    if (!loginDoc) {
      callback("Invalid token 1");
      return;
    }

    // Check if user exists
    const userDoc = await usersModel.findOne({ userId: loginDoc.userId });

    if (!userDoc) {
      callback("Invalid token 2");
      return;
    }

    // Get user subscriptions
    const subscriptions = await subscriptionsModel.find({ userId: userDoc.userId });

    // Get user notifications
    const notifications = await Notifications.getUserNotifications(userDoc.userId);
    // Get last 100 bids user has made
    const bids = await bidsModel.find({ userId: userDoc.userId }).sort({ bidUnixTimestamp: -1 }).limit(100);

    const generalSettings = await generalModel.findOne({});

    login = loginDoc;
    user = userDoc;
    callback({
      user: {
        phoneNumber: user.phoneNumber,
        userId: user.userId,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        postcode: user.postcode,
        admin: user.admin ? user.admin : undefined,
      },
      subscriptions: subscriptions.map((subscription: any) => {
        return subscription.listingId;
      }),
      notifications: notifications,
      bids: bids.map((bid: any) => {
        return {
          referenceId: bid.referenceId,
          listingId: bid.listingId,
          bidAmount: bid.bidAmount,
          timeBid: bid.timeBid,
        }
      }),
      general: {
        tags: generalSettings?.tags || [],
      }
    });
    console.info('Socket connection authenticated: ' + userDoc.userId);
  });

  socket.on("profileSetup", async (data: any, callback: (status: any) => void) => {
    if (!login || !user) {
      callback({ success: false, message: "Not authenticated" });
      return;
    }

    if (!data || !callback) {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (typeof data !== 'object' || typeof callback !== 'function') {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (!data.firstName || !data.lastName || !data.email || !data.postcode) {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (typeof data.firstName !== 'string' || typeof data.lastName !== 'string' || typeof data.email !== 'string' || typeof data.postcode !== 'string') {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    // Update the document
    const userDocument = await usersModel.findOne({ userId: user.userId });
    if (!userDocument) {
      callback({ success: false, message: "Failed to update user" });
      return;
    }

    userDocument.firstName = data.firstName;
    userDocument.lastName = data.lastName;
    userDocument.email = data.email;
    userDocument.postcode = data.postcode;
    userDocument.profileSetup = true;

    await userDocument.save();

    callback({
      success: true,
      newUser: {
        phoneNumber: userDocument.phoneNumber,
        userId: userDocument.userId,
        profileSetup: userDocument.profileSetup,
        firstName: userDocument.firstName,
        lastName: userDocument.lastName,
        email: userDocument.email,
        postcode: userDocument.postcode,
      }
    });
  });
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Auction socket events
  socket.on('getItems', async (callback: any) => {
    const settings = await generalModel.findOne({});

    const tags = settings?.tags ? settings.tags.split(",") : [];

    listingItems((listings: any) => {
      callback({
        success: true,
        items: listings,
        tags: tags,
      });
    });
  });

  socket.on('placeBid', async (data: any, callback: (status: any) => void) => {
    // Check that the user is authenticated
    if (!login || !user) {
      callback({ success: false, message: "Not authenticated" });
      return;
    }

    const userFetch = await usersModel.findOne({ userId: user.userId });
    if (!userFetch) {
      callback({ success: false, message: "Failed to fetch account" });
      return;
    }

    user = userFetch;

    // Check if banned is true
    if (userFetch.banned) {
      callback({ success: false, message: "You are banned from placing bids..." });
      return;
    }

    // Check that the data is valid 
    if (!data || !callback) {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (typeof data !== 'object' || typeof callback !== 'function') {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (!data.itemId || !data.bidAmount) {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    if (typeof data.itemId !== 'string' || typeof data.bidAmount !== 'number') {
      callback({ success: false, message: "Invalid parameters" });
      return;
    }

    // Get the listing
    const listing = await listingsModel.findOne({
      listingId: data.itemId,
    });

    if (!listing) {
      callback({ success: false, message: "Item not found" });
      return;
    }

    // Check if the listing has ended
    if (listing.finishUnix < Math.floor(Date.now() / 1000)) {
      callback({ success: false, message: "Listing has ended" });
      return;
    }

    // Check if the bid is higher than the current bid
    const listingHighestBid = await bidsModel.findOne({
      listingId: data.itemId,
    }).sort({ bidAmount: -1 });

    if (listingHighestBid && listingHighestBid.bidAmount >= data.bidAmount) {
      callback({ success: false, message: "Bid must be higher than current bid" });
      return;
    }

    // # Create the bid
    const bidId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create the bid document
    const bid = new bidsModel({
      referenceId: bidId,
      listingId: data.itemId,
      userId: user.userId,
      bidAmount: data.bidAmount,
      timeBid: Math.floor(Date.now() / 1000),
    });

    // Save the bid
    await bid.save();

    // Emit update back to all clients and back to the client that placed the bid
    listingItems();
    callback({ success: true });

    // Do outbid notification check
    if (listingHighestBid) {
      Notifications.outbid(data.itemId, listingHighestBid.userId, user.userId, data.bidAmount);
    }
  });

  socket.on('toggleSubscription', async (listingId: any, callback: any) => {
    if (!login || !user) return;
    if (!listingId) return;
    if (typeof listingId !== 'string') return;

    // Get the listing
    const listing = await listingsModel.findOne({
      listingId: listingId,
    });

    if (!listing) return;

    // Check if user is subscribed
    const userSubscribed = await subscriptionsModel.findOne({
      listingId: listingId,
      userId: user.userId,
    });

    if (userSubscribed) {
      // Delete document
      await subscriptionsModel.deleteOne({
        listingId: listingId,
        userId: user.userId,
      });
    } else {
      // Create document
      const subscription = new subscriptionsModel({
        listingId: listingId,
        userId: user.userId,
      });

      await subscription.save();
    }

    // Get all user subscriptions
    const userSubscriptions = await subscriptionsModel.find({
      userId: user.userId,
    });

    // Emit back to user
    socket.emit('subscriptionUpdate', {
      subscriptions: userSubscriptions.map((subscription: any) => subscription.listingId),
    });

    if (callback && typeof callback === 'function') {
      callback({ success: true });
    }
  });
});



// # Init MongoDB Connection and start server
(async () => {
  // # Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.info('Connected to MongoDB')

  // Listing Checks for any that have passed their finish time
  setInterval(() => {
    (async () => {
      const notificationMinutes = [1440, 720, 360, 180, 60, 30, 15];
      const currentUnix = new Date().getTime() / 1000;

      const listingsToFinish = await listingsModel.find({
        finished: false,
      });

      for (let i = 0; i < listingsToFinish.length; i++) {
        const listingDocument = await listingsModel.findOne({
          listingId: listingsToFinish[i].listingId,
        });
        if (!listingDocument) {
          continue;
        }

        // Check if listing has finished
        if (listingDocument.finishUnix < currentUnix) {
          listingDocument.finished = true;

          // Get the highest bid
          const highestBid = await bidsModel.findOne({
            listingId: listingDocument.listingId,
          }).sort({ bidAmount: -1 });

          // Check that there is a highest bid
          if (!highestBid) {
            listingDocument.winningBid = "nobids";
          }
          // Check that highest bid is higher or equal to the reserve price
          else if (highestBid.bidAmount >= listingDocument.reservePrice) {
            listingDocument.winningBid = highestBid.referenceId;

            // Send notification to winner
            Notifications.wonListing({
              listingId: listingDocument.listingId,
              name: listingDocument.name,
              userId: highestBid.userId,
              bidAmount: highestBid.bidAmount,
            });
          } else {
            listingDocument.winningBid = "belowreserve";
          }

          await listingDocument.save();

          Notifications.listingFinished({
            listingId: listingDocument.listingId,
            name: listingDocument.name
          });
        } else {
          // Check that finishUnix is a number, if not skip...
          if (typeof listingDocument.finishUnix !== 'number') {
            continue;
          }
          // If listing has reached less than a new notificationMinutes time, send a notification
          const minutesRemaining = Math.ceil((listingDocument.finishUnix - currentUnix) / 60);
          const lastNotification = listingDocument.lastNotificationMinutes;

          // Only notify for lowest possible minutes remaining, and if the last notification was not the same or undefined
          if (notificationMinutes.includes(minutesRemaining) && lastNotification !== minutesRemaining) {
            // Update lastNotificationMinutes
            listingDocument.lastNotificationMinutes = minutesRemaining;
            await listingDocument.save();
            Notifications.listingTimeLeft({
              listingId: listingDocument.listingId,
              name: listingDocument.name,
            }, minutesRemaining);
          }
        }
      }
    })();
  }, 2000);

  // # Start server
  server.listen(4053, () => {
    console.log('listening on *:4053');
  });
})();