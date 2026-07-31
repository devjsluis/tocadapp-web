import { VerifyEmailRequiredClient } from "./VerifyEmailRequiredClient";

type VerifyEmailRequiredPageProps = {
  searchParams: Promise<{
    email?: string;
    sent?: string;
  }>;
};

export default async function VerifyEmailRequiredPage({
  searchParams,
}: VerifyEmailRequiredPageProps) {
  const { email = "", sent = "0" } = await searchParams;

  return (
    <VerifyEmailRequiredClient
      initialEmail={email}
      initiallySent={sent === "1"}
    />
  );
}
