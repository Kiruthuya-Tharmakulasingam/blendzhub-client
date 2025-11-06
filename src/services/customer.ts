const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllCustomers() {
  const res = await fetch(`${BASE_URL}/customers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}
