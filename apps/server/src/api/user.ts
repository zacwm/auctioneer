import express from 'express';
import loginsModel from '../models/logins';
import usersModel from '../models/users';
import bidsModel from '../models/bids';

const router = express.Router();

router.use(async (req: any, res: express.Response, next: express.NextFunction) => {
  const { accesstoken } = req.session;

  if (!accesstoken) {
    res.status(401).send({ success: false, reason: 'Unauthorized' });
    return;
  }

  // Get login with access token.
  const login = await loginsModel.findOne({ accessToken: accesstoken });
  if (!login) {
    req.session = null;
    res.status(401).send({ success: false, reason: 'Unauthorized' });
    return;
  }

  const user = await usersModel.findOne({ userId: login.userId });
  if (!user) {
    res.status(401).send({ success: false, reason: 'Unauthorized' });
    return;
  }

  req.user = user;

  next();
});

router.get('/', async (req: any, res: express.Response) => {
  const user = req.user;

  res.status(200).send({
    success: true,
    user: {
      phoneNumber: user.phoneNumber,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      postcode: user.postcode,
    }
  });
});

router.post("/updatedetails", async (req: any, res: express.Response) => {
  const user = req.user;

  if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.email || !req.body.postcode) {
    res.status(400).send({ success: false, reason: 'Invalid parameters' });
    return;
  }

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.postcode = req.body.postcode;

  await user.save();
});

router.get('/bids', async (req: any, res: express.Response) => {
  const user = req.user;

  const bids = await bidsModel.find({ userId: user.userId });

  res.status(200).send({
    success: true,
    bids: bids.map((bid: any) => {
      return {
        referenceId: bid.referenceId,
        listingId: bid.listingId,
        bidAmount: bid.bidAmount,
        timeBid: bid.timeBid,
      }
    }),
  });
});

export default router;