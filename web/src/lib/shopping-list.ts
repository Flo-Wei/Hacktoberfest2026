import { query } from "./db";

export type ShoppingListItem = {
  id: string;
  product_id: string | null;
  name: string;
  quantity: string | null;
  checked: boolean;
  store: string | null;
  discount_cents: number | null;
};

export function listShoppingItems(userId: string) {
  return query<ShoppingListItem>(
    `select i.id, i.product_id, i.name, i.quantity, i.checked, p.store, p.discount_cents
     from shopping_list_items i
     left join products p on p.id = i.product_id
     where i.user_id = $1::uuid
     order by i.checked, i.created_at`,
    [userId],
  );
}

export function findShoppingItems(userId: string, name: string) {
  return query<Pick<ShoppingListItem, "id" | "name">>(
    `select id, name from shopping_list_items
     where user_id = $1::uuid and name ilike '%' || $2 || '%'`,
    [userId, name],
  );
}

export async function addShoppingItem(
  userId: string,
  item: { name: string; productId?: string; quantity?: string },
) {
  const rows = await query<{ id: string }>(
    `insert into shopping_list_items (user_id, product_id, name, quantity)
     values ($1::uuid, (select id from products where id::text = $2), $3, $4)
     returning id`,
    [userId, item.productId ?? null, item.name, item.quantity ?? null],
  );
  return rows[0].id;
}

// Every statement is scoped to the user, so an item id can't reach someone else's list.
export async function setShoppingItemChecked(userId: string, itemId: string, checked: boolean) {
  const rows = await query<{ name: string }>(
    `update shopping_list_items set checked = $3
     where user_id = $1::uuid and id::text = $2 returning name`,
    [userId, itemId, checked],
  );
  return rows[0]?.name ?? null;
}

export async function removeShoppingItem(userId: string, itemId: string) {
  const rows = await query<{ name: string }>(
    `delete from shopping_list_items
     where user_id = $1::uuid and id::text = $2 returning name`,
    [userId, itemId],
  );
  return rows[0]?.name ?? null;
}

export async function clearShoppingList(userId: string, checkedOnly = false) {
  const rows = await query(
    `delete from shopping_list_items
     where user_id = $1::uuid and (not $2 or checked) returning id`,
    [userId, checkedOnly],
  );
  return rows.length;
}
