import { query } from "./db";

// A shopping trip should stay in one chat.
const NEW_CHAT_AFTER = "3 hours";

export type Chat = { id: string; user_id: string; closed: boolean; last_message_at: string };

export type ChatSummary = Chat & { title: string | null };

export type ChatMessage = {
  id: string;
  chat_id: string;
  role: "user" | "krabby" | "event";
  content: string;
  has_photo: boolean;
  actions: string[];
  created_at: string;
};

const CHAT_COLUMNS = "id, user_id, closed, last_message_at";

export async function getActiveChat(userId: string) {
  const rows = await query<Chat>(
    `select ${CHAT_COLUMNS} from chats
     where user_id = $1::uuid and not closed
       and last_message_at > now() - interval '${NEW_CHAT_AFTER}'
     order by last_message_at desc limit 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function createChat(userId: string) {
  const rows = await query<Chat>(
    `insert into chats (user_id) values ($1::uuid) returning ${CHAT_COLUMNS}`,
    [userId],
  );
  return rows[0];
}

export async function getOrCreateActiveChat(userId: string) {
  return (await getActiveChat(userId)) ?? createChat(userId);
}

export async function getChat(userId: string, chatId: string) {
  const rows = await query<Chat>(
    `select ${CHAT_COLUMNS} from chats where user_id = $1::uuid and id::text = $2`,
    [userId, chatId],
  );
  return rows[0] ?? null;
}

export async function closeActiveChats(userId: string) {
  await query(`update chats set closed = true where user_id = $1::uuid and not closed`, [userId]);
}

export function listChats(userId: string) {
  return query<ChatSummary>(
    `select c.id, c.user_id, c.closed, c.last_message_at,
       (select m.content from chat_messages m
        where m.chat_id = c.id and m.role <> 'event'
        order by m.role = 'user' desc, m.created_at limit 1) as title
     from chats c
     where c.user_id = $1::uuid
       and exists (select 1 from chat_messages m where m.chat_id = c.id)
     order by c.last_message_at desc`,
    [userId],
  );
}

export function listMessages(chatId: string) {
  return query<ChatMessage>(
    `select id, chat_id, role, content, has_photo, actions, created_at
     from chat_messages where chat_id = $1::uuid order by created_at`,
    [chatId],
  );
}

export async function recentMessages(chatId: string, limit: number) {
  const rows = await query<ChatMessage>(
    `select id, chat_id, role, content, has_photo, actions, created_at
     from chat_messages where chat_id = $1::uuid order by created_at desc limit $2`,
    [chatId, limit],
  );
  return rows.reverse();
}

// Sending to a chat also makes it the active one again.
export async function addMessage(
  chatId: string,
  message: { role: ChatMessage["role"]; content: string; hasPhoto?: boolean; actions?: string[] },
) {
  const rows = await query<ChatMessage>(
    `insert into chat_messages (chat_id, role, content, has_photo, actions)
     values ($1::uuid, $2, $3, $4, $5)
     returning id, chat_id, role, content, has_photo, actions, created_at`,
    [chatId, message.role, message.content, message.hasPhoto ?? false, message.actions ?? []],
  );
  await query(`update chats set last_message_at = now(), closed = false where id = $1::uuid`, [chatId]);
  return rows[0];
}

export async function deleteMessage(messageId: string) {
  await query(`delete from chat_messages where id = $1::uuid`, [messageId]);
}

export async function getKrabbyMessage(userId: string, messageId: string) {
  const rows = await query<{ content: string }>(
    `select m.content from chat_messages m
     join chats c on c.id = m.chat_id
     where c.user_id = $1::uuid and m.id::text = $2 and m.role = 'krabby'`,
    [userId, messageId],
  );
  return rows[0]?.content ?? null;
}

export function searchMessages(userId: string, search: string, excludeChatId: string, limit = 10) {
  return query<Pick<ChatMessage, "role" | "content" | "created_at">>(
    `select m.role, m.content, m.created_at
     from chat_messages m
     join chats c on c.id = m.chat_id
     where c.user_id = $1::uuid and c.id <> $2::uuid
       and m.role <> 'event' and m.content ilike '%' || $3 || '%'
     order by m.created_at desc limit $4`,
    [userId, excludeChatId, search, limit],
  );
}

// Swipes since Krabby last commented, or null if it hasn't commented yet.
export async function swipesSinceLastEvent(userId: string) {
  const rows = await query<{ swipes: number | null }>(
    `select case when last_event is null then null else (
         select count(*)::int from swipes s
         where s.user_id = $1::uuid and s.created_at > last_event
       ) end as swipes
     from (
       select max(m.created_at) as last_event
       from chat_messages m
       join chats c on c.id = m.chat_id
       where c.user_id = $1::uuid and m.role = 'event'
     ) events`,
    [userId],
  );
  return rows[0].swipes;
}
