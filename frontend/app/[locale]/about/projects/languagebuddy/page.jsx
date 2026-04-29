import { LanguageBuddyContent } from "@/components/project-languagebuddy";

export const metadata = {
  title: "LanguageBuddy",
  description:
    "An AI-powered language learning chatbot for practicing conversations with real-time corrections and adaptive difficulty.",
};

export default function LanguageBuddyPage() {
  return (
    <main>
      <LanguageBuddyContent />
    </main>
  );
}
