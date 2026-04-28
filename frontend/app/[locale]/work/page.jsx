import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function WorkPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/about`);
}
