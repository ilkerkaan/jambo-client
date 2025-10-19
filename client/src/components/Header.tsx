import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/booking", label: "Book Now" },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="Inkless Is More" 
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-xl text-foreground">Inkless Is More</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a 
                  className={`text-foreground hover:text-primary transition-colors font-medium ${
                    location === link.href ? 'text-primary' : ''
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <Link href="/admin">
              <a className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Admin
              </a>
            </Link>
          </nav>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <Link href="/booking">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Book Free Consultation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a 
                    className={`text-foreground hover:text-primary transition-colors font-medium ${
                      location === link.href ? 'text-primary' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <Link href="/admin">
                <a 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </a>
              </Link>
              <Link href="/booking">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Free Consultation
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

