"use client";
import { useParams } from 'next/navigation';
import ChatPage from '../page';

export default function DynamicChatPage() {
  const params = useParams();
  return <ChatPage key={params.chatId} />;
}