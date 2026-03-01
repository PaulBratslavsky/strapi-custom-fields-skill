# Custom Field React Component Templates

Starter templates for the custom field React input component, organized by field type. Pick the one matching the user's chosen type.

## String Field Component

For `type: "string"` — colors, codes, short text values.

```typescript
import { Field, TextInput } from "@strapi/design-system";

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  value?: string;
  intlLabel?: { defaultMessage: string };
  required?: boolean;
  attribute?: { type: string; customField: string };
  disabled?: boolean;
  error?: string;
  description?: { defaultMessage: string };
  placeholder?: { defaultMessage: string };
}

const {{COMPONENT_NAME}} = ({
  name,
  onChange,
  value = "",
  intlLabel,
  required = false,
  disabled = false,
  error,
  description,
  placeholder,
}: {{COMPONENT_NAME}}Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name, value: e.target.value, type: "string" },
    });
  };

  return (
    <Field.Root
      name={name}
      error={error}
      hint={description?.defaultMessage}
      required={required}
    >
      <Field.Label>{intlLabel?.defaultMessage ?? "{{FIELD_LABEL}}"}</Field.Label>
      <TextInput
        onChange={handleChange}
        value={value ?? ""}
        placeholder={placeholder?.defaultMessage}
        disabled={disabled}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
```

## JSON Field Component

For `type: "json"` — complex objects, coordinates, structured data.

```typescript
import { useState, useEffect } from "react";
import { Field, Box, Typography } from "@strapi/design-system";

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
  const [data, setData] = useState<{{COMPONENT_NAME}}Data>(value ?? {});

  useEffect(() => {
    if (value) setData(value);
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
      <Field.Label>{intlLabel?.defaultMessage ?? "{{FIELD_LABEL}}"}</Field.Label>
      <Box
        padding={4}
        background="neutral100"
        borderColor="neutral200"
        hasRadius
      >
        <Typography>
          Custom field UI goes here. Build your interactive component.
        </Typography>
      </Box>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
```

## Text Field Component

For `type: "text"` — long text, markdown, formatted content.

```typescript
import { Field, Textarea } from "@strapi/design-system";

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  value?: string;
  intlLabel?: { defaultMessage: string };
  required?: boolean;
  attribute?: { type: string; customField: string };
  disabled?: boolean;
  error?: string;
  description?: { defaultMessage: string };
  placeholder?: { defaultMessage: string };
}

const {{COMPONENT_NAME}} = ({
  name,
  onChange,
  value = "",
  intlLabel,
  required = false,
  disabled = false,
  error,
  description,
  placeholder,
}: {{COMPONENT_NAME}}Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      target: { name, value: e.target.value, type: "text" },
    });
  };

  return (
    <Field.Root
      name={name}
      error={error}
      hint={description?.defaultMessage}
      required={required}
    >
      <Field.Label>{intlLabel?.defaultMessage ?? "{{FIELD_LABEL}}"}</Field.Label>
      <Textarea
        onChange={handleChange}
        value={value ?? ""}
        placeholder={placeholder?.defaultMessage}
        disabled={disabled}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
```

## Available @strapi/icons

Common icons for custom fields: `PaintBrush`, `PinMap`, `MusicNotes`, `Code`, `Star`, `Eye`, `Globe`, `Calendar`, `Clock`, `Link`, `File`, `Image`, `Play`, `Grid`, `ChartBubble`, `ChartPie`, `Dashboard`, `Earth`, `Feather`, `Heart`, `Key`, `Landscape`, `Lightning`, `Magic`, `Message`, `Monitor`, `PaperPlane`, `Picture`, `Pin`, `PuzzlePiece`, `Shield`, `Spark`, `Trophy`, `User`, `Write`.

Browse all at: https://design-system-git-main-strapijs.vercel.app/
