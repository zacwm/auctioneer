import React from "react";
import {
  Stack,
  Paper,
  Text,
  Table,
  Badge,
  Button,
  Grid,
  Group,
  TextInput,
} from "@mantine/core";
import axios from "axios";

interface DisplayAdminSettingsProps {
  activeTab: boolean;
  addHistory: (type: string, id: string) => void;
}

function DisplayAdminSettings({ activeTab, addHistory }: DisplayAdminSettingsProps) {
  const [tags, setTags] = React.useState<string[]>([]);

  const [inputCreateTag, setInputCreateTag] = React.useState<string>('');
  const [submittingCreateTag, setSubmittingCreateTag] = React.useState<boolean>(false);
  
  const fetchSettings = () => {
    axios.get('/api/admin/settings')
      .then((res) => {
        if (res.data.success) {
          setTags((res.data?.data?.tags || "").split(","));
        } else {
          console.log('Error fetching settings');
        }
      })
      .catch((err) => {
        console.error(err);
        console.log('Error fetching settings');
      });
  }

  const deleteTag = (tag: string) => {
    // Check that tag exists
    if (tags.indexOf(tag) === -1) {
      console.log('Tag does not exist');
      return;
    } else {
      // Filter out tag
      const newTags = tags.filter((t) => t !== tag);
      axios.post('/api/admin/updatesettings', {
        tags: newTags.join(','),
      })
        .then(() => {
          setTags(newTags);
          setInputCreateTag('');
        })
        .catch((err) => {
          console.error(err);
          console.log('Error deleting tag');
        })
        .finally(() => {
          setSubmittingCreateTag(false);
        });
    }
  }

  const createTag = () => {
    if (submittingCreateTag) return;
    setSubmittingCreateTag(true);
    // Check that tag does not exist already
    if (inputCreateTag === '') {
      console.log('Tag name cannot be empty');
      setSubmittingCreateTag(false);
      return;
    } else if (tags.indexOf(inputCreateTag) !== -1) {
      console.log('Tag already exists');
      setSubmittingCreateTag(false);
      return;
    } else {
      const newTags = [...tags, inputCreateTag];
      axios.post('/api/admin/updatesettings', {
        tags: newTags.join(','),
      })
        .then(() => {
          setTags(newTags);
          setInputCreateTag('');
        })
        .catch((err) => {
          console.error(err);
          console.log('Error creating tag');
        })
        .finally(() => {
          setSubmittingCreateTag(false);
        });
    }
  }

  React.useEffect(() => {
    if (activeTab) {
      fetchSettings();
    }
  }, [activeTab]);

  return (
    <Stack mt="md">
      <Paper
        shadow="lg"
        p="md"
      >
        <Stack>
          <Text fz={22}>Tags</Text>
          {
            (tags || []).length == 0 ? (
              <Text>No tags</Text>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    tags.map((tag, index) => (
                      <tr key={index}>
                        <td>{tag}</td>
                        <td><Button
                          color="red"
                          onClick={() => deleteTag(tag)}
                        >Delete</Button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            )
          }
          
          <Group>
            <TextInput
              placeholder="New tag name"
              value={inputCreateTag}
              onChange={(e) => setInputCreateTag(e.currentTarget.value)}
              sx={{ flex: 1 }}
            />
            <Button onClick={createTag}>Create Tag</Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default DisplayAdminSettings;