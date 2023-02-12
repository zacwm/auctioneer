import React from "react";
import {
  Paper,
  Group,
  Stack,
  Text,
  Table,
} from "@mantine/core";
import { useUser } from "../contexts/user.context";

function DisplayBidHistory() {
  const { bids } = useUser();

  return (
    <div>
      <Paper
        shadow="lg"
        p="md"
      >
        <Stack>
          <Text fz={24}>Your Bid History</Text>
          {
            (bids || []).length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (bids || []).map((bid: any) => (
                      <tr key={bid._id}>
                        <td>{bid.listingId}</td>
                        <td>${bid.bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                        <td>{new Date(bid.timeBid * 1000).toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            ) : (
              <Text>No bids to show...</Text>
            )
          }
        </Stack>
      </Paper>
    </div>
  );
}

export default DisplayBidHistory;