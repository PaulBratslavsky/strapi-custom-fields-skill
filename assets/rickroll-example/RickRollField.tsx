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
  error,
  description,
  required = false,
}: RickRollFieldProps) => {
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
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </ResponsiveIframeContainer>
        <Box paddingTop={3} style={{ textAlign: "center" }}>
          <Typography variant="pi" textColor="neutral600">
            Never gonna give you up, never gonna let you down
          </Typography>
        </Box>
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

export { RickRollField };
