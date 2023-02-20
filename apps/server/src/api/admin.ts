import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import fileUpload from 'express-fileupload';

import loginsModel from '../models/logins';
import usersModel from '../models/users';
import listingsModel from '../models/listings';
import bidsModel from '../models/bids';
import generalModel from '../models/general';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imageFolder = path.join(__dirname, `../../imageStore`);

const router = express.Router();

router.use(fileUpload());

const prepListingResponse = async (listing: any) => {
  const listingBids = await bidsModel.find({
    listingId: listing.listingId
  }).sort({ bidAmount: -1 });

  const listingBidsParsed = [];

  // Get the user object for each bid
  for (let i = 0; i < listingBids.length; i++) {
    const bid: any = listingBids[i];
    const user = await usersModel.findOne({ userId: bid.userId });

    const bidObject = {
      referenceId: bid.referenceId,
      userId: bid.userId,
      bidAmount: bid.bidAmount,
      timeBid: bid.timeBid,
      winningBid: bid.winningBid,
      user: {
        phoneNumber: user.phoneNumber,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        postcode: user.postcode,
      }
    };

    listingBidsParsed.push(bidObject);
  }

  const listingObject = {
    listingId: listing.listingId,
    createdBy: listing.createdBy,
    name: listing.name,
    description: listing.description,
    startingPrice: listing.startingPrice,
    reservePrice: listing.reservePrice,
    featureImageIndex: parseInt(listing.featureImageIndex),
    imagesPaths: listing.imagesPaths,
    bidIncrementRequirement: listing.bidIncrementRequirement,
    finishUnix: listing.finishUnix,
    finished: listing.finished,
    hidden: listing.hidden || false,
    bidCount: listingBids.length,
    bids: listingBidsParsed,
    winningBid: listing.winningBid,
    notifiedWinningBidder: listing.notifiedWinningBidder,
    adminNotes: listing.adminNotes,
    tags: listing.tags,
  };

  if (listingBids[0]) {
    listingObject['highestBid'] = listingBids[0].bidAmount;
  } else {
    listingObject['highestBid'] = listing.startingPrice;
  }

  return listingObject;
}

router.use(async (req: any, res: express.Response, next: express.NextFunction) => {
  /* # Used during development to bypass auth for bulk uploading, may create a proper endpoint and auth for this later.
  if (req.headers['authbypass-haha'] == "yeah") {
    next();
    return;
  }
  */

  // Check if user is an admin
  if (!req.session?.accesstoken) {
    res.status(401).send({ success: false, reason: "Unauthorized" });
    return;
  }

  const userLogin = await loginsModel.findOne({ accessToken: req.session.accesstoken });
  if (!userLogin) {
    res.status(401).send({ success: false, reason: "Unauthorized" });
    return;
  }

  const user = await usersModel.findOne({ userId: userLogin.userId });
  if (!user) {
    res.status(401).send({ success: false, reason: "Unauthorized" });
    return;
  }

  if (!user.admin) {
    res.status(401).send({ success: false, reason: "Unauthorized" });
    return;
  }

  req.user = user;
  next();
});

router.get('/', async (req: express.Request, res: express.Response) => {
  res.send({
    success: true,
  });
});

router.post("/createlisting", async (req: express.Request, res: express.Response) => {
  // Check if all required fields are present
  if (!req.body.name
    || !req.body.startingPrice
    || !req.body.finishUnix
  ) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check that finishUnix is in the future
  if (req.body.finishUnix < new Date().getTime() / 1000) {
    res.status(400).send({ success: false, reason: "Finish time must be in the future" });
    return;
  }

  // Create random 8 digit listing ID
  const newListingId = Math.floor(Math.random() * 100000000);

  // Create listing
  const newListing = new listingsModel({
    listingId: newListingId,
    name: req.body.name,
    startingPrice: req.body.startingPrice,
    reservePrice: req.body.reservePrice || 0,
    finishUnix: req.body.finishUnix,
    hidden: req.body.hidden || false,
  });

  await newListing.save();

  res.send({
    success: true,
    listingId: newListingId,
  });
});

