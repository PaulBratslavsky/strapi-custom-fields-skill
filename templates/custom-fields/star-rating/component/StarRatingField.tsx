import { Field } from "@strapi/design-system";
import styled from "styled-components";

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
}

const STARS = [1, 2, 3, 4, 5];

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
  const rating = value ?? 0;

  const setRating = (n: number) => {
    onChange({
      // Clicking the current rating clears the field
      target: { name, value: n === rating ? null : n, type: "integer" },
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
      <StarRow role="radiogroup" aria-label="Star rating">
        {STARS.map((n) => (
          <StarButton
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            disabled={disabled}
            $active={n <= rating}
            onClick={() => setRating(n)}
          >
            ★
          </StarButton>
        ))}
      </StarRow>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaces[1]};
`;

const StarButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0;
  font-size: 2.4rem;
  line-height: 1;
  cursor: pointer;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.warning500 : theme.colors.neutral300};
  transition: color 0.1s ease-in, transform 0.1s ease-in;

  &:hover:not(:disabled) {
    transform: scale(1.15);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export { {{COMPONENT_NAME}} };
