import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Star, Check, MapPin, Phone, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-3">
              <img src="/logo.png" alt="Inkless Is More" className="h-12 w-12" />
              <span className="font-bold text-xl hidden sm:inline-block">Inkless Is More</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/">
              <a className="transition-colors hover:text-primary">Home</a>
            </Link>
            <Link href="/services">
              <a className="transition-colors hover:text-primary">Services</a>
            </Link>
            <Link href="/how-it-works">
              <a className="transition-colors hover:text-primary">How It Works</a>
            </Link>
            <Link href="/gallery">
              <a className="transition-colors hover:text-primary">Gallery</a>
            </Link>
            <Link href="/about">
              <a className="transition-colors hover:text-primary">About Us</a>
            </Link>
            <Link href="/contact">
              <a className="transition-colors hover:text-primary">Contact</a>
            </Link>
          </nav>

          <Link href="/booking">
            <Button className="font-semibold">Book Now</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-accent/10 to-background py-20 md:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Kenya's Laser Tattoo Removal Experts
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Uncover Flawless Skin with Advanced Laser Tattoo Removal
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Welcome to Nairobi's premier destination for safe and effective laser tattoo removal! 
                At Inkless Is More, we use advanced Picosecond laser technology combined with negative 
                cold therapy to fade or remove unwanted tattoos safely and comfortably.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="text-base font-semibold">
                    Book Free Consultation
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="text-base font-semibold">
                    View Services & Pricing
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by 500+ satisfied clients
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <h2 className="text-5xl md:text-7xl font-bold text-primary">
                    LET YOUR SKIN
                  </h2>
                  <h3 className="text-4xl md:text-6xl font-bold">
                    SHINE AGAIN
                  </h3>
                  <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                    REDEFINE YOUR STORY
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Faith", text: "The pain is nothing compared to getting a new tattoo." },
              { name: "Gabriel", text: "The service is great. Trustful, fast and very professional." },
              { name: "Stephen", text: "It feels good to see my tattoo fading away after each treatment." },
              { name: "Isabelle", text: "Only a few sessions and my tattoo is nearly gone. I couldn't be happier with the results." }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm mb-3 text-muted-foreground">"{testimonial.text}"</p>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Inkless Is More?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We strive to change the scene in the Nairobi tattoo removal industry with expertise, 
              advanced technology, and personalized care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Advanced Technology",
                description: "State-of-the-art Picosecond laser technology combined with negative cold therapy for safe and effective removal."
              },
              {
                title: "Expert Team",
                description: "Skilled professionals with expertise in laser technology and skin health, ensuring you're in safe hands."
              },
              {
                title: "Personalized Care",
                description: "Tailored treatment plans based on your skin type, tattoo size, colors, and age for optimal results."
              },
              {
                title: "Transparent Pricing",
                description: "Realistic expectations and seamless pricing without any hidden fees or charges."
              },
              {
                title: "Comfortable Experience",
                description: "Numbing cream options and comprehensive aftercare to ensure your comfort throughout the process."
              },
              {
                title: "Prime Location",
                description: "Conveniently located at Two Rivers Mall, 1st Floor, Nairobi's biggest shopping destination."
              }
            ].map((feature, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            If your tattoo no longer feels like a part of you, we are here to help you fade or 
            completely remove it safely. Reclaim your confidence and embrace flawless skin.
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="text-base font-semibold">
              Book Your Free Consultation Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Inkless Is More" className="h-10 w-10" />
                <span className="font-bold text-lg">Inkless Is More</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kenya's premier laser tattoo removal specialists. 
                We believe in new beginnings and second chances.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/services"><a className="text-muted-foreground hover:text-primary">Services</a></Link></li>
                <li><Link href="/how-it-works"><a className="text-muted-foreground hover:text-primary">How It Works</a></Link></li>
                <li><Link href="/gallery"><a className="text-muted-foreground hover:text-primary">Gallery</a></Link></li>
                <li><Link href="/about"><a className="text-muted-foreground hover:text-primary">About Us</a></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Two Rivers Mall, 1st Floor, Nairobi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href="tel:+254" className="text-muted-foreground hover:text-primary">+254 XXX XXX XXX</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:info@inklessismore.ke" className="text-muted-foreground hover:text-primary">info@inklessismore.ke</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                   className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                   className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Inkless Is More. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

