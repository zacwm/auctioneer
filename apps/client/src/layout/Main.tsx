import React from "react";
import {
  Container,
} from "@mantine/core";
import TopBar from "../components/TopBar";

interface LayoutMainProps {
  children: React.ReactNode;
  display: string;
  setDisplay: (display: string) => void;
}

export default function LayoutMain({
  children,
  display,
  setDisplay,
}: LayoutMainProps) {
  return (
    <div id="Layout_Main">
      <Container size="xl" p="xl">
        <TopBar
          display={display}
          setDisplay={setDisplay}
        />
        { children }
      </Container>
    </div>
  )
}