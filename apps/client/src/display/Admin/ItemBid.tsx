import React from 'react';
import {
  Paper,
  Stack,
  Group,
  Button,
  Text,
  Loader,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons';
import axios from 'axios';

interface DisplayAdminBidItemProps {
  id: string;
  onBack: () => void;
  history: any[];
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminItem({id, onBack, history, addHistory}: DisplayAdminBidItemProps) {
  const [bidData, setBidData] = React.useState<any>(null);
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const lastHistory = history && history[history.length - 2] || null;
  const isBidOnListing = lastHistory && lastHistory.type === 'listing' && lastHistory.id === bidData?.listing?.listingId;

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
    if (!id) return;
    setDataLoading(true);
    axios.get(`/api/admin/bid/${id}`)
      .then((res) => {
        if (res.data.success) {
          setBidData(res.data.bid);
        }
        setDataLoading(false);
      })
      .catch(() => {
        setDataLoading(false);
      })
  }, [id]);

  return (
    <Stack mt="lg">
      <Paper
        shadow="lg"
        p="md"
      >
        <Group>
          <Button
            onClick={onBack}
            variant="outline"
            leftIcon={<IconArrowBack />}
          >
            Back
          </Button>
          <Text fz="lg" fw="bold">{ dataLoading ? "Loading bid..." : !loadError && bidData ? `Viewing bid on listing: ${`"${bidData.listing?.name}"` || "Deleted/Lost Listing"}` : "Error loading bid..." }</Text>
        </Group>
      </Paper>
      <Paper
        shadow="lg"
        p="md"
      >
        <Stack>
          {
            dataLoading ? (
              <Loader />
            ) : bidData ? (
              <Stack spacing={5} mt={10}>
                <Text>Bid Reference ID: {bidData.referenceId}</Text>
                <Text>Bid Amount: ${bidData.bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
                <Text>Placed at: {unixToString(bidData.timeBid)}</Text>
                
                <Text fw="bold" mt={10}>User Details</Text>
                <Text>Name: {bidData.user.firstName} {bidData.user.lastName}</Text>
                <Text>Phone Number: {bidData.user.phoneNumber}</Text>
                <Text>Email: {bidData.user.email}</Text>
                <Text>Postcode: {bidData.user.postcode}</Text>
                <Text fz="xs">User ID: {bidData.userId}</Text>

                <Group grow>
                  <Button
                    onClick={() => addHistory('listing', bidData.listing?.listingId)}
                  >
                    View Listing for this Bid
                  </Button>
                  <Button
                    onClick={() => addHistory('user', bidData.userId)}
                  >
                    View User
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Text>No data was returned</Text>
            )
          }
        </Stack>
      </Paper>
    </Stack>
  )
}

export default DisplayAdminItem;