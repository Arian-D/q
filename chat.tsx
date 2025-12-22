import { Spinner, TextInput } from "@inkjs/ui";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { ChatOllama } from "@langchain/ollama";
import { Box, render } from "ink";
import { createAgent } from "langchain";
import React, { useEffect, useState } from "react";
import { ModelPicker } from "./ModelPicker.tsx";
import { MarkdownRenderer } from "./MarkdownRenderer.tsx";

function createOllamaAgent() {
  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    // TODO: Dynamically pick based on prompt and resources
    model: "qwen3:1.7b",
    maxRetries: 1,
  });

  const tools = [
    // new DuckDuckGoSearch({ maxResults: 3 }),
    new WikipediaQueryRun({
      topKResults: 5,
      maxDocContentLength: 4000,
    }),
  ];
  // TODO: Add MCPs

  const agent = createAgent({
    model: model,
    // TODO: Add dynamic tool selection middleware
    tools: tools as never[],
  });

  return agent;
}

interface PromptProps {
  prompt: string;
}

function OllamaText({ prompt }: PromptProps) {
  const agent = createOllamaAgent();
  const [response, setResponse] = useState("");
  useEffect(() => {
    agent.stream({
      messages: [{
        role: "user",
        content: prompt,
      }],
    }, { streamMode: "messages" }).then(
      async (result) => {
        for await (const [token, metadata] of result) {
          // TODO: Add some sort of indicator for the tool calls
          if (metadata.langgraph_node === "model_request") {
            setResponse((prev: string) => prev + token.content);
          }
        }
      },
    );
  }, [prompt]);
  if (response === "") {
    // TODO: Extend this component to signal osc 9;4
    return <Spinner />;
  } else {
    return <MarkdownRenderer content={response} />;
  }
}

function Main() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedModel, setSelectedModel] = useState("qwen3:1.7b");
  const [pickingModel, setPickingModel] = useState(false);

  if (pickingModel) {
    return (
      <ModelPicker
        onSelect={(model) => {
          setSelectedModel(model);
          setPickingModel(false);
          setValue("");
        }}
        selectedModel={selectedModel}
      />
    );
  }

  if (value == "/") {
    setPickingModel(true);
    return null;
  }

  return (
    <>
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
    </>
  );
}

render(<Main />);
