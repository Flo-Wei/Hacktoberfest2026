// Browser side of action comments: report what the user did, and show Krabby's
// comment as a pop-up if it has one. Never makes the action wait.
export type AppEvent = { type: "swipe"; productId: string; liked: boolean };

export const COMMENT_EVENT = "krabby:comment";

export type CommentDetail = { chatId: string; messageId: string; text: string };

export function reportAppEvent(event: AppEvent) {
  void fetch("/api/krabby/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((body: { comment: CommentDetail | null } | null) => {
      if (body?.comment) {
        window.dispatchEvent(new CustomEvent(COMMENT_EVENT, { detail: body.comment }));
      }
    })
    .catch(() => {});
}
