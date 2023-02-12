import React from "react";
import {
  Stack,
  Paper,
  Group,
  Button,
  Text,
  Badge,
  Checkbox,
  Loader,
} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";
import axios from "axios";

interface DisplayAdminUserItemProps {
  id: string;
  onBack: () => void;
  history: any[];
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminUserItem({id, onBack, addHistory}: DisplayAdminUserItemProps) {
  const [data, setData] = React.useState<any>(null);
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [userBannedInput, setUserBannedInput] = React.useState<boolean>(false);
  const [userUpdateSubmitting, setUserUpdateSubmitting] = React.useState<boolean>(false);
  const [updateResponse, setUpdateResponse] = React.useState<string | null>(null);

  const submitUpdate = () => {
    if (userUpdateSubmitting) return;
    setUserUpdateSubmitting(true);
    axios.post(`/api/admin/edituser/${id}`, {
      banned: userBannedInput,
    })
      .then((res) => {
        if (res.data.success) {
          setUpdateResponse("User updated successfully!");
          setData(res.data.user);
        } else {
          setUpdateResponse(res.data.reason);
        }
      })
      .catch((err) => {
        setUpdateResponse("An error occurred while updating the user.");
      })
      .finally(() => {
        setTimeout(() => {
          setUserUpdateSubmitting(false);
          setUpdateResponse(null);
        }, 2000);
      });
  }

  React.useEffect(() => {
    if (!id) return;
    setDataLoading(true);
    axios.get(`/api/admin/user/${id}`)
      .then((res) => {
        if (res.data.success) {
          setData(res.data.user);
          setUserBannedInput(res.data.user.banned);
        } else {
          setLoadError("An error occurred while loading the user.");
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadError("An error occurred while loading the user.");
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [id]);

  return (
    <Stack>
      <Paper
        shadow="lg"
        p="md"
      >
        <Group>
          <Button
            onClick={onBack}
            variant="outline"
            leftIcon={<IconArrowBack />}
          >
            Back
          </Button>
          <Text fz="lg" fw="bold">{ dataLoading ? "Loading user..." : !loadError && data ? `Viewing user: ${`"${data.firstName} ${data.lastName}"` || "Deleted/Lost User"}` : "Error loading bid..." }</Text>
        </Group>
      </Paper>

      {
        dataLoading ? (
          <Loader />
        ) : data ? (
          <Paper
            shadow="lg"
            p="md"
          >
            <Stack>
              <Group>
                <Badge color={data.status === "Banned" ? "Banned" : data.status === "Admin" ? "grape" : data.status === "Registered" ? "lime" : "gray"}>{data.status}</Badge>
              </Group>

              <Stack spacing="sm">
                <Text>Name: {data.firstName} {data.lastName}</Text>
                <Text>Email: {data.email}</Text>
                <Text>Phone: {data.phoneNumber}</Text>
                <Text>Postcode: {data.postcode}</Text>
              </Stack>


              <Stack spacing="sm">
                <Checkbox
                  label="Ban user from placing bids"
                  checked={userBannedInput}
                  onChange={(e) => setUserBannedInput(e.currentTarget.checked)}
                />
                <Button
                  onClick={submitUpdate}
                  loading={userUpdateSubmitting}
                >
                  Save changes
                </Button>
                { updateResponse ? <Text>{updateResponse}</Text> : null }
              </Stack>
            </Stack>
          </Paper>
        ) : null
      }
    </Stack>
  )
}

export default DisplayAdminUserItem;