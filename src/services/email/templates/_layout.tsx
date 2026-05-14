import type React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type LayoutProps = {
  preview: string;
  heading: string;
  children: React.ReactNode;
};

// Email clients (Gmail in particular) aggressively rewrite dark-mode styles
// and rarely support web fonts or CSS color functions. Every color is an
// explicit hex, every style is inline, and fonts fall back to system serif /
// system sans rather than linking Geist or Fraunces.
const COLORS = {
  background: "#fbf6ee",
  card: "#ffffff",
  ink: "#2b211c",
  muted: "#6b6058",
  border: "#ece4d8",
  primary: "#e8704f",
};

const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const bodyStyle: React.CSSProperties = {
  backgroundColor: COLORS.background,
  color: COLORS.ink,
  fontFamily: FONT_BODY,
  margin: 0,
  padding: "40px 16px",
  WebkitFontSmoothing: "antialiased",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "40px 40px 32px",
};

const brandStyle: React.CSSProperties = {
  color: COLORS.primary,
  fontFamily: FONT_DISPLAY,
  fontSize: "20px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  margin: 0,
  paddingBottom: "24px",
};

const headingStyle: React.CSSProperties = {
  color: COLORS.ink,
  fontFamily: FONT_DISPLAY,
  fontSize: "28px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  margin: "0 0 24px",
};

const hrStyle: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${COLORS.border}`,
  margin: "32px 0 20px",
};

const footerStyle: React.CSSProperties = {
  color: COLORS.muted,
  fontFamily: FONT_BODY,
  fontSize: "12px",
  lineHeight: 1.6,
  margin: 0,
};

export function Layout({ preview, heading, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={brandStyle}>Get Images</Text>
          </Section>
          <Heading as="h1" style={headingStyle}>
            {heading}
          </Heading>
          {children}
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            If you didn&apos;t request this email, you can safely ignore it.
          </Text>
          <Text style={{ ...footerStyle, marginTop: "8px" }}>
            &copy; Get Images
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Shared style tokens for individual templates so the brand stays consistent
// without templates having to re-declare the palette.
export const emailStyles = {
  colors: COLORS,
  fontDisplay: FONT_DISPLAY,
  fontBody: FONT_BODY,
  paragraph: {
    color: COLORS.ink,
    fontFamily: FONT_BODY,
    fontSize: "16px",
    lineHeight: 1.6,
    margin: "0 0 16px",
  } as React.CSSProperties,
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: "10px",
    color: "#ffffff",
    display: "inline-block",
    fontFamily: FONT_BODY,
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
  } as React.CSSProperties,
  buttonWrap: {
    margin: "8px 0 24px",
  } as React.CSSProperties,
  fallbackLabel: {
    color: COLORS.muted,
    fontFamily: FONT_BODY,
    fontSize: "13px",
    lineHeight: 1.5,
    margin: "0 0 4px",
  } as React.CSSProperties,
  fallbackLink: {
    color: COLORS.muted,
    fontFamily: FONT_BODY,
    fontSize: "13px",
    wordBreak: "break-all" as const,
  },
  note: {
    color: COLORS.muted,
    fontFamily: FONT_BODY,
    fontSize: "14px",
    lineHeight: 1.6,
    margin: "16px 0 0",
  } as React.CSSProperties,
};
