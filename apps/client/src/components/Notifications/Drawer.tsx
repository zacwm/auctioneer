import React from "react";
import {
  ScrollArea,
  Text,
  Center,
  Stack,
} from "@mantine/core";

import NotifItem from "./NotifItem";
import { useUser } from "../../contexts/user.context";

function Drawer() {
  const { notifications } = useUser();

  return (
    <ScrollArea sx={{ height: 300 }} >
      <Stack>
        {
          notifications.length !== 0 ? notifications.map((notif: any, i: number) => (
            <NotifItem
              key={i}
              data={notif}
            />
          )) : (
            <Center>
              <Stack>
                <Text>No notifications yet!</Text>
                <Text>Subscribe to listings to recieve notifications via SMS and here!</Text>
              </Stack>
            </Center>
          )
        }
      </Stack>
    </ScrollArea>
  )
}

export default Drawer;