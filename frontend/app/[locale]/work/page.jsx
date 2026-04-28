import { WorkContent } from "@/components/work-content";

export const metadata = {
  title: "Work with me",
  description: "",
  robots: { index: false, follow: false },
};

export default function WorkPage() {
  return (
    <main>
      <WorkContent />
    </main>
  );
}
