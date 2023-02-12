import React from "react";
import { Item } from "types";

import { Carousel } from '@mantine/carousel';
import {
  Group,
  ActionIcon,
  Paper,
  Text,
  Button,
  Stack,
  Image,
  Badge,
  Modal,
  NumberInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { useSocket } from "../contexts/socket.context";
import { useUser } from "../contexts/user.context";

interface DisplayItemProps {
  item: any;
  close: () => void;
}

function DisplayItem({ item, close }: DisplayItemProps) {
  const { user, subscriptions } = useUser();
  const { socket } = useSocket();

  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [itemImagePath, setItemImagePath] = React.useState<string>("");

  const [bidModalOpen, setBidModalOpen] = React.useState(false);
  // Bid Modal
  const [bidAmountCache, setBidAmountCache] = React.useState<number | undefined>(undefined);
  const [bidAmountInput, setBidAmountInput] = React.useState<number>(0);
  const [bidAmountError, setBidAmountError] = React.useState<string | undefined>(undefined);
  const [bidSubmitting, setBidSubmitting] = React.useState(false);
  const [bidSubmitError, setBidSubmitError] = React.useState<string | undefined>(undefined);

  const [subscriptionUpdating, setSubscriptionUpdating] = React.useState<boolean>(false);

  const calculateTimeRemaining = () => {
    const itemFinishUnix = item.finishUnixTimestamp;

    // Should be either
    // 1. "0d 0h 0m 0s"
    // 2. "0h 0m 0s"
    // 3. "0m 0s"
    // 4. "0s"

    const now = new Date().getTime() / 1000;
    const timeRemaining = itemFinishUnix - now;

    const days = Math.floor(timeRemaining / (60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    const seconds = Math.floor(timeRemaining % 60);

    let timeRemainingString = "";

    if (days > 0) {
      timeRemainingString += `${days}d `;
    }

    if (hours > 0) {
      timeRemainingString += `${hours}h `;
    }

    if (minutes > 0) {
      timeRemainingString += `${minutes}m `;
    }

    if (seconds > 0) {
      timeRemainingString += `${seconds}s`;
    }

    setTimeRemaining(timeRemainingString);
  }

  const toggleSubscription = () => {
    if (!socket || !user) return;
    setSubscriptionUpdating(true);
    socket.emit('toggleSubscription', item.listingId, () => {
      setSubscriptionUpdating(false);
    });
  }

  React.useEffect(() => {
    if (item.imagesPaths || [].length > 0 && item.imagesPaths.length >= item.featureImageIndex && item.featureImageIndex) {
      setItemImagePath(item.imagesPaths[item.featureImageIndex]);
    }

    if (!bidAmountCache || bidAmountCache !== item.highestBid) {
      setBidAmountInput(item.highestBid + 1);
      setBidAmountCache(item.highestBid);
    }

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [item]);

  React.useEffect(() => {
    if (bidAmountInput && bidAmountInput <= item.highestBid) {
      setBidAmountError("Bid must be higher than current bid.");
    } else {
      setBidAmountError(undefined);
    }
  }, [bidAmountInput, item]);

  const submitBid = () => {
    if (!socket) return;

    setBidSubmitting(true);
    socket.emit("placeBid", {
      itemId: item.listingId,
      bidAmount: bidAmountInput,
    }, (callback: any) => {
      if (callback.success) {
        setBidModalOpen(false);
      } else {
        setBidSubmitError(callback.message);
      }
      setBidSubmitting(false);
    });
  };

  return (
    <>
      <Modal
        opened={bidModalOpen && user && !item.finished}
        onClose={() => setBidModalOpen(false)}
        title="How much would you like to bid?"
        centered
      >
        <Stack>
          <NumberInput
            value={bidAmountInput}
            onChange={(val) => setBidAmountInput(val || 0)}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value || '0'))
                ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : '$ '
            }
            error={bidAmountError}
            disabled={bidSubmitting}
            size="lg"
          />
          <Button
            onClick={() => submitBid()}
            disabled={bidSubmitting || bidAmountError ? true : false}
            loading={bidSubmitting}
          >
            Place Bid
          </Button>
          { bidSubmitError ? <Text color="red">{ bidSubmitError }</Text> : null }
        </Stack>
      </Modal>

      <Paper
        p="lg"
        radius="lg"
        shadow="lg"
      >
        <Group>
          <ActionIcon
            onClick={close}
          >
            <IconArrowLeft size={50} />
          </ActionIcon>
        </Group>
        <Group
          sx={{ marginTop: 10 }}
          align="start"
        >
          <Stack
            sx={{ width: 300, padding: 10 }}
          >
            <Paper
              p="lg"
              radius="lg"
              shadow="lg"
              className="SpaceBackground"
            >
              <Image
                width="100%"
                fit="contain"
                src={`/api/images/${itemImagePath}`}
                alt="Item Image"
                sx={{ borderRadius: 10 }}
                withPlaceholder
              />
            </Paper>
            <Stack>
              <Button
                size="lg"
                onClick={() => {
                  if (!user) return;
                  if (item.finished) return;
                  setBidModalOpen(true);
                }}
                disabled={!user || item.finished}
              >
                { !user ? "Not logged in..." : item.finished ? "Finished" : "Place Bid" }
              </Button>
              <Button
                disabled={!user}
                color={user && subscriptions.includes(item.listingId) ? "red" : undefined}
                onClick={toggleSubscription}
                loading={subscriptionUpdating}
              >
                { !user ? "Not logged in..." : subscriptions.includes(item.listingId) ? "Unsubscribe" : "Subscribe" }
              </Button>
            </Stack>
          </Stack>
          <Stack
            sx={{ flex: 1 }}
            spacing="sm"
          >
            <Text fz={40} fw="bold">{ item.name }</Text>
            <Text fz={38}>AU ${ item.highestBid ? item.highestBid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "?" }</Text>
            <Group>
              <Badge size="lg">{ item.bidCount } Bid{ item.bidCount !== 1 ? "s" : "" }</Badge>
              <Badge size="lg" color={item.finished ? "red" : undefined}>{ !item.finished ? `${timeRemaining} left` : "Finished" }</Badge>
            </Group>
            {
              item.tags ? (
                <Group>
                  {
                    item.tags.includes(",") ? 
                      item.tags.split(",").map((tag: string, index: number) => (
                        <Badge key={index} color="gray" radius="sm">{ tag }</Badge>
                      ))
                    : (
                      <Badge key={item?.tags || "x"} color="gray" radius="sm">{ item.tags }</Badge>
                    )
                  }
                </Group>
              ) : null
            }
            <Stack sx={{ marginTop: 15 }}>
              {
                item.description ? 
                  item.description.split("\n").map((line: string, index: number) => (
                    <Text key={index}>{ line }</Text>
                  ))
                : null
              }        
            </Stack>
            {
              (item.imagesPaths || []).length > 0 ? (
                <Carousel
                  slideSize="33.333333%"
                  height={300}
                  slideGap="lg"
                  controlsOffset="xs"
                  controlSize={28}
                  loop
                  withIndicators
                  breakpoints={[
                    { maxWidth: 'md', slideSize: '50%' },
                    { maxWidth: 'sm', slideSize: '100%', slideGap: 0 },
                  ]}
                >
                  {
                    item.imagesPaths.map((image: string) => (
                      <Carousel.Slide key={image}>
                        <Image
                          src={`/api/images/${image}`}
                          fit="contain"
                          height={300}
                        />
                      </Carousel.Slide>
                    ))
                  }
                </Carousel>
              ) : null
            }
          </Stack>
        </Group>
      </Paper>
    </>
  );
}

export default DisplayItem;