import express from 'express';
import twilio from 'twilio';
const { Twilio } = twilio;

import loginsModel from '../models/logins';
import usersModel from '../models/users';

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

const router = express.Router();

router.get('/', async (req: any, res: express.Response) => {
  // Check if user is logged in
  if (req.session.accesstoken) {
    // Get user
    const login = await loginsModel.findOne({ accessToken: req.session.accesstoken });
    if (!login) {
      res.status(401).send({ success: false, reason: "Unauthorized" });
      return;
    }

    const user = await usersModel.findOne({ userId: login.userId });
    if (!user) {
      res.status(401).send({ success: false, reason: "Unauthorized" });
      return;
    }

    res.send({
      success: true,
      accesstoken: req.session.accesstoken,
    });
  }
  else {
    res.status(401).send({ success: false, reason: "Unauthorized" });
  }
});

router.post("/requestCode", async (req: express.Request, res: express.Response) => {
  // * Creates a new login document with a random code and text message it to the user with the phone number

  // Check that phone number is a valid australian mobile number
  if (!req.body.phoneNumber.match(/^04[0-9]{8}$/)) {
    res.status(400).send({ success: false, reason: "Invalid Phone Number" });
    return;
  }

  // Check that user hasn't requested a code in the last minute
  const checkLastLogin = await loginsModel.findOne({
    phoneNumber: req.body.phoneNumber,
  });

  // Check that code was requested less than a minute ago
  // codeRequestedAt is a number value that is a unix timestamp
  if (checkLastLogin?.codeRequestedAt && (new Date().getTime() / 1000) - checkLastLogin.codeRequestedAt < 60) {
    const newCodeAvailableAt = checkLastLogin.codeRequestedAt + 60

    res.status(400).send({
      success: false,
      reason: "Please wait a minute before requesting a new code",
      newCodeAvailableAt: newCodeAvailableAt,
    });
    return;
  }
  
  // Create random 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  // Check that code is unique
  // TODO: Check if code is unique

  // Send text message with code
  // Parse aus mobile number to full number
  let fullNumber;
  // If number starts with 04
  if (req.body.phoneNumber.startsWith("04")) {
    fullNumber = "+61" + req.body.phoneNumber.substring(1);
  } else if (req.body.phoneNumber.startsWith("+61")) {
    fullNumber = req.body.phoneNumber;
  } else {
    res.status(400).send({ success: false, reason: "Invalid Phone Number" });
    return;
  }

  TwilioClient.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullNumber,
      body: `Hi. This is Northside Wizards with your login code...\nDo not share this code!\n\nYour code is: ${code}`,
    })
    .then(async (message) => {
      console.log(message.sid);
    })
    .catch((err) => {
      console.error(err);
    });

  console.info(`Code for ${req.body.phoneNumber} is ${code}`);
  
  // Save in Database for /verifyCode
  const login = new loginsModel({
    mobileCode: code,
    phoneNumber: req.body.phoneNumber,
    codeRequestedAt: new Date().getTime() / 1000,
  });

  await login.save();

  res.send({
    success: true,
    newCodeAvailableAt: new Date().getTime() / 1000 + 60,
  });
});

router.post("/verifyCode", async (req: any, res: express.Response) => {
  // Find code in logins
  const login = await loginsModel.findOne({
    phoneNumber: req.body.phoneNumber,
    mobileCode: req.body.code,
    usedCode: false,
  });

  if (!login) {
    res.status(400).send({ success: false, reason: "Invalid Code" });
    return;
  }

  // Check if code is expired
  if (login.mobileCodeExpires < new Date()) {
    res.status(400).send({ success: false, reason: "Expired Code" });
    return;
  }

  // Check if code has already been used
  if (login.usedCode) {
    res.status(400).send({ success: false, reason: "Used Code" });
    return;
  }

  // Check if user is already logged in
  if (req.session.userId) {
    res.status(400).send({ success: false, reason: "Already Logged In" });
    return;
  }

  // Check if user exists
  let user;

  const userFind = await usersModel.findOne({ phoneNumber: req.body.phoneNumber });

  if (userFind) {
    user = userFind;
  } else {
    // Create new user

    // Generate new user id.
    const userId = Math.floor(10000000 + Math.random() * 90000000);
    
    user = new usersModel({
      phoneNumber: req.body.phoneNumber,
      userId: userId,
    });

    await user.save();
  }

  // Create new access token (long 64 character string)
  const accessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Update login document
  login.userId = user.userId;
  login.accessToken = accessToken;
  login.usedCode = true;

  await login.save();

  req.session.accesstoken = accessToken;

  res.send({
    success: true,
    accesstoken: accessToken,
    user: {
      phoneNumber: user.phoneNumber,
      userId: user.userId,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      postcode: user.postcode,
      admin: user.admin ? user.admin : undefined,
    }
  });
});

router.get("/logout", async (req: any, res: express.Response) => {
  // Check if user is logged in
  if (!req.session.accesstoken) {
    res.status(400).send({ success: false, reason: "Not Logged In" });
    return;
  }

  // Remove access token from session
  req.session = null;

  res.send({ success: true });
});

export default router;