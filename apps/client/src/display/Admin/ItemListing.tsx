import React from "react";
import {
  Paper,
  Text,
  Button,
  Group,
  Stack,
  Loader,
  TextInput,
  NumberInput,
  Textarea,
  Checkbox,
  Modal,
  FileInput,
  Image,
  MultiSelect,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { IconArrowBack } from "@tabler/icons";
import axios from "axios";
import { useGeneral } from "../../contexts/general.context";

interface DisplayAdminListingItemProps {
  id: string;
  onBack: () => void;
  history: any[];
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminItemListing({ id, onBack, addHistory }: DisplayAdminListingItemProps) {
  const { tags } = useGeneral();
  const [listingData, setListingData] = React.useState<any>(null);
  const [loadingListing, setLoadingListing] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [listingInputName, setListingInputName] = React.useState<string>("");
  const [listingInputStartingPrice, setListingInputStartingPrice] = React.useState<number | undefined>(0);
  const [listingInputReservePrice, setListingInputReservePrice] = React.useState<number | undefined>(0);
  const [listingInputFinishDate, setListingInputFinishDate] = React.useState<Date | null>(new Date());
  const [listingInputFinishTime, setListingInputFinishTime] = React.useState<Date | null>(new Date());
  const [listingInputDescription, setListingInputDescription] = React.useState<string>("");
  const [listingInputHidden, setListingInputHidden] = React.useState<boolean>(false);
  const [listingInputTags, setListingInputTags] = React.useState<string[]>([]);
  const [listingInputAdminNotes, setListingInputAdminNotes] = React.useState<string>("");

  const [timeEditModalOpened, setTimeEditModalOpened] = React.useState<boolean>(false);

  const [deleteConfirmModalOpened, setDeleteConfirmModalOpened] = React.useState<boolean>(false);
  const [listingDeleteLoading, setListingDeleteLoading] = React.useState<boolean>(false);
  const [listingDeleteButtonTimeWait, setListingDeleteButtonTimeWait] = React.useState<number>(5);

  const [listingUpdateSubmitting, setListingUpdateSubmitting] = React.useState<boolean>(false);
  const [listingUpdateResponse, setListingUpdateResponse] = React.useState<string | null | undefined>(null);

  const [listingImageInput, setListingImageInput] = React.useState<any>(undefined);
  const [listingImageUploadLoading, setListingImageUploadLoading] = React.useState<boolean>(false);
  const [listingImageUploadResponse, setListingImageUploadResponse] = React.useState<string | undefined>(undefined);
  const [listingImageSetMainLoading, setListingImageSetMainLoading] = React.useState<string | undefined>(undefined);
  const [listingImageDeleteLoading, setListingImageDeleteLoading] = React.useState<string | undefined>(undefined);

  const submitListingUpdate = () => {
    if (listingUpdateSubmitting) return;
    setListingUpdateSubmitting(true);
    axios.post(`/api/admin/editlisting/${id}`, {
      name: listingInputName,
      startingPrice: listingInputStartingPrice,
      reservePrice: listingInputReservePrice,
      description: listingInputDescription,
      hidden: listingInputHidden,
      adminNotes: listingInputAdminNotes,
      tags: listingInputTags.length > 0 ? listingInputTags.join(",") : "",
    })
      .then((res) => {
        if (res.data.success) {
          setListingData(res.data.listing);
          setListingUpdateResponse("Listing updated successfully");
          setTimeout(() => {
            setListingUpdateResponse(null);
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

  const submitTimeEdit = () => {
    if (listingUpdateSubmitting) return;
    if (!listingInputFinishDate || !listingInputFinishTime) return;
    setListingUpdateSubmitting(true);
    setTimeEditModalOpened(false);
    axios.post(`/api/admin/editlisting/${id}`, {
      finishUnix: Math.floor((new Date(listingInputFinishDate).setHours(listingInputFinishTime.getHours(), listingInputFinishTime.getMinutes(), 0, 0)) / 1000)
    })
      .then((res) => {
        if (res.data.success) {
          listingData(res.data.listing);
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
    // Do confirmation time waiting...
    if (listingDeleteLoading) return;
    setListingDeleteButtonTimeWait(5);
    setDeleteConfirmModalOpened(true);
  }

  // Once the confirm allow countdown is over...
  const confirmDeleteListing = () => {
    if (listingDeleteLoading) return;
    // Check that timewait is 0
    if (listingDeleteButtonTimeWait !== 0) return;
    setListingDeleteLoading(true);
    axios.get(`/api/admin/deletelisting/${id}`)
      .then((res) => {
        if (res.data.success) {
          onBack();
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

  const closeDeleteListingModalOpen = () => {
    setDeleteConfirmModalOpened(false);
  }

  const submitListingImage = () => {
    if (listingImageUploadLoading) return;
    if (listingImageInput === undefined) return;
    setListingImageUploadLoading(true);
    const formData = new FormData();
    formData.append("image", listingImageInput);
    axios.post(`/api/admin/uploadimage/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        if (res.data.success) {
          setListingImageUploadResponse("Image uploaded successfully");
          setListingData(res.data.listing);
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
      listingId: id,
      imagePath: imagePath,
    })
      .then((res) => {
        if (res.data.success) {
          setListingData(res.data.listing);
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
    const imageIndex: number = listingData.imagesPaths.findIndex((path: string) => {
      return path === imagePath;
    });

    axios.post(`/api/admin/editlisting/${id}`, {
      featureImageIndex: imageIndex,
    })
      .then((res) => {
        if (res.data.success) {
          setListingData(res.data.listing);
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

  React.useEffect(() => {
    axios.get(`/api/admin/listing/${id}`)
      .then((res) => {
        if (res.data.success) {
          setListingData(res.data.listing);
          setListingInputName(res.data.listing.name);
          setListingInputStartingPrice(res.data.listing.startingPrice);
          setListingInputReservePrice(res.data.listing.reservePrice);
          setListingInputFinishDate(new Date(res.data.listing.finishUnix * 1000));
          setListingInputFinishTime(new Date(res.data.listing.finishUnix * 1000));
          setListingInputDescription(res.data.listing.description);
          setListingInputHidden(res.data.listing.hidden);
          setListingInputTags(res.data.listing.tags.includes(",") ? res.data.listing.tags.split(",") : [res.data.listing.tags]);
          setListingInputAdminNotes(res.data.listing.adminNotes);
        } else {
          setLoadError(res.data.message);
        }
      })
      .catch(() => {
        setLoadError("Failed to load listing");
      })
      .finally(() => {
        setLoadingListing(false);
      });
  }, [id]);

  React.useEffect(() => {
    if (listingDeleteButtonTimeWait === 0) return;
    const interval = setInterval(() => {
      setListingDeleteButtonTimeWait((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteConfirmModalOpened]);

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
      <Stack>
        <Paper
          shadow="lg"
          p="md"
        >
          <Stack>
            <Group>
              <Button
                onClick={onBack}
                variant="outline"
                leftIcon={<IconArrowBack />}
              >
                Back
              </Button>
              <Text fz="lg" fw="bold">Viewing Listing: {loadingListing ? id : listingData ? `"${listingData.name}" (ID: ${id})` : id}</Text>
            </Group>
            {
              loadingListing || !listingData ? null : listingData.finished && listingData.winningBid == "belowreserve" && listingData.bids.length > 0 ? (
                <Paper
                  p="md"
                  shadow="lg"
                  sx={{ backgroundColor: "#ffbe76" }}
                >
                  <Text fw="bold" fz={22}>Finished... Bid was below reserve...</Text>
                  <Button
                    onClick={() => addHistory("bid", listingData.bids[0].referenceId)}
                    mt={10}
                  >
                    View highest bid
                  </Button>
                </Paper>
              ) : listingData.finished && listingData.winningBid == "nobids" ? (
                <Paper
                  p="md"
                  shadow="lg"
                  sx={{ backgroundColor: "#ff7979" }}
                >
                  <Text fw="bold" fz={22}>Finished, but no bids were placed...</Text>
                </Paper>
              ) : listingData.finished && /\d/.test(listingData.winningBid || "") ? (
                <Paper
                  p="md"
                  shadow="lg"
                  sx={{ backgroundColor: "#f6e58d" }}
                >
                  <Text fw="bold" fz={22}>Finished! Here is the winning bidder!</Text>
                  <Button
                    onClick={() => addHistory("bid", listingData.winningBid)}
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
              )
            }
          </Stack>
        </Paper>
        {
          loadingListing ? (
            <Loader />
          ) : (
            <React.Fragment>

              <Paper
                shadow="lg"
                p="md"
              >
                <Stack>
                  <Text fz={22}>Listing Details</Text>
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

                      <MultiSelect
                        label="Tags"
                        data={tags.map((tag: string) => ({ label: tag, value: tag }))}
                        value={listingInputTags}
                        onChange={(value) => setListingInputTags(value)}
                      />

                      <Textarea
                        label="Admin Notes"
                        value={listingInputAdminNotes}
                        onChange={(e) => setListingInputAdminNotes(e.target.value)}
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
                    <Group>
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
                      (listingData.imagesPaths || []).length > 0 ? 
                        (listingData.imagesPaths || []).map((imagePath: string, index: number) => {
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
                                    disabled={listingImageSetMainLoading !== undefined && listingImageSetMainLoading !== imagePath || listingData.featureImageIndex === index}
                                  >
                                    { listingData.featureImageIndex === index ? "Currently main image" : "Set as main image" }
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
                  <Text fz={22}>Listing Bids (Total: {listingData?.bids?.length || "0"})</Text>
                  <Stack spacing={5}>
                    {
                      listingData.bids.length > 0 ? 
                      listingData.bids.map((bid: any, index: number) => {
                          // note: sorted highest to lowest...
                          const bidDifference = index === 0 ? 0 : listingData.bids[index - 1].bidAmount - bid.bidAmount;
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
                                  <Button onClick={() => addHistory("bid", bid.referenceId)}>View</Button>
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
            </React.Fragment>
          )
        }
      </Stack>
    </>
  )
}

export default DisplayAdminItemListing;