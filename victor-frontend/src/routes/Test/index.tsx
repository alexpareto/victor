import { AppShell, Burger, Button, Input } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styled from "@emotion/styled";
import { useState } from "react";
import axios from "axios";
import config from "@/config";
import { Program } from "@/utils/clientTypes";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Header = styled.h1`
  font-weight: bold;
`;

export const Test: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();

  const [program, setProgram] = useState<Program | null>(null);
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const generateProgram = async () => {
    setLoading(true);
    const result = await axios.post(`${config.backendHost}/api/programs`, {
      prompt: promptInput,
    });
    setProgram(result.data.program);
    setLoading(false);
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
          <Input
            placeholder="Enter your input here"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          <Button loading={loading} onClick={generateProgram}>
            Generate
          </Button>
          <div>
            {program && (
              <div>
                <Header>{program.name}</Header>
                {program.versions.map((version) => {
                  return (
                    <div style={{ maxWidth: 800, fontSize: 12 }}>
                      <h3>
                        Version {version.id} - Fitness: {version.fitness}
                      </h3>
                      <p>Body:</p>
                      <SyntaxHighlighter
                        wrapLines={true}
                        language="javascript"
                        style={docco}
                        wrapLongLines={true}
                      >
                        {`function ${version.signature} {\n${version.body
                          .split("\n")
                          .map((line) => `    ${line}`)
                          .join("\n")}\n}`}
                      </SyntaxHighlighter>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </AppShell.Main>
      </AppShell>
    </>
  );
};
