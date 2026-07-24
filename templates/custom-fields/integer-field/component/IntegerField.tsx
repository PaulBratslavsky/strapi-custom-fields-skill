import { Field, NumberInput } from "@strapi/design-system";

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: {
    target: { name: string; value: number | null; type: string };
  }) => void;
  value?: number | null;
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
  value,
  intlLabel,
  required = false,
  disabled = false,
  error,
  description,
  placeholder,
}: {{COMPONENT_NAME}}Props) => {
  const handleValueChange = (newValue?: number) => {
    onChange({
      target: { name, value: newValue ?? null, type: "integer" },
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
      <NumberInput
        onValueChange={handleValueChange}
        value={value ?? undefined}
        placeholder={placeholder?.defaultMessage}
        disabled={disabled}
        step={1}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
