import { Link } from "wouter";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.png" 
                alt="Inkless Is More" 
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-lg">Inkless Is More</span>
            </div>
            <p className="text-gray-400 text-sm">
              Kenya's premier laser tattoo removal specialists. 
              We believe in new beginnings and second chances.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/booking" className="hover:text-primary transition-colors">Book Now</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Two Rivers Mall, 1st Floor, Nairobi</span>
              </li>
              <li>+254 XXX XXX XXX</li>
              <li>info@inklessismore.ke</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">TikTok</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 Inkless Is More. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

