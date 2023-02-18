import React from "react";
import {
  Grid,
  Text,
  Stack,
  Paper,
  Table,
  Button,
  Badge,
  Center,
  Loader,
  TextInput,
  NumberInput,
  Group,
  Checkbox,
  Modal,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import axios from "axios";
import { IconPlus, IconEdit } from "@tabler/icons";

interface DisplayAdminListingsProps {
  activeTab: boolean;
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminListings({ activeTab, addHistory }: DisplayAdminListingsProps) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loadingItems, setLoadingItems] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = React.useState<boolean>(false);
  const [createInputName, setCreateInputName] = React.useState<string>("");
  const [createInputStartingPrice, setCreateInputStartingPrice] = React.useState<number | undefined>(1);
  const [createInputReservePrice, setCreateInputReservePrice] = React.useState<number | undefined>(0);
  const [createInputFinishDate, setCreateInputFinishDate] = React.useState<any>(new Date());
  const [createInputFinishTime, setCreateInputFinishTime] = React.useState<any>(new Date());
  const [createInputHidden, setCreateInputHidden] = React.useState<boolean>(false);
  const [createSubmitError, setCreateSubmitError] = React.useState<string | undefined>(undefined);

  const [editModalOpen, setEditModalOpen] = React.useState<boolean>(false);

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

  const headerCheckboxClick = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.listingId));
    }
  }

  const submitCreate = () => {
    if (createSubmitting) return;
    setCreateSubmitting(true);
    setCreateSubmitError(undefined);
    const finishUnix = Math.floor((new Date(createInputFinishDate).setHours(createInputFinishTime.getHours(), createInputFinishTime.getMinutes(), 0, 0)) / 1000);
    // Check that finish unix is in the future
    if (finishUnix < Math.floor(Date.now() / 1000)) {
      setCreateSubmitError("Finish date cannot be in the past...");
      setCreateSubmitting(false);
      return;
    }

    axios.post("/api/admin/createlisting", {
      name: createInputName,
      startingPrice: createInputStartingPrice,
      reservePrice: createInputReservePrice,
      finishUnix: finishUnix,
      hidden: createInputHidden,
    }).then((res) => {
      if (res.data.success) {
        addHistory("listing", res.data.listingId);
        setCreateInputName("");
        setCreateInputStartingPrice(1);
        setCreateInputReservePrice(0);
        setCreateInputFinishDate(new Date());
        setCreateInputFinishTime(new Date());
        setCreateInputHidden(false);
      } else if (res.data.reason) {
        setCreateSubmitError(res.data.reason);
      } else {
        setCreateSubmitError("There was an error creating the listing");
      }
      setCreateSubmitting(false);
    }).catch((err) => {
      console.error(err);
      setCreateSubmitError("There was an error creating the listing");
      setCreateSubmitting(false);
    });
  }

  React.useEffect(() => {
    // TODO: Replace with the context fetching.
    if (!activeTab) return;
    // Fetch listings
    setItems([]);
    setLoadingItems(true);
    setLoadError(null);
    axios.get("/api/admin/listings")
      .then((res) => {
        if (res.data.success) {
          setItems(res.data.listings);
        } else {
          setLoadError(res.data.message);
        }
        setLoadingItems(false);
      })
      .catch(() => {
        setLoadError("Failed to load listings");
        setLoadingItems(false);
      });
  }, [activeTab]);

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={(<Text fz="lg">Create New Listing</Text>)}
      >
        <Stack>
          <TextInput
            label="Listing/Item Name"
            placeholder="Listing/Item Name"
            value={createInputName}
            onChange={(e) => setCreateInputName(e.currentTarget.value)}
            disabled={createSubmitting}
          />
          <NumberInput
            label="Starting Price"
            placeholder="Starting Price"
            value={createInputStartingPrice}
            onChange={(value) => setCreateInputStartingPrice(value)}
            disabled={createSubmitting}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value || '0'))
                ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : '$ '
            }
          />
          <NumberInput
            label="Reserve Price"
            placeholder="Reserve Price"
            value={createInputReservePrice}
            onChange={(value) => setCreateInputReservePrice(value)}
            disabled={createSubmitting}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value || '0'))
                ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : '$ '
            }
          />

          <Group grow>
            <DatePicker
              placeholder="Pick date"
              label="Event date"
              withAsterisk
              value={createInputFinishDate}
              onChange={(value) => setCreateInputFinishDate(value)}
              disabled={createSubmitting}
            />
            <TimeInput
              label="Finish Time"
              placeholder="Pick time"
              withAsterisk
              value={createInputFinishTime}
              onChange={(value) => setCreateInputFinishTime(value)}
              format="12"
              defaultValue={new Date()}
              disabled={createSubmitting}
            />
          </Group>

          <Checkbox
            label="Hidden"
            checked={createInputHidden}
            onChange={(e) => setCreateInputHidden(e.currentTarget.checked)}
            disabled={createSubmitting}
          />

          <Button
            onClick={submitCreate}
            disabled={createSubmitting}
            loading={createSubmitting}
          >
            Create
          </Button>
          { createSubmitError ? <Text color="red">{createSubmitError}</Text> : null }
        </Stack>
      </Modal>
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={(<Text fz="lg">Editing {selectedItems.length} listing{selectedItems.length !== 1 && 's'}</Text>)}
      >

      </Modal>
      <Grid mt="md">
        {/* Small left nav (unless mobile to show at top) */}
        {/*
          <Grid.Col md={4} span={12}>
            <Stack>
              <Paper
                shadow="lg"
                p="md"
              >
                
              </Paper>
            </Stack>
          </Grid.Col>
        */}

        {/* Listing Results */}
        <Grid.Col md={12} span={12}>
          <Stack>
            <Paper
              shadow="lg"
              p="md"
            >
              <Group>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  leftIcon={<IconPlus />}
                >
                  Create New Listing
                </Button>
                <Button
                  disabled={(selectedItems || []).length === 0}
                  onClick={() => setEditModalOpen(true)}
                  leftIcon={<IconEdit />}
                >
                  Make Changes To Selected {(selectedItems || []).length > 0 ? `(${selectedItems.length})` : ''}
                </Button>
              </Group>
            </Paper>
            {
              loadingItems ? (
                <Center>
                  <Loader />
                </Center>
              ) : (
                <Paper
                  shadow="lg"
                  p="md"
                >
                  <Table>
                    <thead>
                      <tr>
                        <th>
                          <Checkbox
                            onChange={headerCheckboxClick}
                            checked={selectedItems.length === items.length}
                            indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                          />
                        </th>
                        <th>Listing Name</th>
                        <th>Active</th>
                        <th># of Bids</th>
                        <th>Current Bid</th>
                        <th>Finishes</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        (items || []).map((listing) => (
                          <tr key={listing.listingId}>
                            <td>
                              <Checkbox
                                checked={selectedItems.includes(listing.listingId)}
                                onChange={(e) => {
                                  if (e.currentTarget.checked) {
                                    setSelectedItems([...selectedItems, listing.listingId]);
                                  } else {
                                    setSelectedItems(selectedItems.filter((id) => id !== listing.listingId));
                                  }
                                }}
                              />
                            </td>
                            <td>{listing.name}</td>
                            <td>{!listing.finished ? <Badge color="green">Active</Badge> : <Badge color="red">Finished</Badge>} {listing.hidden ? <Badge color="gray">Hidden</Badge> : null}</td>
                            <td>{listing.bidCount}</td>
                            <td>${listing.highestBid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} {listing.startingPrice == listing.highestBid ? <Badge color="gray">Starting</Badge> : null}</td>
                            <td>{unixToString(listing.finishUnix)}</td>
                            <td><Button onClick={() => addHistory("listing", listing.listingId)} size="xs">View</Button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </Table>
                </Paper>
              )
            }
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  )
}

export default DisplayAdminListings;