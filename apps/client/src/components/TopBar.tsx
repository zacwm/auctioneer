import React from 'react';
import { Indicator } from '@mantine/core';

import NotifDrawer from './Notifications/Drawer';
import { useUser } from '../contexts/user.context';
import { IconCrown, IconEdit, IconHistory, IconLogout } from '@tabler/icons';

import {
  Group,
  Paper,
  Text,
  Popover,
  Menu,
  Stack,
} from '@mantine/core';
import {
  IconBell
} from '@tabler/icons';

interface TopBarProps {
  display: string;
  setDisplay: (display: string) => void;
}

export default function TopBar({
  display,
  setDisplay,
}: TopBarProps) {
  const { user, logout, notifications } = useUser();

  const [notifDrawerOpen, setNotifDrawerOpen] = React.useState(false);

  const unreadNotifCount = (notifications || []).filter((notif: any) => !notif.read).length;

  return (
    <Stack spacing={2}>
      <Group
        position="apart"
        sx={{
          position: 'relative',
          userSelect: 'none',
        }}
        grow
      >
        <Group position="center">
          <Text
            onClick={() => setDisplay(display === "faq" ? "main" : "faq")}
            fz={20}
            sx={{ cursor: "pointer" }}
          >
            { display === "faq" ? "Close Auction Help" : "Open Auction Help" }
          </Text>
        </Group>
      </Group>

      <Group
        position="apart"
        sx={{
          position: 'relative',
          marginBottom: '1rem',
          userSelect: 'none',
        }}
        grow
      >
        <Group>
          <Popover width={500} position="bottom" withArrow shadow="md">
            <Popover.Target>
              {
                unreadNotifCount !== 0 ? (
                  <Indicator inline label={unreadNotifCount} size={18}>
                    <IconBell size={32} style={{ cursor: "pointer" }} />
                  </Indicator>
                ) : (
                  <IconBell size={32} style={{ cursor: "pointer" }} />
                )
              }
            </Popover.Target>
            <Popover.Dropdown >
              <NotifDrawer />
            </Popover.Dropdown>
          </Popover>
        </Group>

        <Group position="right">
          <Paper
            p="sm"
            radius={100}
          >
            {
              user ? (
                <Menu
                  shadow="md"
                  width={200}
                  position="bottom-end"
                >
                  <Menu.Target>
                    <Text
                      fz={24}
                      fw="normal"
                      sx={{
                        cursor: "pointer",
                      }}
                    >
                      { user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "New User" }
                    </Text>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {
                      user.admin ? (
                        <React.Fragment>
                          <Menu.Item icon={<IconCrown size={14} />} onClick={() => setDisplay(display == "admin" ? "main" : "admin")}>
                            { display !== "admin" ? "Admin Panel" : "Close Admin Panel"}
                          </Menu.Item>
                        </React.Fragment>
                      ) : null
                    }
                    <Menu.Item icon={<IconEdit size={14} />} onClick={() => setDisplay(display == "managedisplay" ? "main" : "managedisplay")}>
                      { display !== "managedisplay" ? "Manage Details" : "Close Manage Details" }
                    </Menu.Item>
                    <Menu.Item icon={<IconHistory size={14} />} onClick={() => setDisplay(display == "bidhistory" ? "main" : "bidhistory")}>
                      { display !== "bidhistory" ? "Bid History" : "Close Bid History" }
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item icon={<IconLogout size={14} />} color="red" onClick={() => logout()}>Logout</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Text 
                  fz={24}
                  fw="normal"
                  sx={{
                    cursor: "pointer",
                  }}
                  onClick={() => setDisplay(display === "login" ? "main" : "login")}
                >
                  Login
                </Text>
              )
            }
          </Paper>
        </Group>
      </Group>
    </Stack>
  );
}