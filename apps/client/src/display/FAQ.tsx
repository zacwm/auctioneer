import React from "react";
import {
  Stack,
  Text,
  Paper,
  List,
  Image,
} from "@mantine/core";

function DisplayFAQ() {
  return (
    <Stack>
      <Text fz={28}>Help & Frequently Asked Questions</Text>

      <Paper
        shadow="sm"
        p="md"
      >
        <Text fz={24}>Bidding</Text>
        <Text>Placing a bid requires you to be logged in and have an account setup.</Text>
        <Text fw="bold" mt="lg">Heres steps on how to place a bid:</Text>
        <Text>1. Find the listing you wish to bid on and click on the "Bid" button.</Text>
        <Image
          src="/faq-images/bidexample1.png"
          alt="Bid Example 1"
          width={500}
          radius="sm"
        />
        <Text mt="sm">2. Enter the amount you wish to bid and click "Place Bid".</Text>
        <Image
          src="/faq-images/bidexample2.png"
          alt="Bid Example 2"
          width={500}
          radius="sm"
        />
      </Paper>

      <Paper
        shadow="sm"
        p="md"
      >
        <Text fz={24}>Notifications</Text>
        <Text>Notifications appear in the top right bell icon and are also sent as an SMS to the mobile number used for your login.</Text>
        <Text>To recieve notifications for an auction listing, the "Subscribe" button under the bid button will enable notifications for the listing. This includes:</Text>
        <List>
          <List.Item>When you have been outbid on the listing</List.Item>
          <List.Item>When the listing has less than: 24h, 12h, 6h, 3h, 1h, 30m, 15m remaining before finishing</List.Item>
          <List.Item>When the listing has finished</List.Item>
        </List>
        <Text>Once subscribed, you can always unsubscribe by clicking the "Unsubscribe" button on the listing page to stop recieving notifications.</Text>

        <Text>You will always recieve notifications for when you win a bid</Text>
      </Paper>

      <Paper
        shadow="sm"
        p="md"
      >
        <Text fz={24}>Winning Bids</Text>
        <Text>This website is purely to place bids, no payment information is stored via this website.</Text>
        <Text>When you win a bid, you will recieve a notification and an automated text message to the phone number that you logged in with.</Text>
        <Text>We will then follow up with you on organizing payment. If you do not respond or are unable to provide payment for the bid, we may reroll the bid to the next person.</Text>
      </Paper>

    </Stack>
  );
}

export default DisplayFAQ;