router.post('/bulkcreate', async (req: express.Request, res: express.Response) => {
  // Check if all required fields are present
  if (!req.body.numberStartAt
    || !req.body.startingPrice
    || !req.body.createAmount
  ) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const numberNameStartAt = parseInt(req.body.numberStartAt);
  const createAmount = parseInt(req.body.createAmount);

  // Make unix finish in a day from now
  const finishUnix = new Date().getTime() / 1000 + 86400;

  // Loop through and create listings
  for (let i = numberNameStartAt; i < createAmount; i++) {
    const newListingId = Math.floor(Math.random() * 100000000);

    const newListing = new listingsModel({
      listingId: newListingId,
      name: `${i}`,
      startingPrice: 1,
      reservePrice: 0,
      finishUnix: finishUnix,
      hidden: true,
    });

    await newListing.save();
  }

  res.send({
    success: true,
  });
});

router.get('/listings', async (req: express.Request, res: express.Response) => {
  const listings = await listingsModel.find({});
  const listingsParsed = [];

  // Fetch highest bid for each listing and add it to the listing object
  for (let i = 0; i < listings.length; i++) {
    const listing: any = listings[i];
    const listingBids = await bidsModel.find({
      listingId: listing.listingId
    }).sort({ bidAmount: -1 });
    const listingHighestBid = listingBids[0];

    const listingObject = {
      listingId: listing.listingId,
      createdBy: listing.createdBy,
      name: listing.name,
      description: listing.description,
      startingPrice: listing.startingPrice,
      reservePrice: listing.reservePrice,
      featureImageIndex: parseInt(listing.featureImageIndex),
      imagesPaths: listing.imagesPaths,
      bidIncrementRequirement: listing.bidIncrementRequirement,
      finishUnix: listing.finishUnix,
      bidCount: listingBids.length,
      finished: listing.finished,
      hidden: listing.hidden,
      tags: listing.tags,
    };

    if (listingHighestBid) {
      listingObject['highestBid'] = listingHighestBid.bidAmount;
    } else {
      listingObject['highestBid'] = listing.startingPrice;
    }

    listingsParsed.push(listingObject);
  }

  // Sort finishUnix from lowest to highest with all finished listings at the end
  listingsParsed.sort((a, b) => {
    if (a.finished && !b.finished) {
      return 1;
    } else if (!a.finished && b.finished) {
      return -1;
    } else {
      return a.finishUnix - b.finishUnix;
    }
  });

  res.send({
    success: true,
    listings: listingsParsed,
  });
});

router.get('/listing/:listingId', async (req: express.Request, res: express.Response) => {
  if (!req.params.listingId) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const listing = await listingsModel.findOne({ listingId: req.params.listingId });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  const listingObject = await prepListingResponse(listing);
  
  res.send({
    success: true,
    listing: listingObject,
  });
});

