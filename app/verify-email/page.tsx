import { VerifyEmailClient } from "./VerifyEmailClient";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token = "" } = await searchParams;

  return <VerifyEmailClient token={token} />;
}
