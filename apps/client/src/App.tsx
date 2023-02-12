import React from 'react';
import {
  Grid,
  Text,
  Center,
  Loader,
  Stack,
  MultiSelect,
  Checkbox,
  Group,
  TextInput,
  Button,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useAdmin } from './contexts/admin.context';
import { useGeneral } from './contexts/general.context';
import { useSocket } from './contexts/socket.context';
import { useUser } from './contexts/user.context';

import LayoutMain from './layout/Main';
import DisplayAdmin from './display/Admin';
import DisplayLogin from './display/Login';
import DisplayItem from './display/Item';
import ItemCard from './components/ItemCard';
import DisplayProfileSetup from './display/ProfileSetup';
import DisplayBidHistory from './display/BidHistory';
import DisplayManageDetails from './display/ManageDetails';
import DisplayFAQ from './display/FAQ';

function App() {
  const { ref, height } = useElementSize();
  const { tags, setTags } = useGeneral();
  const { socket } = useSocket();
  const {
    setToken,
    accesstoken,
    user,
    setUser,
    setSubscriptions,
    setNotifications,
    setBids,
  } = useUser();
  const { listings: adminListings } = useAdmin();

  const [loadingItems, setLoadingItems] = React.useState<boolean>(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [display, setDisplay] = React.useState<string>('');
  const [adminShowHiddenSelected, setAdminShowHiddenSelected] = React.useState<boolean>(false);
  const [tagsSelected, setTagsSelected] = React.useState<string[]>([]);

  const listingItems = adminShowHiddenSelected ? adminListings : items;
  
  const listingItemsFiltered = listingItems.filter((item) => {
    const parsedTagsToArray = (item?.tags || "").length > 0 ? item.tags.includes(",") ? item.tags.split(',') : [item.tags] : [];
    // Return items that at contain at least all of the selected tags, but can contain more that are not selected
    return tagsSelected.length > 0 ? tagsSelected.every((tag) => parsedTagsToArray.includes(tag)) : true;
  });

  React.useEffect(() => {
    window.parent.postMessage({ height: height + 20 }, "*");
  }, [height]);

  React.useEffect(() => {
    if (!socket) return;

    const AuthEmit = () => {
      if (!accesstoken) return;
      console.debug("Setting socket login...");
      socket.emit('setLoginToken', accesstoken, (response: any) => {
        if (!response?.user) return;
        setUser(response.user);
        setSubscriptions(response.subscriptions);
        setNotifications(response.notifications);
        setBids(response.bids);
      });
    }

    AuthEmit();

    const se_connect = () => {
      console.debug('Socket connected');
      AuthEmit();

      socket.emit('getItems', (response: any) => {
        if (!response?.items) return;
        setItems(response.items);
        setTags(response.tags);
        setLoadingItems(false);
      });
    }

    const se_disconnect = () => {
      console.debug('Socket disconnected');
    }

    const se_itemsUpdate = (items: any) => {
      setItems(items);
    }
    
    const se_subscriptionUpdate = (data: any) => {
      setSubscriptions(data.subscriptions);
    }

    const se_notificationUpdate = (notifications: any) => {
      setNotifications(notifications);
    }

    socket.on('connect', se_connect);
    socket.on('disconnect', se_disconnect);
    socket.on('itemsUpdate', se_itemsUpdate);
    socket.on('subscriptionUpdate', se_subscriptionUpdate);
    socket.on('notificationUpdate', se_notificationUpdate);

    return () => {
      socket.off('connect', se_connect);
      socket.off('disconnect', se_disconnect);
      socket.off('itemsUpdate', se_itemsUpdate);
      socket.off('subscriptionUpdate', se_subscriptionUpdate);
      socket.off('notificaitonUpdate', se_notificationUpdate);
    }
  }, [socket, accesstoken]);

  return (
    <div ref={ref}>
      <LayoutMain
        display={display}
        setDisplay={(display: string) => setDisplay(display)}
      >
        {
          user && !user.profileSetup ? (
            <DisplayProfileSetup />
          ) : display == "login" && !user ? (
            <DisplayLogin
              setLoginButtonUseable={() => {}}
              setToken={(token) => {
                setToken(token);
                setDisplay("main");
              }}
            />
          ) : display == "admin" && user ? (
            <DisplayAdmin />
          ) : display == "faq" ? (
            <DisplayFAQ />
          ): display == "bidhistory" ? (
            <DisplayBidHistory />
          ) : display == "managedisplay" ? (
            <DisplayManageDetails />
          ) : (selectedItem && listingItems.find((item) => item.listingId === selectedItem)) ? (
            <DisplayItem
              item={listingItems.find((item) => item.listingId === selectedItem)}
              close={() => setSelectedItem(null)}
            />
          ) : (
            <Stack>
              <Group>
                <MultiSelect
                  data={tags.map((tag: string) => ({ label: tag, value: tag }))}
                  value={tagsSelected}
                  onChange={(value) => setTagsSelected(value)}
                  placeholder="Filter by tags"
                  sx={{ flex: 1 }}
                />
                {
                  user && user.admin ? (
                    <Checkbox
                      label="[Admin] Show hidden"
                      checked={adminShowHiddenSelected}
                      onChange={(event) => setAdminShowHiddenSelected(event.currentTarget.checked)}
                    />
                  ) : null
                }
              </Group>
              <Grid
                gutterXl={20}
                justify="center"
                sx={{
                  width: '100%',
                }}
              >
                {
                  listingItemsFiltered.length > 0 ?
                    listingItemsFiltered.map((item) => (
                      <Grid.Col md={6} lg={3} span={12} key={item.listingId}>
                        <ItemCard
                          item={item}
                          onClick={() => setSelectedItem(`${item.listingId}`)}
                        />
                      </Grid.Col>
                    ))
                    : loadingItems ? (
                      <Grid.Col span={12}>
                        <Center>
                          <Loader size="lg" />
                        </Center>
                      </Grid.Col>
                    ) : (
                      <Grid.Col span={12}>  
                        <Center>
                          <Text sx={{ marginTop: 40 }} fz={30}>No items are listed right now...</Text>
                        </Center>
                      </Grid.Col>
                    )
                }
              </Grid>
            </Stack>
          )
        }
      </LayoutMain>
    </div>
  )
}

export default App;