router.get('/bids/:beforeUnix', async (req: express.Request, res: express.Response) => {
  const beforeUnix = parseInt(req.params.beforeUnix) || (new Date().getTime() / 1000) + 86400;

  // Limit to 100 bids per request 
  const bids = await bidsModel.find({ timeBid: { $lt: beforeUnix } }).sort({ timeBid: -1 }).limit(100);
  const bidsParsed = [];

  const cachedListings = {};
  const cachedUsers = {};

  for (let i = 0; i < bids.length; i++) {
    let bidParsed = {
      referenceId: bids[i].referenceId,
      listingId: bids[i].listingId,
      bidAmount: bids[i].bidAmount,
      timeBid: bids[i].timeBid,
      winningBid: bids[i].winningBid,
      user: {},
      listing: {},
    };

    // Get listing
    if (cachedListings[bids[i].listingId]) {
      bidParsed['listing'] = cachedListings[bids[i].listingId];
    } else {
      const listing = await listingsModel.findOne({ listingId: bids[i].listingId });
      if (listing) {
        const listingData = {
          exists: true,
          listingId: listing.listingId,
          name: listing.name,
        };
        bidParsed['listing'] = listingData;
        cachedListings[bids[i].listingId] = listingData;
      } else {
        bidParsed['listing'] = {
          exists: false,
        };
        cachedListings[bids[i].listingId] = {
          exists: false,
        };
      }
    }

    // Get user
    if (cachedUsers[bids[i].userId]) {
      bidParsed['user'] = cachedUsers[bids[i].userId];
    } else {
      const user = await usersModel.findOne({ userId: bids[i].userId });
      if (user) {
        const userData = {
          exists: true,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        bidParsed['user'] = userData;
        cachedUsers[bids[i].userId] = userData;
      } else {
        bidParsed['user'] = {
          exists: false,
        };
        cachedUsers[bids[i].userId] = {
          exists: false,
        };
      }
    }

    bidsParsed.push(bidParsed);
  }

  res.send({
    success: true,
    bids: bidsParsed,
  });
});

router.get('/bid/:referenceId', async (req: express.Request, res: express.Response) => {
  if (!req.params.referenceId) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const bid = await bidsModel.findOne({ referenceId: req.params.referenceId });
  if (!bid) {
    res.status(404).send({ success: false, reason: "Bid not found" });
    return;
  }

  const listing = await listingsModel.findOne({ listingId: bid.listingId });

  const user = await usersModel.findOne({ userId: bid.userId });

  const bidObject = {
    referenceId: bid.referenceId,
    userId: bid.userId,
    bidAmount: bid.bidAmount,
    timeBid: bid.timeBid,
    listing: listing ? {
      listingId: listing.listingId,
      name: listing.name,
      startingPrice: listing.startingPrice,
    } : null,
    user: {
      phoneNumber: user.phoneNumber,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      postcode: user.postcode,
    }
  };

  res.send({
    success: true,
    bid: bidObject,
  });
});

router.post('/editlisting/:listingId', async (req: express.Request, res: express.Response) => {
  if (!req.params.listingId) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const listing = await listingsModel.findOne({ listingId: req.params.listingId });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  if (req.body.name) {
    listing.name = req.body.name;
  }

  if (req.body.description !== undefined) {
    listing.description = req.body.description;
  }

  if (req.body.startingPrice) {
    listing.startingPrice = req.body.startingPrice;
  }

  if (req.body.reservePrice !== undefined) {
    listing.reservePrice = req.body.reservePrice;
  }

  if (req.body.featureImageIndex !== undefined) {
    listing.featureImageIndex = req.body.featureImageIndex.toString();
  }

  if (req.body.bidIncrementRequirement) {
    listing.bidIncrementRequirement = req.body.bidIncrementRequirement;
  }

  if (req.body.finishUnix) {
    // Check if finishUnix is in the future, if so set finished to false
    if (req.body.finishUnix > Date.now() / 1000) {
      listing.finished = false;
    }
    listing.finishUnix = req.body.finishUnix;
  }

  if (req.body.hidden !== undefined) {
    // check if type is boolean
    if (typeof req.body.hidden == 'boolean') {
      listing.hidden = req.body.hidden;
    }
  }

  if (req.body.tags !== undefined) {
    if (typeof req.body.tags == 'string') {
      listing.tags = req.body.tags;
    }
  }

  if (req.body.adminNotes !== undefined) {
    listing.adminNotes = req.body.adminNotes;
  }

  await listing.save();

  const listingObject = await prepListingResponse(listing);

  res.send({
    success: true,
    listing: listingObject,
  });
});

router.post('/bulkedit', async (req: express.Request, res: express.Response) => {
  if (!req.body.listingIds) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const listingIds = req.body.listingIds;
  const editActions = req.body.actions;

  // Check that all listingIds is a valid type and is just an array of strings
  if (!Array.isArray(listingIds) || listingIds.some((listingId) => typeof listingId != 'string')) {
    res.status(400).send({ success: false, reason: "Invalid body" });
    return;
  }

  // Check that all listingIds are valid before updating any
  const allListings = await listingsModel.find({ listingId: { $in: listingIds } });
  if (allListings.length != listingIds.length) {
    res.status(404).send({ success: false, reason: "Some listings not found" });
    return;
  }

  const parsedUpdateQuery = {};

  for (let i = 0; i < editActions.length; i++) {
    const action = editActions[i];

    if (action.type == 'name') {
      parsedUpdateQuery['name'] = action.value;
    } else if (action.type == 'description') {
      parsedUpdateQuery['description'] = action.value;
    } else if (action.type == 'starting-price') {
      parsedUpdateQuery['startingPrice'] = action.value;
    } else if (action.type == 'hidden') {
      parsedUpdateQuery['hidden'] = action.value;
    } else if (action.type == 'finish-time') {
      const finishTime = new Date(action.value);
      const finishUnix = finishTime.getTime() / 1000;
      parsedUpdateQuery['finishUnix'] = finishUnix;
      // Check if finishUnix is in the future, if so set finished to false
      if (finishUnix > Date.now() / 1000) {
        parsedUpdateQuery['finished'] = false;
        parsedUpdateQuery['winningBid'] = undefined;
        parsedUpdateQuery['notifiedWinningBidder'] = false;
      }
    }
  }

  await listingsModel.updateMany({ listingId: { $in: listingIds } }, parsedUpdateQuery);

  res.send({
    success: true,
    updated: allListings.length,
  });
});

router.post('/uploadimage/:listingId', async (req: express.Request, res: express.Response) => {
  if (!req.params.listingId) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check image is present
  if (!req.files) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check only one image is present
  if (Object.keys(req.files).length !== 1) {
    res.status(400).send({ success: false, reason: "Only one image can be uploaded at a time" });
    return;
  }

  // Check image is JPEG, JPG or PNG
  const image: any = req.files.image;
  const imageExtension = image.name.split('.').pop();
  if (imageExtension !== 'jpeg' && imageExtension !== 'jpg' && imageExtension !== 'png') {
    res.status(400).send({ success: false, reason: "Image must be JPEG, JPG or PNG" });
    return;
  }

  // Check listing exists
  const listing = await listingsModel.findOne({ listingId: req.params.listingId });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  // Save image to folder
  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder);
  }

  const imageId = uuidv4().replaceAll("-", "_");

  // replace any dashes in the image id with underscores
  const imageSaveName = `${imageId}.${imageExtension}`;

  const imageSavePath = path.join(imageFolder, imageSaveName);

  image.mv(imageSavePath, async (err: any) => {
    if (err) {
      res.status(500).send({ success: false, reason: "Failed to save image" });
      return;
    }

    // Append image to the listing document
    listing.imagesPaths.push(imageSaveName);

    await listing.save();

    const listingObject = await prepListingResponse(listing);

    res.send({
      success: true,
      listing: listingObject,
    });
  });
});

