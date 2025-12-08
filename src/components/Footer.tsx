import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image
              src="/logo.png"
              alt="BlendzHub Logo"
              width={48}
              height={48}
              className="h-10 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
            <h2 className="text-2xl font-bold text-foreground">BlendzHub</h2>
          </Link>
          <p className="text-muted-foreground max-w-sm">
            Your premier platform for booking salon and spa appointments. 
            Connect with top beauty professionals in your area.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Services</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-foreground">For Business</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/auth/register/owner" className="hover:text-foreground transition-colors">Partner with Us</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Owner Support</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Success Stories</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BlendzHub. All rights reserved.
      </div>
    </footer>
  );
}
