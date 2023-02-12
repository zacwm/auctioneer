import React from "react";
import {
  Center,
  Paper,
  Text,
  TextInput,
  Stack,
  Button,
} from "@mantine/core";
import axios from "axios";
import { useUser } from "../contexts/user.context";

interface DisplayLoginProps {
  setLoginButtonUseable: React.Dispatch<React.SetStateAction<boolean>>;
  setToken: (token: string) => void;
}

function DisplayLogin({ setLoginButtonUseable, setToken }: DisplayLoginProps) {
  const { setUser } = useUser();
  const [loginState, setLoginState] = React.useState<"mobile" | "code">("mobile");
  const [mobileInput, setMobileInput] = React.useState<string>("");
  const [codeInput, setCodeInput] = React.useState<string>("");

  const [mobileError, setMobileError] = React.useState<string | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);

  const submitMobile = () => {
    if (mobileInput.length === 0) {
      setMobileError("Please enter a mobile number");
      return;
    }

    axios.post("/api/auth/requestCode", {
      phoneNumber: mobileInput,
    })
      .then((res) => {
        setLoginState("code");
      })
      .catch((err) => {
        console.error(err);
        setMobileError("There was an error sending the code");
      });
  }

  const submitCode = () => {
    if (codeInput.length === 0) {
      setCodeError("Please enter a code");
      return;
    }

    axios.post("/api/auth/verifyCode", {
      phoneNumber: mobileInput,
      code: codeInput,
    })
      .then((res) => {
        if (res.status === 200) {
          setToken(res.data.accesstoken);
          setUser(res.data.user);
        } else {
          setCodeError("There was an error verifying the code");
        }
      })
      .catch((err) => {
        console.error(err);
        setCodeError("There was an error verifying the code");
      });
  }

  return (
    <Center>
      <Paper
        p="lg"
        shadow="lg"
        sx={{ width: 500 }}
      >
        <Stack>
          <Text fz={36}>Login with Mobile</Text>
          <p>All thats needed to login is a mobile number that you can get a code from via text messages to login.</p>
          {
            loginState === "mobile" ? (
              <Stack>
                <TextInput
                  label="Mobile Number"
                  placeholder="Enter your mobile number"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.currentTarget.value)}
                  size="md"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitMobile();
                    }
                  }}
                />
                <Button
                  onClick={submitMobile}
                >
                  Send Code
                </Button>
                {
                  mobileError ? (
                    <Text color="red">{ mobileError }</Text>
                  ) : null
                }
              </Stack>
            ) : loginState === "code" ? (
              <Stack>
                <Text>Login code was sent to <Text span fw="bold">{ mobileInput }</Text></Text>
                <TextInput
                  label="Code"
                  placeholder="Enter the code sent to your mobile"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.currentTarget.value)}
                  size="md"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitCode();
                    }
                  }}
                />
                <Button
                  onClick={submitCode}
                >
                  Submit Code
                </Button>
                {
                  codeError ? (
                    <Text color="red">{ codeError }</Text>
                  ) : null
                }
              </Stack>
            ) : null
          }
        </Stack>
      </Paper>
    </Center>
  )
}

export default DisplayLogin;