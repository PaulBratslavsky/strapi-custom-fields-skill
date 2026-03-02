import { useState, useEffect } from "react";
import { Field, Box, TextInput, NumberInput, Typography } from "@strapi/design-system";
import styled from "styled-components";

// --- Styled layout components (required for reliable full-width layout) ---
// Strapi's Box/Flex do NOT reliably apply width, overflow, flex, or position.
// Always use styled-components for layout-critical CSS.
// See references/ui-layout-guide.md for full patterns and rules.

/** Full-width vertical stack with consistent gap */
const FieldColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaces[3]};
`;

/** Ensures a child element stretches to full width */
const FieldRow = styled.div`
  width: 100%;
`;

/** Two side-by-side inputs of equal width */
const SideBySideRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spaces[4]};
`;

// --- Component ---

interface {{COMPONENT_NAME}}Data {
  // Define your JSON data shape here
  [key: string]: any;
}

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: { target: { name: string; value: {{COMPONENT_NAME}}Data; type: string } }) => void;
  value?: {{COMPONENT_NAME}}Data;
  intlLabel?: { defaultMessage: string };
  required?: boolean;
  attribute?: { type: string; customField: string };
  disabled?: boolean;
  error?: string;
  description?: { defaultMessage: string };
}

// Strapi may pass JSON values as a string or an object — handle both
function parseValue(value: any): {{COMPONENT_NAME}}Data {
  const fallback = {};
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return { ...fallback, ...JSON.parse(value) };
    } catch {
      return fallback;
    }
  }
  if (typeof value === "object") return { ...fallback, ...value };
  return fallback;
}

const {{COMPONENT_NAME}} = ({
  name,
  onChange,
  value,
  intlLabel,
  required = false,
  disabled = false,
  error,
  description,
}: {{COMPONENT_NAME}}Props) => {
  const [data, setData] = useState<{{COMPONENT_NAME}}Data>(() => parseValue(value));

  useEffect(() => {
    setData(parseValue(value));
  }, [value]);

  const updateValue = (newData: {{COMPONENT_NAME}}Data) => {
    setData(newData);
    onChange({
      target: { name, value: newData, type: "json" },
    });
  };

  return (
    <Field.Root
      name={name}
      error={error}
      hint={description?.defaultMessage}
      required={required}
    >
      <Field.Label>{intlLabel?.defaultMessage ?? "{{DISPLAY_NAME}}"}</Field.Label>
      <FieldColumn>
        {/* Add your inputs here, wrapped in FieldRow or SideBySideRow */}
        <FieldRow>
          <Typography>
            Custom field UI goes here. Build your interactive component.
          </Typography>
        </FieldRow>
      </FieldColumn>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