router.post("/imageuploadbyname/:listingname", async (req: express.Request, res: express.Response) => {
  if (!req.params.listingname) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check image is present
  if (!req.files) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check only one image is present
  if (Object.keys(req.files).length !== 1) {
    res.status(400).send({ success: false, reason: "Only one image can be uploaded at a time" });
    return;
  }

  // Check image is JPEG, JPG or PNG
  const image: any = req.files.image;
  const imageExtension = image.name.split('.').pop();
  if (imageExtension !== 'jpeg' && imageExtension !== 'jpg' && imageExtension !== 'png') {
    res.status(400).send({ success: false, reason: "Image must be JPEG, JPG or PNG" });
    return;
  }

  // Check listing exists
  const listing = await listingsModel.findOne({ name: req.params.listingname });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  // Save image to folder
  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder);
  }

  const imageId = uuidv4().replaceAll("-", "_");

  // replace any dashes in the image id with underscores
  const imageSaveName = `${imageId}.${imageExtension}`;

  const imageSavePath = path.join(imageFolder, imageSaveName);

  image.mv(imageSavePath, async (err: any) => {
    if (err) {
      res.status(500).send({ success: false, reason: "Failed to save image" });
      return;
    }

    // Append image to the listing document
    listing.imagesPaths.push(imageSaveName);

    await listing.save();

    res.send({
      success: true,
    });
  });
});

router.post("/deleteimage", async (req: express.Request, res: express.Response) => {
  // Check the listingId field and the imagePath field are present
  if (!req.body.listingId || !req.body.imagePath) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  // Check the listing exists
  const listing = await listingsModel.findOne({ listingId: req.body.listingId });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  // Check the image exists
  if (!listing.imagesPaths.includes(req.body.imagePath)) {
    res.status(404).send({ success: false, reason: "Image not found" });
    return;
  }

  // Remove the image from the listing
  listing.imagesPaths = listing.imagesPaths.filter((imagePath) => imagePath !== req.body.imagePath);

  await listing.save();

  const listingObject = await prepListingResponse(listing);

  // Delete the image from the file system
  const imageDeletePath = path.join(imageFolder, req.body.imagePath);
  fs.unlink(imageDeletePath, (err) => {
    if (err) {
      res.status(500).send({ success: false, reason: "Failed to delete image" });
      return;
    }

    res.send({
      success: true,
      listing: listingObject,
    });
  });
});

