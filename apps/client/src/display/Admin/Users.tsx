import React from "react";
import {
  Stack,
  Paper,
  Text,
  Table,
  Badge,
  Button,
  Grid,
} from "@mantine/core";
import axios from "axios";

interface DisplayAdminUsersProps {
  activeTab: boolean;
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminUser({ activeTab, addHistory }: DisplayAdminUsersProps) {
  const [usersData, setUsersData] = React.useState<any[]>([]);
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeTab) return;
    setDataLoading(true);
    axios.get(`/api/admin/users`)
      .then((res) => {
        if (res.data.success) {
          setUsersData(res.data.users);
        } else {
          setLoadError("Failed to load users");
        }
      })
      .catch((err) => {
        setLoadError("Failed to load users");
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [activeTab]);

  return (
    <Grid mt="md">
      <Grid.Col span={12}>
        <Stack>
          <Paper
            p="md"
            shadow="lg"
          >
            <Stack>
              <Text fz={22}>All Users</Text>

              {
                dataLoading ? (
                  <Text>Loading...</Text>
                ) : (usersData || []).length === 0 ? (
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
                        usersData.map((user) => (
                          <tr key={user.userId}>
                            <td>{user.phoneNumber}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.bids}</td>
                            <td><Badge color={user.status === "Banned" ? "Banned" : user.status === "Admin" ? "grape" : user.status === "Registered" ? "lime" : "gray"}>{user.status}</Badge></td>
                            <td><Button size="xs" onClick={() => addHistory("user", user.userId)}>View</Button></td>
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
      </Grid.Col>
    </Grid>
  )
}

export default DisplayAdminUser;