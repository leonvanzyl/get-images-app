import { Button, Link, Section, Text } from "@react-email/components";
import { emailStyles, Layout } from "./_layout";

type ResetPasswordEmailProps = {
  userName: string;
  resetUrl: string;
};

export default function ResetPasswordEmail({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Layout preview="Reset your Get Images password" heading="Reset your password">
      <Text style={emailStyles.paragraph}>Hi {userName},</Text>
      <Text style={emailStyles.paragraph}>
        We got a request to reset the password on your Get Images account. Click
        the button below to choose a new one.
      </Text>
      <Section style={emailStyles.buttonWrap}>
        <Button href={resetUrl} style={emailStyles.button}>
          Reset password
        </Button>
      </Section>
      <Text style={emailStyles.fallbackLabel}>
        Or copy this link into your browser:
      </Text>
      <Link href={resetUrl} style={emailStyles.fallbackLink}>
        {resetUrl}
      </Link>
      <Text style={emailStyles.note}>
        This link expires in 1 hour. If you didn&apos;t request a password
        reset, you can safely ignore this email.
      </Text>
    </Layout>
  );
}
