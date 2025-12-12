import { notFound } from "next/navigation";

/**
 * Catch-all route for handling any invalid paths
 * This will catch URLs like /abc, /random123, or any unknown route
 * and display the 404 page
 */
export default function CatchAllNotFound() {
  // Trigger Next.js's built-in 404 handling
  notFound();
}
