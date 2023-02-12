import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/:imageid", async (req: express.Request, res: express.Response) => {
  const { imageid } = req.params;

  if (!imageid) {
    res.status(400).send({ success: false, reason: 'Invalid parameters' });
    return;
  }

  // Find image in ./imageStore folder, if it exists, send it, otherwise send 404.
  const imagePath = path.join(__dirname, `../../imageStore/${imageid}`);

  if (!fs.existsSync(imagePath)) {
    res.status(404).send({ success: false, reason: 'Image not found' });
    return;
  }

  res.status(200).sendFile(imagePath);
});

export default router;