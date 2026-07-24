import { Field, Toggle } from "@strapi/design-system";

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: {
    target: { name: string; value: boolean; type: string };
  }) => void;
  value?: boolean | null;
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name, value: e.target.checked, type: "boolean" },
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
      <Toggle
        onLabel="True"
        offLabel="False"
        checked={value ?? false}
        onChange={handleChange}
        disabled={disabled}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export { {{COMPONENT_NAME}} };
