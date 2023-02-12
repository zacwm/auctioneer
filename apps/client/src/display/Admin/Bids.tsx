import React from "react";
import {
  Stack,
  Paper,
  Table,
  Text,
  Loader,
  Button,
} from "@mantine/core";
import axios from "axios";

interface DisplayAdminBidsProps {
  activeTab: boolean;
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminBids({activeTab, addHistory}: DisplayAdminBidsProps) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loadingItems, setLoadingItems] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [loadAfter, setLoadAfter] = React.useState<number>(0);

  const unixToString = (unix: number) => {
    // Format to DD/MM/YYYY HH:MM AM/PM
    const date = new Date(unix * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12;
    const hours12String = hours12 ? hours12 : 12;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${hours12String}:${minutesString}${ampm}`;
  }

  React.useEffect(() => {
    if (!activeTab) return;
    // Fetch listings
    setItems([]);
    setLoadingItems(true);
    setLoadError(null);
    axios.get("/api/admin/bids/0")
      .then((res) => {
        if (res.data.success) {
          setItems(res.data.bids);
        } else {
          setLoadError(res.data?.message || "Failed to load bids");
        }
        setLoadingItems(false);
      })
      .catch(() => {
        setLoadError("Failed to load bids");
        setLoadingItems(false);
      });
  }, [activeTab]);

  // Do Load More request here...

  return (
    <Stack mt="md">
      <Paper
        shadow="lg"
        p="md"
      >
        <Stack>
          <Text fz={22}>All Bids</Text>
          {
            loadingItems ? (
              <Loader />
            ) : loadError ? (
              <Text>{loadError}</Text>
            ) : (items || []).length === 0 ? (
              <Text>No bids to show...</Text>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Listing</th>
                    <th>Bid Amount</th>
                    <th>Placed at</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (items || []).map((bid) => (
                      <tr key={bid.referenceId}>
                        <td>{bid.user?.firstName && bid.user?.lastName ? `${bid.user.firstName} ${bid.user.lastName}` : "Unknown User"}</td>
                        <td>{bid.listing?.name || "Unknown or Deleted"}</td>
                        <td>${bid.bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                        <td>{unixToString(bid.timeBid)}</td>
                        <td><Button onClick={() => addHistory("bid", bid.referenceId)}>View</Button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            )
          }
        </Stack>
      </Paper>
    </Stack>
  )
}

export default DisplayAdminBids;