import React from "react";
import {
  Tabs,
  Text,
  Stack,
  Paper,
  Button,
} from "@mantine/core";

import AdminListings from './Listings';
import AdminUsers from './Users';
import AdminBids from './Bids';
import AdminBulk from './Bulk';
import AdminSettings from './Settings';

import ItemListing from './ItemListing';
import ItemBid from './ItemBid';
import ItemUser from './ItemUser';

interface DisplayHistoryProps {
  type: string;
  id: string;
}

function DisplayAdmin() {
  const [activeTab, setActiveTab] = React.useState<string | null>('listings');
  const [displayHistory, setDisplayHistory] = React.useState<DisplayHistoryProps[]>([]);
  
  const handleBack = () => {
    // Remove the last item from the history
    const newHistory = displayHistory.slice(0, displayHistory.length - 1);
    setDisplayHistory(newHistory);
  }

  const addHistory = (type: string, id: string) => {
    const newHistoryItem = { type, id };
    // Filter out any old hisotry that is the same as being added...
    if (displayHistory.length > 0) {
      const filtered = displayHistory.filter((history) => { return history.type !== type || history.id !== id });
      setDisplayHistory([...filtered, newHistoryItem]);
    } else {
      setDisplayHistory((prevHistory) => {
        return [...prevHistory, newHistoryItem];
      });
    }
  }

  const lastHistory = displayHistory[displayHistory.length - 1];

  if (lastHistory) {
    if (lastHistory.type === 'listing') {
      return (
        <ItemListing
          id={lastHistory.id}
          onBack={handleBack}
          history={displayHistory}
          addHistory={addHistory}
        />
      )
    } else if (lastHistory.type === 'bid') {
      return (
        <ItemBid
          id={lastHistory.id}
          onBack={handleBack}
          history={displayHistory}
          addHistory={addHistory}
        />
      )
    } else if (lastHistory.type === "user") {
      return (
        <ItemUser
          id={lastHistory.id}
          onBack={handleBack}
          history={displayHistory}
          addHistory={addHistory}
        />
      )
    } else {
      return (
        <Paper
          shadow="lg"
          p="md"
        >
          <Stack>
            <Text>There was an error loading this page...</Text>
            <Button onClick={handleBack}>
              Go Back
            </Button>
          </Stack>
        </Paper>
      )
    }
  }

  return (
    <Stack>
      <Text fz={30}>Admin Dashboard</Text>
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="listings">Listings</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="bids">Bids</Tabs.Tab>
          <Tabs.Tab value="bulk">Bulk Edit Listings</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="listings">
          <AdminListings
            activeTab={activeTab == 'listings'}
            addHistory={addHistory}
          />
        </Tabs.Panel>

        <Tabs.Panel value="users">
          <AdminUsers
            activeTab={activeTab == 'users'}
            addHistory={addHistory}
          />
        </Tabs.Panel>

        <Tabs.Panel value="bids">
          <AdminBids
            activeTab={activeTab == 'bids'}
            addHistory={addHistory}
          />
        </Tabs.Panel>

        <Tabs.Panel value="bulk">
          <AdminBulk
            activeTab={activeTab == 'bulk'}
            addHistory={addHistory}
          />
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <AdminSettings
            activeTab={activeTab == 'settings'}
            addHistory={addHistory}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

export default DisplayAdmin;