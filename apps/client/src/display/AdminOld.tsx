import React from "react";
import {
  Center,
  Paper,
  Text,
  TextInput,
  Stack,
  Button,
  Group,
  NumberInput,
  Table,
  Badge,
  Loader,
  Textarea,
  FileInput,
  Image,
  Checkbox,
  Modal,
  Tabs,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import axios from "axios";
import { IconArrowBack } from "@tabler/icons";

function DisplayAdmin() {
  const [activeTab, setActiveTab] = React.useState<string | null>('listings');

  const [createSubmitting, setCreateSubmitting] = React.useState<boolean>(false);
  const [createInputName, setCreateInputName] = React.useState<string>("");
  const [createInputStartingPrice, setCreateInputStartingPrice] = React.useState<number | undefined>(1);
  const [createInputReservePrice, setCreateInputReservePrice] = React.useState<number | undefined>(0);
  const [createInputFinishDate, setCreateInputFinishDate] = React.useState<any>(new Date());
  const [createInputFinishTime, setCreateInputFinishTime] = React.useState<any>(new Date());
  const [createInputHidden, setCreateInputHidden] = React.useState<boolean>(false);
  const [createSubmitError, setCreateSubmitError] = React.useState<string | undefined>(undefined);

  const [adminListings, setAdminListings] = React.useState<any[]>([]);
  const [adminListingsLoading, setAdminListingsLoading] = React.useState<boolean>(false);
  const [listingViewSelected, setListingViewSelected] = React.useState<string | undefined>(undefined);
  const [listingViewData, setListingViewData] = React.useState<any>(undefined);
  const [listingViewLoading, setListingViewLoading] = React.useState<boolean>(false);

  const [adminUsers, setAdminUsers] = React.useState<any[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = React.useState<boolean>(false);
  const [userViewSelected, setUserViewSelected] = React.useState<string | undefined>(undefined);
  const [userViewData, setUserViewData] = React.useState<any>(undefined);
  const [userViewLoading, setUserViewLoading] = React.useState<boolean>(false);
  const [userBannedInput, setUserBannedInput] = React.useState<boolean>(false);
  const [userUpdateSubmitting, setUserUpdateSubmitting] = React.useState<boolean>(false);

  const [listingUpdateSubmitting, setListingUpdateSubmitting] = React.useState<boolean>(false);
  const [listingInputName, setListingInputName] = React.useState<string>("");
  const [listingInputStartingPrice, setListingInputStartingPrice] = React.useState<number | undefined>(1);
  const [listingInputReservePrice, setListingInputReservePrice] = React.useState<number | undefined>(0);
  const [listingInputFinishDate, setListingInputFinishDate] = React.useState<any>(new Date());
  const [listingInputFinishTime, setListingInputFinishTime] = React.useState<any>(new Date());
  const [listingInputDescription, setListingInputDescription] = React.useState<string | undefined>("");
  const [listingInputHidden, setListingInputHidden] = React.useState<boolean>(false);
  const [listingUpdateResponse, setListingUpdateResponse] = React.useState<string | undefined>(undefined);
  const [timeEditModalOpened, setTimeEditModalOpened] = React.useState<boolean>(false);
  const [deleteConfirmModalOpened, setDeleteConfirmModalOpened] = React.useState<boolean>(false);
  const [listingDeleteLoading, setListingDeleteLoading] = React.useState<boolean>(false);
  const [listingDeleteButtonTimeWait, setListingDeleteButtonTimeWait] = React.useState<number>(10);

  const [listingImageInput, setListingImageInput] = React.useState<any>(undefined);
  const [listingImageUploadLoading, setListingImageUploadLoading] = React.useState<boolean>(false);
  const [listingImageUploadResponse, setListingImageUploadResponse] = React.useState<string | undefined>(undefined);
  const [listingImageSetMainLoading, setListingImageSetMainLoading] = React.useState<string | undefined>(undefined);
  const [listingImageDeleteLoading, setListingImageDeleteLoading] = React.useState<string | undefined>(undefined);

  const [bidViewSelected, setBidViewSelected] = React.useState<string | undefined>(undefined);
  const [bidViewData, setBidViewData] = React.useState<any>(undefined);
  const [bidViewLoading, setBidViewLoading] = React.useState<boolean>(false);

  const unixToString = (unix: number) => {
    // Format to DD/MM/YYYY HH:MM AM/PM
    const date = new Date(unix * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12;
    const hours12String = hours12 ? hours12 : 12;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    const dateString = date.toLocaleDateString();
    return dateString + " " + hours12String + ":" + minutesString + " " + ampm;
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
        setListingViewSelected(res.data.listingId);
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

  const submitListingUpdate = () => {
    if (listingUpdateSubmitting) return;
    setListingUpdateSubmitting(true);
    axios.post(`/api/admin/editlisting/${listingViewSelected}`, {
      name: listingInputName,
      startingPrice: listingInputStartingPrice,
      reservePrice: listingInputReservePrice,
      description: listingInputDescription,
      hidden: listingInputHidden,
    })
      .then((res) => {
        if (res.data.success) {
          setListingViewData(res.data.listing);
          setListingUpdateResponse("Listing updated successfully");
          setTimeout(() => {
            setListingUpdateResponse(undefined);
            setListingUpdateSubmitting(false);
          }, 2000);
          return;
        } else if (res.data.reason) {
          setListingUpdateResponse(res.data.reason);
        } else {
          setListingUpdateResponse("There was an error updating the listing");
        }
        setListingUpdateSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setListingUpdateResponse("There was an error updating the listing");
        setListingUpdateSubmitting(false);
      });
  }

  const submitListingImage = () => {
    if (listingImageUploadLoading) return;
    if (listingImageInput === undefined) return;
    setListingImageUploadLoading(true);
    const formData = new FormData();
    formData.append("image", listingImageInput);
    axios.post(`/api/admin/uploadimage/${listingViewSelected}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        if (res.data.success) {
          setListingImageUploadResponse("Image uploaded successfully");
          setListingViewData(res.data.listing);
          setTimeout(() => {
            setListingImageUploadResponse(undefined);
          }, 2000);
          return;
        } else if (res.data.reason) {
          setListingImageUploadResponse(res.data.reason);
        } else {
          setListingImageUploadResponse("There was an error uploading the image");
        }
      })
      .catch((err) => {
        console.error(err);
        setListingImageUploadResponse("There was an error uploading the image");
      })
      .finally(() => {
        setListingImageUploadLoading(false);
        setListingImageInput(undefined);
      })
  }

  const deleteImage = (imagePath: string) => {
    if (listingImageDeleteLoading !== undefined) return;
    setListingImageDeleteLoading(imagePath);
    axios.post(`/api/admin/deleteimage`, {
      listingId: listingViewSelected,
      imagePath: imagePath,
    })
      .then((res) => {
        if (res.data.success) {
          setListingViewData(res.data.listing);
        } else if (res.data.reason) {
          console.error(res.data.reason);
        } else {
          console.error("There was an error deleting the image");
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setListingImageDeleteLoading(undefined);
      });
  }

  const setMainImage = (imagePath: string) => {
    if (listingImageSetMainLoading !== undefined) return;
    setListingImageSetMainLoading(imagePath);
    // Get index of the image in the listing.imagesPaths array
    const imageIndex: number = listingViewData.imagesPaths.findIndex((path: string) => {
      return path === imagePath;
    });

    axios.post(`/api/admin/editlisting/${listingViewSelected}`, {
      featureImageIndex: imageIndex,
    })
      .then((res) => {
        if (res.data.success) {
          setListingViewData(res.data.listing);
        } else if (res.data.reason) {
          console.error(res.data.reason);
        } else {
          console.error("There was an error setting the main image");
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setListingImageSetMainLoading(undefined);
      });
  }

  const submitTimeEdit = () => {
    if (listingUpdateSubmitting) return;
    setListingUpdateSubmitting(true);
    setTimeEditModalOpened(false);
    axios.post(`/api/admin/editlisting/${listingViewSelected}`, {
      finishUnix: Math.floor((new Date(listingInputFinishDate).setHours(listingInputFinishTime.getHours(), listingInputFinishTime.getMinutes(), 0, 0)) / 1000)
    })
      .then((res) => {
        if (res.data.success) {
          setListingViewData(res.data.listing);
          setListingUpdateResponse("Listing updated successfully");
          setTimeout(() => {
            setListingUpdateResponse(undefined);
            setListingUpdateSubmitting(false);
          }, 2000);
          return;
        } else if (res.data.reason) {
          setListingUpdateResponse(res.data.reason);
        } else {
          setListingUpdateResponse("There was an error updating the listing");
        }
        setListingUpdateSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setListingUpdateSubmitting(true);
      });
  }

  const deleteListingModalOpen = () => {
    // Do confirmation
    if (listingDeleteLoading) return;
    setListingDeleteButtonTimeWait(5);
    setDeleteConfirmModalOpened(true);
  }

  const closeDeleteListingModalOpen = () => {
    setDeleteConfirmModalOpened(false);
  }

  const confirmDeleteListing = () => {
    if (listingDeleteLoading) return;
    // Check that timewait is 0
    if (listingDeleteButtonTimeWait !== 0) return;
    setListingDeleteLoading(true);
    axios.get(`/api/admin/deletelisting/${listingViewSelected}`)
      .then((res) => {
        if (res.data.success) {
          setListingViewSelected(undefined);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setListingDeleteLoading(false);
        setDeleteConfirmModalOpened(false);
      });
  }

  const submitUserEdit = () => {
    if (userUpdateSubmitting) return;
    setUserUpdateSubmitting(true);
    axios.post(`/api/admin/edituser/${userViewSelected}`, {
      banned: userBannedInput,
    })
      .then((res) => {
        if (res.data.success) {
          setUserViewData(res.data.user);
          setTimeout(() => {
            setUserUpdateSubmitting(false);
          }, 2000);
          return;
        }
        setUserUpdateSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setUserUpdateSubmitting(false);
      });
  }

  React.useEffect(() => {
    if (activeTab === "users") {
      setAdminUsersLoading(true);
      axios.get(`/api/admin/users`)
        .then((res) => {
          if (res.data.success) {
            setAdminUsers(res.data.users);
          } else {
            console.error(res.data.reason);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setAdminUsersLoading(false);
        });
    } else {
      setAdminUsers([]);
      setAdminUsersLoading(false);
      setUserViewSelected(undefined);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (userViewSelected) {
      // Fetch the user data
      setUserViewLoading(true);
      axios.get(`/api/admin/user/${userViewSelected}`)
        .then((res) => {
          if (res.data.success) {
            setUserViewData(res.data.user);
            setUserBannedInput(res.data.user.banned);
          } else {
            console.error(res.data.reason);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setUserViewLoading(false);
        });
    } else {
      setUserViewData(undefined);
    }
  }, [userViewSelected]);

  React.useEffect(() => {
    if (listingDeleteButtonTimeWait === 0) return;
    const interval = setInterval(() => {
      setListingDeleteButtonTimeWait((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteConfirmModalOpened])

  React.useEffect(() => {
    // Get admin listings
    setAdminListingsLoading(true);

    axios.get("/api/admin/listings").then((res) => {
      if (res.data.success) {
        setAdminListings(res.data.listings);
      }
      setAdminListingsLoading(false);
    });

    if (listingViewSelected) {
      setListingViewLoading(true);
      axios.get(`/api/admin/listing/${listingViewSelected}`)
        .then((res) => {
          if (res.data.success) {
            setListingViewData(res.data.listing);
            setListingInputName(res.data.listing.name);
            setListingInputStartingPrice(res.data.listing.startingPrice);
            setListingInputReservePrice(res.data.listing.reservePrice);
            setListingInputFinishDate(new Date(res.data.listing.finishUnix * 1000));
            setListingInputFinishTime(new Date(res.data.listing.finishUnix * 1000));
            setListingInputDescription(res.data.listing.description);
            setListingInputHidden(res.data.listing.hidden);
          }
          setListingViewLoading(false);
        })
        .catch(() => {
          setListingViewLoading(false);
        })
    } else {
      setListingViewData(undefined);
      setBidViewSelected(undefined);
    }
  }, [createSubmitting, listingViewSelected]);

  React.useEffect(() => {
    if (bidViewSelected && listingViewData) {
      setBidViewLoading(true);
      axios.get(`/api/admin/bid/${bidViewSelected}`)
        .then((res) => {
          if (res.data.success) {
            setBidViewData(res.data.bid);
          }
          setBidViewLoading(false);
        })
        .catch(() => {
          setBidViewLoading(false);
        })
    } else {
      setBidViewData(undefined);
    }
  }, [listingViewData, bidViewSelected]);

  if (userViewSelected) {
    if (userViewLoading || !userViewData) {
      return (
        <Center>
          <Paper
            p="md"
            shadow="lg"
            sx={{ minWidth: 500 }}
          >
            <Group>
              <Button
                leftIcon={<IconArrowBack />}
                onClick={() => setUserViewSelected(undefined)}
                variant="outline"
              >
                Back
              </Button>
              <Text fz={26}>Viewing user</Text>
            </Group>
            { userViewLoading ? <Loader /> : <Text>User was unable to be loaded...</Text> }
          </Paper>
        </Center>
      );
    }

    return (
      <Center>
        <Paper
          p="md"
          shadow="lg"
          sx={{ minWidth: 500 }}
        >
          <Stack>
            <Group>
              <Button
                leftIcon={<IconArrowBack />}
                onClick={() => setUserViewSelected(undefined)}
                variant="outline"
              >
                Back
              </Button>
              <Text fz={26}>Viewing user: {userViewData.userId}</Text>
            </Group>

            <Group>
              <Badge color={userViewData.status === "Banned" ? "Banned" : userViewData.status === "Admin" ? "grape" : userViewData.status === "Registered" ? "lime" : "gray"}>{userViewData.status}</Badge>
            </Group>

            <Stack spacing="sm">
              <Text>Name: {userViewData.firstName} {userViewData.lastName}</Text>
              <Text>Email: {userViewData.email}</Text>
              <Text>Phone: {userViewData.phoneNumber}</Text>
              <Text>Postcode: {userViewData.postcode}</Text>
            </Stack>


            <Stack spacing="sm">
              <Checkbox
                label="Ban user from placing bids"
                checked={userBannedInput}
                onChange={(e) => setUserBannedInput(e.currentTarget.checked)}
              />
              <Button
                onClick={submitUserEdit}
                loading={userUpdateSubmitting}
              >
                Save changes
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Center>
    );
  }

  if (bidViewSelected) {
    if (bidViewLoading || !bidViewData) {
      return (
        <Center>
          <Paper
            p="md"
            shadow="lg"
            sx={{ minWidth: 500 }}
          >
            <Group>
              <Button
                leftIcon={<IconArrowBack />}
                onClick={() => setListingViewSelected(undefined)}
                variant="outline"
              >
                Back
              </Button>
              <Text fz={26}>Viewing bid on listing: "{listingViewData.name}"</Text>
            </Group>
            { bidViewLoading ? <Loader /> : <Text>No data found for bid...</Text> }
          </Paper>
        </Center>
      );
    }

    return (
      <Center>
        <Paper
          p="md"
          shadow="lg"
          sx={{ minWidth: 500 }}
        >
          <Group>
            <Button
              leftIcon={<IconArrowBack />}
              onClick={() => setListingViewSelected(undefined)}
              variant="outline"
            >
              Back
            </Button>
            <Text fz={26}>Viewing bid on listing: "{listingViewData.name}"</Text>
          </Group>
          <Stack spacing={5} mt={10}>
            <Text>Bid Reference ID: {bidViewData.referenceId}</Text>
            <Text>Bid Amount: ${bidViewData.bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
            <Text>Placed at: {new Date(bidViewData.timeBid * 1000).toLocaleString()}</Text>
            
            <Text fw="bold" mt={10}>User Details</Text>
            <Text>Name: {bidViewData.user.firstName} {bidViewData.user.lastName}</Text>
            <Text>Phone Number: {bidViewData.user.phoneNumber}</Text>
            <Text>Email: {bidViewData.user.email}</Text>
            <Text>Postcode: {bidViewData.user.postcode}</Text>
            <Text fz="xs">User ID: {bidViewData.userId}</Text>
          </Stack>

          <Stack spacing={5} mt={10}>
            <Button
              color="red"
            >
              Delete Bid
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  if (listingViewSelected) {
    if (listingViewLoading || !listingViewData) {
      return (
        <Center>
          <Paper
            p="md"
            shadow="lg"
            sx={{ minWidth: 500 }}
          >
            <Group>
              <Button
                leftIcon={<IconArrowBack />}
                onClick={() => setListingViewSelected(undefined)}
                variant="outline"
              >
                Back
              </Button>
            </Group>
            { listingViewLoading ? <Loader /> : <Text>No data found for listing...</Text> }
          </Paper>
        </Center>
      );
    }

    return (
      <>
        <Modal
          opened={timeEditModalOpened}
          onClose={() => {
            if (listingUpdateSubmitting) return;
            setTimeEditModalOpened(false);
          }}
          title="Edit Finish Time"
        >
          <Stack>
            <Text><Text span fw="bold">Note:</Text> If editing this to a later time, this will relist the listing, so users will be able to bid again.</Text>

            <DatePicker
              label="Finish Date"
              value={listingInputFinishDate}
              onChange={(date) => setListingInputFinishDate(date)}
            />

            <TimeInput
              label="Finish Time"
              value={listingInputFinishTime}
              onChange={(time) => setListingInputFinishTime(time)}
              format="12"
            />

            <Button
              mt={10}
              onClick={submitTimeEdit}
              loading={listingUpdateSubmitting}
            >
              Submit
            </Button>
          </Stack>
        </Modal>
        <Modal
          opened={deleteConfirmModalOpened}
          onClose={closeDeleteListingModalOpen}
          title="Are you sure?"
        >
          <Stack>
            <Text fw="bold" fz={22}>Are you sure you want to delete this listing?</Text>
            <Text fw="bold" color="red" fz={26}>THIS CANNOT BE UNDONE!</Text>

            <Group grow>
              <Button
                onClick={closeDeleteListingModalOpen}
                loading={listingDeleteLoading}
              >
                Don't Delete
              </Button>
              <Button
                color="red"
                onClick={confirmDeleteListing}
                loading={listingDeleteLoading}
                disabled={listingDeleteButtonTimeWait > 0}
              >
                Delete {listingDeleteButtonTimeWait > 0 ? `(wait ${listingDeleteButtonTimeWait})` : ''}
              </Button>
            </Group>
          </Stack>
        </Modal>
        <Center>
          <Stack>
            <Paper
              p="md"
              shadow="lg"
              sx={{ minWidth: 600 }}
            >
              <Stack>
                <Group sx={{ marginBottom: 10 }}>
                  <Button
                    leftIcon={<IconArrowBack />}
                    onClick={() => setListingViewSelected(undefined)}
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Text fz={26}>Viewing listing: "{listingViewData.name}"</Text>
                </Group>
                { listingViewData.finished && listingViewData.winningBid == "belowreserve" && listingViewData.bids.length > 0 ? (
                  <Paper
                    p="md"
                    shadow="lg"
                    sx={{ backgroundColor: "#ffbe76" }}
                  >
                    <Text fw="bold" fz={22}>Finished... Bid was below reserve...</Text>
                    <Button
                      onClick={() => setBidViewSelected(listingViewData.bids[0].referenceId)}
                      mt={10}
                    >
                      View highest bid
                    </Button>
                  </Paper>
                ) : listingViewData.finished && listingViewData.winningBid == "nobids" ? (
                  <Paper
                    p="md"
                    shadow="lg"
                    sx={{ backgroundColor: "#ff7979" }}
                  >
                    <Text fw="bold" fz={22}>Finished, but no bids were placed...</Text>
                  </Paper>
                ) : listingViewData.finished && /\d/.test(listingViewData.winningBid || "") ? (
                  <Paper
                    p="md"
                    shadow="lg"
                    sx={{ backgroundColor: "#f6e58d" }}
                  >
                    <Text fw="bold" fz={22}>Finished! Here is the winning bidder!</Text>
                    <Button
                      onClick={() => setBidViewSelected(listingViewData.winningBid)}
                      mt={10}
                    >
                      View winning bidder
                    </Button>
                  </Paper>
                ) : (
                  <Paper
                    p="md"
                    shadow="lg"
                    sx={{ backgroundColor: "#c7ecee" }}
                  >
                    <Text>This listing is still active and allowing bids...</Text>
                  </Paper>
                ) }
              </Stack>
            </Paper>

            <Paper
              p="md"
              shadow="lg"
              sx={{ minWidth: 600 }}
            >
              <Stack>
                <Text fz={22}>Listing Information</Text>
                <Stack spacing={5}>
                  <TextInput
                    label="Listing Name"
                    value={listingInputName}
                    onChange={(e) => setListingInputName(e.target.value)}
                  />

                  <NumberInput
                    label="Starting Price"
                    value={listingInputStartingPrice}
                    onChange={(value) => setListingInputStartingPrice(value)}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                    formatter={(value) =>
                      !Number.isNaN(parseFloat(value || '0'))
                        ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : '$ '
                    }
                  />

                  <NumberInput
                    label="Reserve Price"
                    value={listingInputReservePrice}
                    onChange={(value) => setListingInputReservePrice(value)}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                    formatter={(value) =>
                      !Number.isNaN(parseFloat(value || '0'))
                        ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : '$ '
                    }
                  />

                  <Textarea
                    label="Description"
                    value={listingInputDescription}
                    onChange={(e) => setListingInputDescription(e.target.value)}
                  />

                  <Checkbox
                    checked={listingInputHidden}
                    onChange={(e) => setListingInputHidden(e.currentTarget.checked)}
                    label="Hidden on homepage"
                    sx={{ marginTop: 10 }}
                  />

                  <Button
                    onClick={submitListingUpdate}
                    loading={listingUpdateSubmitting}
                  >
                    Save Changes
                  </Button>
                  <Group
                    spacing="xs"
                    grow
                  >
                    <Button
                      onClick={() => setTimeEditModalOpened(true)}
                      loading={listingUpdateSubmitting}
                    >
                      Edit Finish Time / Relist Listing
                    </Button>
                    <Button
                      onClick={deleteListingModalOpen}
                      loading={listingUpdateSubmitting}
                      color="red"
                    >
                      Delete Listing
                    </Button>
                  </Group>


                  { listingUpdateResponse ? <Text color={listingUpdateResponse === "Listing updated successfully" ? "green" : undefined}>{listingUpdateResponse}</Text> : null }

                </Stack>
              </Stack>
            </Paper>
            
            <Paper
              p="md"
              shadow="lg"
              sx={{ minWidth: 600 }}
            >
              <Stack>
                <Text fz={22}>Images</Text>
                <Stack>
                  <Group
                    align="flex-end"
                  >
                    <FileInput
                      value={listingImageInput}
                      onChange={setListingImageInput}
                      label="Upload Image"
                      accept="image/png,image/jpeg"
                      sx={{ flex: 1 }}
                      disabled={listingImageUploadLoading}
                    />
                    <Button
                      onClick={submitListingImage}
                      loading={listingImageUploadLoading}
                    >
                      { listingImageUploadLoading ? "Uploading..." : "Upload"}
                    </Button>
                  </Group>
                  { listingImageUploadResponse ? <Text color={listingImageUploadResponse === "Image uploaded successfully" ? "green" : undefined}>{listingImageUploadResponse}</Text> : null }
                </Stack>
                <Stack spacing={5}>
                  {
                    (listingViewData.imagesPaths || []).length > 0 ? 
                      (listingViewData.imagesPaths || []).map((imagePath: string, index: number) => {
                        return (
                          <Paper
                            p="md"
                            shadow="lg"
                          >
                            <Group>
                              <Image
                                src={`/api/images/${imagePath}`}
                                width={300}
                                fit="contain"
                                withPlaceholder
                              />
                              <Stack>
                                <Button
                                  onClick={() => {
                                    setMainImage(imagePath);
                                  }}
                                  loading={listingImageSetMainLoading === imagePath}
                                  disabled={listingImageSetMainLoading !== undefined && listingImageSetMainLoading !== imagePath || listingViewData.featureImageIndex === index}
                                >
                                  { listingViewData.featureImageIndex === index ? "Currently main image" : "Set as main image" }
                                </Button>
                                <Button
                                  onClick={() => {
                                    deleteImage(imagePath);
                                  }}
                                  color="red"
                                  loading={listingImageDeleteLoading === imagePath}
                                  disabled={listingImageDeleteLoading !== undefined && listingImageDeleteLoading !== imagePath}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Group>
                          </Paper>
                        );
                      })
                    : <Text>No images found for listing...</Text>
                  }
                </Stack>
              </Stack>
            </Paper>
            
            <Paper
              p="md"
              shadow="lg"
              sx={{ minWidth: 600 }}
            >
              <Stack>
                <Text fz={22}>Listing Bids (Total: {listingViewData?.bids?.length || "0"})</Text>
                <Stack spacing={5}>
                  {
                    listingViewData.bids.length > 0 ? 
                      listingViewData.bids.map((bid: any, index: number) => {
                        // note: sorted highest to lowest...
                        const bidDifference = index === 0 ? 0 : listingViewData.bids[index - 1].bidAmount - bid.bidAmount;
                        return (
                          <Paper
                            p="sm"
                            shadow="md"
                          >
                            <Group sx={{ width: "100%" }}>
                              <Group>
                                <Stack spacing={4}>
                                  <Text fw="bold">{bid.user.firstName} {bid.user.lastName}</Text>
                                  <Text fz="sm">Mobile Number: {bid.user.phoneNumber}</Text>
                                </Stack>
                                <Stack spacing={4}>
                                  <Text>Bid: ${bid.bidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} <Text fz="xs" color="green" span>+ ${bidDifference}</Text></Text>
                                  <Text>Placed at: { new Date(bid.timeBid * 1000).toLocaleString() }</Text>
                                </Stack>
                              </Group>
                              <Group
                                sx={{ flex: 1 }}
                                position="right"
                              >
                                <Button onClick={() => setBidViewSelected(bid.referenceId)}>View</Button>
                              </Group>
                            </Group>
                          </Paper>
                        )
                      })
                    : <Text fw="bold">No bids to show...</Text>
                  }
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Center>
      </>
    );
  }

  return (
    <Center>
      <Stack>
        <Text fz={40}>Admin Dashboard</Text>
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="listings">Listings</Tabs.Tab>
            <Tabs.Tab value="users">Users</Tabs.Tab>
            <Tabs.Tab value="bulk">Bulk Edit Listings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="listings">
            <Stack>
              <Paper
                p="md"
                shadow="lg"
              >
                <Stack>
                  <Text fw="bold">Create new listing</Text>

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
              </Paper>
              <Paper
                p="md"
                shadow="lg"
              >
                <Stack>
                  <Group>
                    <Text fw="bold">All listings</Text>
                  </Group>
                  <Table>
                    <thead>
                      <tr>
                        <th>Listing Name</th>
                        <th>Active</th>
                        <th># of Bids</th>
                        <th>Current Bid</th>
                        <th>Finishes at</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        (adminListings || []).map((listing) => (
                          <tr key={listing.listingId}>
                            <td>{listing.name}</td>
                            <td>{!listing.finished ? <Badge color="green">Active</Badge> : <Badge color="red">Finished</Badge>} {listing.hidden ? <Badge color="gray">Hidden</Badge> : null}</td>
                            <td>{listing.bidCount}</td>
                            <td>${listing.highestBid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} {listing.startingPrice == listing.highestBid ? <Badge color="gray">Starting</Badge> : null}</td>
                            <td>{unixToString(listing.finishUnix)}</td>
                            <td><Button onClick={() => setListingViewSelected(listing.listingId)}>View</Button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </Table>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="users">
            <Stack>
              <Paper
                p="md"
                shadow="lg"
              >
                <Stack>
                  <Text fw="bold">All Users</Text>

                  {
                    adminUsersLoading ? (
                      <Text>Loading...</Text>
                    ) : (adminUsers || []).length === 0 ? (
                      <Text>No users to show...</Text>
                    ) : (
                      <Table>
                        <thead>
                          <tr>
                            <th>Mobile Number</th>
                            <th>Full Name</th>
                            <th>Bids Placed</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            adminUsers.map((user) => (
                              <tr key={user.userId}>
                                <td>{user.phoneNumber}</td>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.bids}</td>
                                <td><Badge color={user.status === "Banned" ? "Banned" : user.status === "Admin" ? "grape" : user.status === "Registered" ? "lime" : "gray"}>{user.status}</Badge></td>
                                <td><Button onClick={() => setUserViewSelected(user.userId)}>View</Button></td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </Table>
                    )
                  }
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Center>
  )
}

export default DisplayAdmin;