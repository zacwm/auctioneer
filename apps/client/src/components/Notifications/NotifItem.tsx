import React from "react";

import {
  Paper,
  Stack,
  Text,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconEyeCheck } from "@tabler/icons";

const titleTypes: any = {
  "timeLeft": "Not long left!",
  "finished": "Bidding has finished!",
  "outbid": "You've been outbid!",
};

interface NotifItemProps {
  data: any;
  key: number;
}

function NotifItem({ data }: NotifItemProps) {
  const parseTitle = () => {
    if (!data?.type) return "New Notification!";
    if (typeof data.type !== "string") return "New Notification!";
    if (!(data.type in titleTypes)) return "New Notification!";
    return titleTypes[data.type];
  }

  return (
    <Paper pr="md">
      <Group position="apart">
        <Stack spacing={2}>
          <Text fw="bold">{ parseTitle() }</Text>
          <Text>{ data?.message || "missing-body" }</Text>
        </Stack>
        <Group>
          <Tooltip label="Mark as Read">
            <ActionIcon radius="xl" variant="light">
              <IconEyeCheck size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  )
}

export default NotifItem;