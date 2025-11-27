export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">BlendzHub</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
            Your premier platform for booking salon and spa appointments. 
            Connect with top beauty professionals in your area.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="#" className="hover:text-black dark:hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white">Services</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">For Business</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="/auth/register/owner" className="hover:text-black dark:hover:text-white">Partner with Us</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white">Owner Support</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white">Success Stories</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} BlendzHub. All rights reserved.
      </div>
    </footer>
  );
}
