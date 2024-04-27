import { AppShell, Burger, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styled from "@emotion/styled";
import { useState } from "react";
import axios from "axios";
import config from "@/config";

const TestElement = styled.div`
  color: blue;
`;

export const Test: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();

  const [data, setData] = useState<{ name: string | null }[]>([]);

  const loadData = async () => {
    const result = await axios.get(`${config.backendHost}/api/test-model`);
    setData(result.data);
  };

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>Logo</div>
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

        <AppShell.Main>
          <TestElement>
            {data.map(({ name }) => (
              <p>{name}</p>
            ))}
          </TestElement>
          <Button onClick={loadData}>Load data</Button>
        </AppShell.Main>
      </AppShell>
    </>
  );
};
