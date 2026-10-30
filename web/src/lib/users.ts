import { query } from "./db";

export type User = {
  id: string;
  name: string;
  age: number;
  city: string;
  goals: string[];
  preferences: string[];
  is_mock: boolean;
};

const COLUMNS = "id, name, age, city, goals, preferences, is_mock";

export function listMockUsers() {
  return query<User>(`select ${COLUMNS} from users where is_mock order by name`);
}

export async function getUser(id: string) {
  const rows = await query<User>(
    `select ${COLUMNS} from users where id::text = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser(
  user: Pick<User, "name" | "age" | "city" | "goals" | "preferences">,
) {
  const rows = await query<User>(
    `insert into users (name, age, city, goals, preferences)
     values ($1, $2, $3, $4, $5)
     returning ${COLUMNS}`,
    [user.name, user.age, user.city, user.goals, user.preferences],
  );
  return rows[0];
}

export async function updateUser(
  id: string,
  changes: Partial<Pick<User, "name" | "age" | "city" | "goals" | "preferences">>,
) {
  const rows = await query<User>(
    `update users set
       name = coalesce($2, name),
       age = coalesce($3, age),
       city = coalesce($4, city),
       goals = coalesce($5, goals),
       preferences = coalesce($6, preferences)
     where id::text = $1
     returning ${COLUMNS}`,
    [
      id,
      changes.name ?? null,
      changes.age ?? null,
      changes.city ?? null,
      changes.goals ?? null,
      changes.preferences ?? null,
    ],
  );
  return rows[0];
}
