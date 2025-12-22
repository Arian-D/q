import { Box, Text } from "ink";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  marked.use(markedTerminal());
  const rendered = marked.parse(content);

  return (
    <Box flexDirection="column" gap={0}>
      <Text>{rendered}</Text>
    </Box>
  );
}
