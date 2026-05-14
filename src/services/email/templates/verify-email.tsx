import { Button, Link, Section, Text } from "@react-email/components";
import { emailStyles, Layout } from "./_layout";

type VerifyEmailProps = {
  userName: string;
  verifyUrl: string;
};

export default function VerifyEmail({ userName, verifyUrl }: VerifyEmailProps) {
  return (
    <Layout
      preview="Confirm your email to start using Get Images"
      heading="Verify your email"
    >
      <Text style={emailStyles.paragraph}>Hi {userName},</Text>
      <Text style={emailStyles.paragraph}>
        Welcome to Get Images! Confirm your email address so we can keep your
        account secure.
      </Text>
      <Section style={emailStyles.buttonWrap}>
        <Button href={verifyUrl} style={emailStyles.button}>
          Verify email
        </Button>
      </Section>
      <Text style={emailStyles.fallbackLabel}>
        Or copy this link into your browser:
      </Text>
      <Link href={verifyUrl} style={emailStyles.fallbackLink}>
        {verifyUrl}
      </Link>
      <Text style={emailStyles.note}>
        If you didn&apos;t sign up for Get Images, you can safely ignore this
        email.
      </Text>
    </Layout>
  );
}
