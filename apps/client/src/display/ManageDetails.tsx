import React from "react";
import axios from "axios";

import {
  Text,
  Center,
  Stack,
  TextInput,
  Button,
  Paper,
} from "@mantine/core";
import { useUser } from "../contexts/user.context";

function DisplayManageDetails() {
  const { user } = useUser();

  const [firstNameInput, setFirstNameInput] = React.useState<string>(user.firstName);
  const [lastNameInput, setLastNameInput] = React.useState<string>(user.lastName);
  const [emailInput, setEmailInput] = React.useState<string>(user.email);
  const [postcodeInput, setPostcodeInput] = React.useState<string>(user.postcode);

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<boolean>(false);

  const submit = () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    axios.post("/api/user/update", {
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      postcode: postcodeInput,
    })
  }

  return (
    <Center>
      <Paper
        p="md"
        shadow="lg"
        sx={{ width: "100%", maxWidth: 500 }}
      >
        <Stack spacing="md">
          <Text size="xl">Manage Details</Text>
          <TextInput
            label="Phone Number"
            value={user.phoneNumber}
            disabled={true}
          />
          <TextInput
            label="First Name"
            value={firstNameInput}
            onChange={(e) => setFirstNameInput(e.currentTarget.value)}
          />
          <TextInput
            label="Last Name"
            value={lastNameInput}
            onChange={(e) => setLastNameInput(e.currentTarget.value)}
          />
          <TextInput
            label="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.currentTarget.value)}
          />
          <TextInput
            label="Postcode"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.currentTarget.value)}
          />

          <Button
            onClick={submit}
            loading={submitting}
          >
            Update Details
          </Button>
          {
            submitError ? (
              <Text color="red">{submitError}</Text>
            ) : null
          }
          {
            submitSuccess ? (
              <Text color="green">Successfully updated details!</Text>
            ) : null
          }
        </Stack>
      </Paper>
    </Center>
  );
}

export default DisplayManageDetails;