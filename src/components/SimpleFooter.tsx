import Link from "next/link";

export default function SimpleFooter() {
  return (
    <footer className="py-6 text-center text-sm text-zinc-500 border-t mt-auto">
      <div className="flex justify-center gap-6 mb-4">
        <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link>
        <Link href="#" className="hover:text-black dark:hover:text-white">Privacy</Link>
        <Link href="#" className="hover:text-black dark:hover:text-white">Terms</Link>
        <Link href="#" className="hover:text-black dark:hover:text-white">Support</Link>
      </div>
      <p>© {new Date().getFullYear()} BlendzHub. All rights reserved.</p>
    </footer>
  );
}
