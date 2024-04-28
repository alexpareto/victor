import {
  AppShell,
  Burger,
  Button,
  Center,
  Container,
  Drawer,
  Input,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styled from "@emotion/styled";
import { useState } from "react";
import axios from "axios";
import config from "@/config";
import { ProgramGraph } from "@/components/Graph";
import { Program, ProgramVersion } from "../utils/clientTypes";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Header = styled.h1`
  font-weight: bold;
`;

export const Test: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

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
    pollForPrograms(result.data.program.id);
  };

  const pollForPrograms = (programId: string) => {
    setInterval(async () => {
      const result = await axios.get(
        `${config.backendHost}/api/programs/${programId}`,
      );
      setProgram(result.data.program);
    }, 2000);
  };

  return (
    <AppShell
      style={{
        height: "100vh",
        width: "100vw",
        paddingTop: 30,
        position: "relative",
      }}
    >
      <Center style={{ flexDirection: "column" }}>
        <Container>
          <Center style={{ flexDirection: "column" }}>
            <Title>RARG</Title>
            <Input
              placeholder="What are you looking for?"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              style={{ width: 800, paddingBottom: 30 }}
            />
            <Button loading={loading} onClick={generateProgram}>
              RARG it
            </Button>
            <div>
              {program && (
                <div>
                  <div style={{ height: "100%", width: "100%" }}>
                    <ProgramGraph
                      programs={[program]}
                      onOpenModal={(content) => {
                        setModalContent(content);
                        setModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Center>
        </Container>
      </Center>
      <Drawer
        opened={isModalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
      >
        <SyntaxHighlighter
          wrapLines={true}
          language="javascript"
          style={docco}
          wrapLongLines={true}
        >
          {modalContent}
        </SyntaxHighlighter>
      </Drawer>
    </AppShell>
  );
};
