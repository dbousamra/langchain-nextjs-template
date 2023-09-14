import { ChatWindow } from "@/components/ChatWindow";

export const runtime = "nodejs";

export default function Home() {
  return (
    <ChatWindow
      endpoint="/api/chat/retrieval"
      showIngestForm={true}
      placeholder={
        'I\'ve got a nose for finding the right documents! Ask, "What are some ways of doing retrieval in LangChain.js?"'
      }
      emoji="🐶"
      titleText="Dana the Document-Retrieving Dog"
    />
  );
}
