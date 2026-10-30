export const price = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function discountPercent(product: { regular_cents: number; discount_cents: number }) {
  return Math.round((1 - product.discount_cents / product.regular_cents) * 100);
}
