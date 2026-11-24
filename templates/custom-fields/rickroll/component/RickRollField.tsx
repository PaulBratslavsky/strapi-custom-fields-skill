import { useEffect } from "react";
import { Field, Box, Typography } from "@strapi/design-system";
import styled from "styled-components";

interface RickRollFieldProps {
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
}

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";

const RickRollField = ({
  name,
  onChange,
  value,
  error,
  description,
  required = false,
  disabled = false,
}: RickRollFieldProps) => {
  // The embed is hardcoded, but the field still persists a real value so it
  // behaves like a complete custom field (not display-only). Skip the write
  // when the field is disabled — a read-only field must not dirty the entry.
  useEffect(() => {
    if (!disabled && !value) {
      onChange({
        target: { name, value: YOUTUBE_VIDEO_ID, type: "string" },
      });
    }
  }, [disabled, value, name, onChange]);

  return (
    <Field.Root
      name={name}
      error={error}
      hint={description?.defaultMessage}
      required={required}
    >
      <Field.Label>Rick Roll</Field.Label>
      <Box padding={4} background="neutral100" borderColor="neutral200" hasRadius>
        <ResponsiveIframeContainer>
          {/* Embed stays hardcoded — never build an iframe src from stored or
              user-provided values without validating them first. */}
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </ResponsiveIframeContainer>
        <CenteredCaption paddingTop={3}>
          <Typography variant="pi" textColor="neutral600">
            Never gonna give you up, never gonna let you down
          </Typography>
        </CenteredCaption>
      </Box>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

const ResponsiveIframeContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const CenteredCaption = styled(Box)`
  text-align: center;
`;

export { RickRollField };
