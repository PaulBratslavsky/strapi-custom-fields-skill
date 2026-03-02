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
      <Field.Label>{intlLabel?.defaultMessage ?? "{{DISPLAY_NAME}}"}</Field.Label>
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
