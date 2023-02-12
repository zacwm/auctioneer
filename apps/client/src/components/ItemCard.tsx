import React from "react";
import { Item } from "types";
import {
  Box,
  Center,
  Text,
  Paper,
  Image,
  AspectRatio,
  Stack,
  Badge,
} from "@mantine/core";
import Tilt from "react-parallax-tilt";

interface ItemCardProps {
  item: any;
  onClick: () => void;
}

export default function ItemCard({ item, onClick  }: ItemCardProps) {
  const [lessThan24Hours, setLessThan24Hours] = React.useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [itemImagePath, setItemImagePath] = React.useState<string>("");

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
    } else {
      setLessThan24Hours(true);
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

  React.useEffect(() => {
    if (item.imagesPaths || [].length > 0 && item.imagesPaths.length >= item.featureImageIndex && item.featureImageIndex) {
      setItemImagePath(item.imagesPaths[item.featureImageIndex]);
    }

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [item]);

  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
    >
      <AspectRatio ratio={51 / 89} sx={{ maxWidth: 300 }} mx="auto">
          <Paper
            p="lg"
            radius="lg"
            shadow="lg"
            sx={{
              cursor: "pointer",
              opacity: item?.hidden ? 1 : 1,
            }}
            className="SpaceBackground HoverGrow"
            onClick={onClick}
          >
            <Stack
              align="center"
              justify="flex-start"
              sx={{ width: "100%" }}
            >
              <Image
                height={300}
                fit="contain"
                src={`/api/images/${itemImagePath}`}
                alt="Item Image"
                sx={{ borderRadius: 10 }}
                withPlaceholder
              />
              <Stack
                sx={{ flex: 1, width: "90%" }}
                spacing={0}
              >
                <Text fz={28} sx={{ margin: 0 }}>{ item.name }</Text>
                <Text fz={40} fw={600} sx={{ margin: 0 }}>${ item.highestBid ? item.highestBid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : "?" }</Text>
                <Center>
                  <div className="flex">
                    {
                      lessThan24Hours && !item.finished ? (
                        <Badge
                          size="lg"
                          className="absolute ItemCardBadgePing"
                        >
                          {item.bidCount} bids - {timeRemaining} left
                        </Badge>
                      ) : null
                    }
                    <Badge size="lg" color={item.finished ? "red" : undefined}>
                      {item.bidCount} bids - { !item.finished ? `${timeRemaining} left` : "Finished" }
                    </Badge>
                  </div>
                </Center>
              </Stack>
            </Stack>
          </Paper>
      </AspectRatio>
    </Tilt>
  )
}