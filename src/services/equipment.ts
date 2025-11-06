const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllEquipments() {
  const res = await fetch(`${BASE_URL}/equipments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch equipments");
  return res.json();
}
