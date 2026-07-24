import { Field, TextInput } from "@strapi/design-system";
import styled from "styled-components";

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: {
    target: { name: string; value: string; type: string };
  }) => void;
  value?: string;
  intlLabel?: { defaultMessage: string };
  required?: boolean;
  attribute?: { type: string; customField: string };
  disabled?: boolean;
  error?: string;
  description?: { defaultMessage: string };
  placeholder?: { defaultMessage: string };
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

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
  const emit = (newValue: string) => {
    onChange({
      target: { name, value: newValue, type: "string" },
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
      <PickerRow>
        <Swatch
          type="color"
          value={HEX_PATTERN.test(value) ? value : "#000000"}
          onChange={(e) => emit(e.target.value)}
          disabled={disabled}
          aria-label="Pick a color"
        />
        <HexInputWrapper>
          <TextInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              emit(e.target.value)
            }
            value={value ?? ""}
            placeholder={placeholder?.defaultMessage ?? "#RRGGBB"}
            disabled={disabled}
          />
        </HexInputWrapper>
      </PickerRow>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaces[2]};
`;

const HexInputWrapper = styled.div`
  flex: 1;
`;

const Swatch = styled.input`
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: none;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius};
  }
`;

export { {{COMPONENT_NAME}} };
