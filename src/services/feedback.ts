const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllFeedbacks() {
  const res = await fetch(`${BASE_URL}/feedbacks`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch feedbacks");
  return res.json();
}
