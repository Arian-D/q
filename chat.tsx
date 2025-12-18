import { Alert, TextInput } from "@inkjs/ui";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { ChatOllama } from "@langchain/ollama";
import { Box, render, Text } from "ink";
import { createAgent } from "langchain";
import React, { type ReactNode, useEffect, useState } from "react";

function createOllamaAgent() {
  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    // TODO: Dynamically pick based on prompt and resources
    model: "qwen3:1.7b",
    maxRetries: 1,
  });

  // TODO: Use a proper type
  const tools: any[] = [
    // new DuckDuckGoSearch({ maxResults: 3 }),
    new WikipediaQueryRun({
      topKResults: 3,
      maxDocContentLength: 4000,
    }),
  ];
  // TODO: Add MCPs

  const agent = createAgent({
    model: model,
    tools,
  });

  return agent;
}

const agent = createOllamaAgent();

interface PromptProps {
  prompt: string;
}

function OllamaText({ prompt }: PromptProps) {
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
    agent.stream({
      messages: [{
        role: "user",
        content: prompt,
      }],
    }, { streamMode: "messages" }).then(
      async (result) => {
        for await (const [token, metadata] of result) {
          if (metadata.langgraph_node === "model_request") {
            setResponse((prev: string) => prev + token.content);
          }
        }
      },
    );
  }, [prompt]);
  if (error) {
    // TODO: Figure out how to get around the child issue on deno
    const children: ReactNode = String(error);
    // deno-lint-ignore jsx-no-children-prop
    return <Alert variant="error" children={children} />;
  }
  return <Text color="cyanBright">{response}</Text>;
}

function Main() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (value == "/") {
    // TODO: Add model picker
  } else {
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
}

render(<Main />);
