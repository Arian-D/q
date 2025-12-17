import { Alert, TextInput } from "@inkjs/ui";
import { Box, render, Text } from "ink";
import React, { type ReactNode, useEffect, useState } from "react";
import { Ollama } from "@langchain/ollama";

interface OllamaTextProps {
  prompt: string;
}

function OllamaText({ prompt }: OllamaTextProps) {
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
    const ollama = new Ollama({
      baseUrl: "http://localhost:11434",
      // TODO: Pick the model based on system resources
      model: "goekdenizguelmez/JOSIEFIED-Qwen3:1.7b",
    });
    ollama.stream(
      prompt,
    ).then(async (result) => {
      for await (const chunk of result) {
        setResponse((prev: string) => prev + chunk);
      }
    }).catch((err) => {
      setError(err);
    });
  }, [prompt]);
  if (error) {
    const children: ReactNode = String(error);
    // deno-lint-ignore jsx-no-children-prop
    return <Alert variant="error" children={children} />;
  }
  return <Text color="cyanBright">{response}</Text>;
}

function Main() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <Box flexDirection="column">
      <Box
        padding={0}
        gap={1}
        borderStyle="round"
        borderColor="green"
      >
        <TextInput
          isDisabled={submitted}
          placeholder="Prompt..."
          onChange={setValue}
          onSubmit={() => setSubmitted(true)}
        />
      </Box>
      <Box
        display={submitted ? "flex" : "none"}
        borderStyle="round"
        borderColor="blue"
      >
        {submitted && <OllamaText prompt={value} />}
      </Box>
    </Box>
  );
}

render(<Main />);
