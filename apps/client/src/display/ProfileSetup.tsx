import React from "react";
import { useSocket } from "../contexts/socket.context";
import { useUser } from "../contexts/user.context";

import {
  Text,
  Center,
  Stack,
  TextInput,
  Button,
  Paper,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

function DisplayProfileSetup() {
  const { socket } = useSocket();
  const { setUser } = useUser();

  const [inputFirstName, setInputFirstName] = React.useState("");
  const [inputLastName, setInputLastName] = React.useState("");
  const [inputEmail, setInputEmail] = React.useState("");
  const [inputPostcode, setInputPostcode] = React.useState("");

  const [firstNameError, setFirstNameError] = React.useState("");
  const [lastNameError, setLastNameError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [postcodeError, setPostcodeError] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");

  const [debouncedEmail] = useDebouncedValue(inputEmail, 500);
  const [debouncedPostcode] = useDebouncedValue(inputPostcode, 500);

  const [submitLoading, setSubmitLoading] = React.useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  React.useEffect(() => {
    // Check regex of email
    if (debouncedEmail.length > 0 && !validateEmail(debouncedEmail)) {
      setEmailError("Email is invalid");
    }
  }, [debouncedEmail]);

  React.useEffect(() => {
    // Check that postcode is just 4 digits
    if (debouncedPostcode.length > 0 && !String(debouncedPostcode).match(/^\d{4}$/)) {
      setPostcodeError("Postcode is invalid");
    }
  }, [debouncedPostcode]);

  const submit = () => {
    let failed = false;
    // Check that fields all have values
    if (inputFirstName.length < 1) {
      setFirstNameError("First name is required");
      failed = true;
    }
    if (inputLastName.length < 1) {
      setLastNameError("Last name is required");
      failed = true;
    }
    if (inputEmail.length < 1) {
      setEmailError("Email is required");
      failed = true;
    }
    if (!validateEmail(inputEmail)) {
      setEmailError("Email is invalid");
      failed = true;
    }
    if (inputPostcode.length < 1) {
      setPostcodeError("Postcode is required");
      failed = true;
    }
    if (!String(inputPostcode).match(/^\d{4}$/)) {
      setPostcodeError("Postcode is invalid");
      failed = true;
    }

    // Check that all passed
    if (failed) {
      return;
    }

    // Submit
    setSubmitError("");
    setSubmitLoading(true);
    setTimeout(() => { // Timeout for rendering safety.
      if (!socket) return setSubmitError("Server connection error");
      socket.emit("profileSetup", {
        firstName: inputFirstName,
        lastName: inputLastName,
        email: inputEmail,
        postcode: inputPostcode,
      }, (response: any) => {
        setSubmitLoading(false);

        if (!response) return setSubmitError("Server connection error");
        if (!response.success) {
          setSubmitError(response.message || "Unknown error");
          return;
        }

        // Success
        setUser(response.newUser);
      });
    }, 500);
  }

  return (
    <Center>
      <Paper
        p="md"
        shadow="lg"
      >
        <Stack spacing={30}>
          <Stack
            align="center"
            spacing={5}
          >
            <Text fz={36} fw="bold">Time to setup your profile!</Text>
            <Text>Setting up your profile is required to place bids...</Text>
            <Text color="blue" underline>You can sign out if you don't want to setup your profile.</Text>
          </Stack>
          <Stack>
            <TextInput
              label="First Name"
              placeholder="Enter your first name"
              value={inputFirstName}
              onChange={(event) => {
                setFirstNameError("");
                setInputFirstName(event.currentTarget.value);
              }}
              error={firstNameError}
            />
            <TextInput
              label="Last Name"
              placeholder="Enter your last name"
              value={inputLastName}
              onChange={(event) => {
                setLastNameError("");
                setInputLastName(event.currentTarget.value);
              }}
              error={lastNameError}
            />
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={inputEmail}
              onChange={(event) => {
                setEmailError("");
                setInputEmail(event.currentTarget.value);
              }}
              error={emailError}
            />
            <TextInput
              label="Postcode"
              placeholder="Enter your postcode"
              value={inputPostcode}
              onChange={(event) => {
                setPostcodeError("");
                setInputPostcode(event.currentTarget.value);
              }}
              error={postcodeError}
            />
            <Text><Text span fw="bold">Note:</Text> More personal details will be requested directly when you win a bid...</Text>
          </Stack>
          <Button
            size="lg"
            onClick={submit}
          >
            Submit
          </Button>
          {
            submitError ? (
              <Text color="red">{submitError}</Text>
            ) : null
          }
        </Stack>
      </Paper>
    </Center>
  )
}

export default DisplayProfileSetup;