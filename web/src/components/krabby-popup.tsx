"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import { COMMENT_EVENT, type CommentDetail } from "@/lib/krabby/events";

const VISIBLE_MS = 7000;

// Krabby's comment on something the user did. It's already saved in the chat, so
// there's no reply box here: tapping it opens the comment there.
export function KrabbyPopup() {
  const [comment, setComment] = useState<CommentDetail | null>(null);

  useEffect(() => {
    const show = (event: Event) => setComment((event as CustomEvent<CommentDetail>).detail);
    window.addEventListener(COMMENT_EVENT, show);
    return () => window.removeEventListener(COMMENT_EVENT, show);
  }, []);

  useEffect(() => {
    if (!comment) return;
    const timer = setTimeout(() => setComment(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [comment]);

  if (!comment) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem)] z-40 mx-auto max-w-md px-4">
      <div role="status" className="rounded-xl border border-border bg-card p-3 shadow-lg">
        <Link href={`/chat/${comment.chatId}#message-${comment.messageId}`} onClick={() => setComment(null)}>
          <span className="text-sm font-bold text-selected-foreground">🦀 Krabby</span>
          <p>{comment.text}</p>
        </Link>
        <SpeakButton messageId={comment.messageId} />
      </div>
    </div>
  );
}
