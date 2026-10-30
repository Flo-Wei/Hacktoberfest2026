import { commentOnSwipe } from "@/lib/krabby/comments";
import { getCurrentUser } from "@/lib/session";

type Event = { type: "swipe"; productId: string; liked: boolean };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in", { status: 401 });

  const event = (await request.json()) as Event;
  if (event.type !== "swipe") return new Response("Unknown event", { status: 400 });

  const comment = await commentOnSwipe(user, String(event.productId), event.liked === true);
  return Response.json({ comment });
}