router.get('/deletelisting/:listingId', async (req: express.Request, res: express.Response) => {
  if (!req.params.listingId) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const listing = await listingsModel.findOne({ listingId: req.params.listingId });
  if (!listing) {
    res.status(404).send({ success: false, reason: "Listing not found" });
    return;
  }

  await listing.delete();

  res.send({
    success: true,
  });
});

router.get('/users', async (req: express.Request, res: express.Response) => {
  const users = await usersModel.find();

  const usersParsed = []

  // Get number of bids the user has made
  for (const user of users) {
    const bids = await bidsModel.find({ userId: user.userId });
    const userParsed = {
      userId: user.userId,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      postcode: user.postcode,
      bids: bids.length,
      status: user.banned ? "Banned" : user.profileSetup ? user.admin ? "Admin" : "Registered" : "Profile not setup"
    };

    usersParsed.push(userParsed);
  }

  res.send({
    success: true,
    users: usersParsed,
  });

});

router.get('/user/:userid', async (req: express.Request, res: express.Response) => {
  const user = await usersModel.findOne({ userId: req.params.userid });
  if (!user) {
    res.status(404).send({ success: false, reason: "User not found" });
    return;
  }

  // Get users bids
  const bids = await bidsModel.find({ userId: user.userId });

  const parsedUser = {
    userId: user.userId,
    phoneNumber: user.phoneNumber,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    postcode: user.postcode,
    banned: user.banned,
    status: user.banned ? "Banned" : user.profileSetup ? user.admin ? "Admin" : "Registered" : "Profile not setup",
    bids: bids.map((bid) => {
      return {
        listingId: bid.listingId,
        bidAmount: bid.bidAmount,
        timeBid: bid.timeBid,
      }
    }),
  };

  res.send({
    success: true,
    user: parsedUser,
  });
});

router.post('/edituser/:userid', async (req: express.Request, res: express.Response) => {
  if (!req.params.userid) {
    res.status(400).send({ success: false, reason: "Missing required fields" });
    return;
  }

  const user = await usersModel.findOne({ userId: req.params.userid });
  if (!user) {
    res.status(404).send({ success: false, reason: "User not found" });
    return;
  }

  if (req.body.banned !== undefined) {
    user.banned = req.body.banned;
  }

  await user.save();

  // Get users bids
  const bids = await bidsModel.find({ userId: user.userId });

  const parsedUser = {
    userId: user.userId,
    phoneNumber: user.phoneNumber,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    postcode: user.postcode,
    banned: user.banned,
    status: user.banned ? "Banned" : user.profileSetup ? user.admin ? "Admin" : "Registered" : "Profile not setup",
    bids: bids.map((bid) => {
      return {
        listingId: bid.listingId,
        bidAmount: bid.bidAmount,
        timeBid: bid.timeBid,
      }
    }),
  };

  res.send({
    success: true,
    user: parsedUser,
  });
});

router.get('/settings', async (req: express.Request, res: express.Response) => {
  const parsedReponse = {};

  // Get settings
  const settings = await generalModel.findOne({});

  parsedReponse["tags"] = settings?.tags || [];

  res.send({
    success: true,
    data: parsedReponse,
  });
});

router.post('/updatesettings', async (req: express.Request, res: express.Response) => {
  // Chcek if a document exists for settings
  let settings = await generalModel.findOne({});
  if (!settings) {
    settings = new generalModel();
  }

  // Update tags, either a empty string or string that is seperated by commas
  if (req.body.tags) {
    const tags = req.body.tags.split(",");
    // check that each tag is not empty and is unique
    const uniqueTags = tags.filter((tag, index) => tag !== "" && tags.indexOf(tag) === index);
    settings.tags = uniqueTags.join(",");
  } else {
    settings.tags = "";
  }

  await settings.save();

  res.send({
    success: true,
  });
});

export default router;