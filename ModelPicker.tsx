import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import Fuse from "fuse.js";

interface Model {
  label: string;
  value: string;
}

interface SelectItem {
  label: string;
  value: string;
}

interface ModelPickerProps {
  endpoint?: string;
  selectedModel?: string;
  onSelect: (value: string) => void;
  searchThreshold?: number;
}

export function ModelPicker({
  endpoint = "http://localhost:11434",
  selectedModel = "qwen3:4b",
  onSelect,
  searchThreshold = 0.6,
}: ModelPickerProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${endpoint}/api/tags`);
        const json = await response.json();
        const options: Model[] = json.models.map((model: { name: string }) => ({
          label: model.name,
          value: model.name,
        }));
        setModels(options);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [endpoint]);

  const fuse = useMemo(
    () =>
      new Fuse(models, {
        keys: ["label", "value"],
        threshold: searchThreshold,
        minMatchCharLength: 1,
      }),
    [models, searchThreshold],
  );

  const filteredModels: Model[] = useMemo(() => {
    if (!searchQuery.trim()) {
      return models;
    }
    const results = fuse.search(searchQuery);
    return results.map((result: { item: Model }) => result.item);
  }, [searchQuery, fuse, models]);

  const selectOptions: SelectItem[] = filteredModels.map((model) => ({
    label: model.label,
    value: model.value,
  }));

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }
  if (models.length === 0) {
    return <Text>Loading models...</Text>;
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text>Search:</Text>
        <TextInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Type to search models..."
        />
      </Box>
      <SelectInput
        items={selectOptions}
        onSelect={(item: SelectItem) => onSelect(item.value)}
      />
    </Box>
  );
}
