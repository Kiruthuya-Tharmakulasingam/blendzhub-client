import Link from "next/link";
import Image from "next/image";

export default function SimpleFooter() {
  return (
    <footer className="py-6 text-center text-sm text-zinc-500 border-t mt-auto">
      <div className="flex justify-center mb-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/noBgColor.png"
            alt="BlendzHub Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="font-semibold hover:text-black dark:hover:text-white">BlendzHub</span>
        </Link>
      </div>
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
