import React from "react";
import {
  Grid,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Group,
  Center,
  Table,
  Paper,
  Loader,
  Checkbox,
  Button,
  Badge,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import axios from "axios";

interface DisplayAdminBulkEditProps {
  activeTab: boolean;
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminBulkEdit({ activeTab, addHistory }: DisplayAdminBulkEditProps) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loadingItems, setLoadingItems] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const [editInputName, setEditInputName] = React.useState<string>("");
  const [editInputStartingPrice, setEditInputStartingPrice] = React.useState<number | undefined>(undefined);
  const [editInputReservePrice, setEditInputReservePrice] = React.useState<number | undefined>(undefined);
  const [editInputFinishDate, setEditInputFinishDate] = React.useState<Date | undefined | null>(new Date());
  const [editInputFinishTime, setEditInputFinishTime] = React.useState<Date | undefined | null>(new Date());
  const [editInputHidden, setEditInputHidden] = React.useState<boolean>(false);

  const [editSubmitting, setEditSubmitting] = React.useState<boolean>(false);
  const [editSubmitResponse, setEditSubmitResponse] = React.useState<string | undefined>(undefined);

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

  const submitEdit = () => {
    if (editSubmitting) return;
    setEditSubmitting(true);
    setEditSubmitResponse(undefined);
    axios.post("/api/admin/bulkedit", {
      listingIds: selectedItems,
      name: editInputName || undefined,
      startingPrice: editInputStartingPrice || undefined,
      reservePrice: editInputReservePrice || undefined,
      finishUnix: (editInputFinishDate && editInputFinishTime) ? Math.floor((new Date(editInputFinishDate).setHours(editInputFinishTime.getHours(), editInputFinishTime.getMinutes(), 0, 0)) / 1000) : undefined,
      hidden: editInputHidden || undefined,
    })
      .then((res) => {
        if (res.data.success) {
          setEditSubmitResponse("Successfully submitted edit");
          setSelectedItems([]);
          fetchListings();
        } else {
          setEditSubmitResponse(res.data.message || "Failed to submit edit");
        }
      })
      .catch(() => {
        setEditSubmitResponse("Failed to submit edit");
      })
      .finally(() => {
        setEditSubmitting(false);
      });
  }
  
  const fetchListings = () => {
    if (loadingItems) return;
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
  }

  React.useEffect(() => {
    if (!activeTab) return;
    fetchListings();
  }, [activeTab]);

  return (
    <Grid mt="md">
      {/* Small left nav (unless mobile to show at top) */}
      <Grid.Col md={4} span={12}>
        <Stack>
          <Paper
            shadow="lg"
            p="md"
          >
            <Stack>
              <Text fz="lg">Changes to make to selected</Text>

              <TextInput
                label="Listing/Item Name"
                placeholder="Listing/Item Name"
                value={editInputName}
                onChange={(e) => setEditInputName(e.currentTarget.value)}
                disabled={editSubmitting}
              />
              <NumberInput
                label="Starting Price"
                placeholder="Starting Price"
                value={editInputStartingPrice}
                onChange={(value) => setEditInputStartingPrice(value)}
                disabled={editSubmitting}
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
                value={editInputReservePrice}
                onChange={(value) => setEditInputReservePrice(value)}
                disabled={editSubmitting}
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
                  value={editInputFinishDate}
                  onChange={(value) => setEditInputFinishDate(value)}
                  disabled={editSubmitting}
                />
                <TimeInput
                  label="Finish Time"
                  placeholder="Pick time"
                  withAsterisk
                  value={editInputFinishTime}
                  onChange={(value) => setEditInputFinishTime(value)}
                  format="12"
                  defaultValue={new Date()}
                  disabled={editSubmitting}
                />
              </Group>

              <Checkbox
                label="Hidden"
                checked={editInputHidden}
                onChange={(e) => setEditInputHidden(e.currentTarget.checked)}
                disabled={editSubmitting}
              />

              <Button
                onClick={submitEdit}
                disabled={editSubmitting || selectedItems.length === 0}
                loading={editSubmitting}
              >
                Apply ({selectedItems.length ? `Apply to ${selectedItems.length} listings` : "Select listings to edit"})
              </Button>
              { editSubmitResponse ? <Text>{editSubmitResponse}</Text> : null }
            </Stack>
          </Paper>
        </Stack>
      </Grid.Col>

      {/* Listing Results */}
      <Grid.Col md={8} span={12}>
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
                    <th><Checkbox
                      onChange={headerCheckboxClick}
                      checked={selectedItems.length === items.length}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                    /></th>
                    <th>Listing Name</th>
                    <th>Active</th>
                    <th># of Bids</th>
                    <th>Current Bid</th>
                    <th>Finishes</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (items || []).map((listing) => (
                      <tr key={listing.listingId}>
                        <td><Checkbox
                          checked={selectedItems.includes(listing.listingId)}
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              setSelectedItems([...selectedItems, listing.listingId]);
                            } else {
                              setSelectedItems(selectedItems.filter((id) => id !== listing.listingId));
                            }
                          }}
                        /></td>
                        <td>{listing.name}</td>
                        <td>{!listing.finished ? <Badge color="green">Active</Badge> : <Badge color="red">Finished</Badge>} {listing.hidden ? <Badge color="gray">Hidden</Badge> : null}</td>
                        <td>{listing.bidCount}</td>
                        <td>${listing.highestBid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} {listing.startingPrice == listing.highestBid ? <Badge color="gray">Starting</Badge> : null}</td>
                        <td>{unixToString(listing.finishUnix)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            </Paper>
          )
        }
      </Grid.Col>
    </Grid>
  )
}

export default DisplayAdminBulkEdit;