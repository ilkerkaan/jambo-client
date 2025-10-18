import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check } from "lucide-react";

export default function Services() {
  const packages = [
    {
      name: "Single Session",
      price: "KSh 4,500",
      originalPrice: null,
      description: "Perfect for trying out our service or for very small tattoos",
      features: [
        "1 laser removal session",
        "Picosecond laser technology",
        "Negative cold therapy",
        "Professional consultation",
        "Aftercare instructions"
      ],
      popular: false,
      badge: null
    },
    {
      name: "Small Tattoo Package",
      price: "KSh 10,000",
      originalPrice: "KSh 13,500",
      description: "3 sessions - Ideal for small tattoos (up to 3x3 inches)",
      features: [
        "3 laser removal sessions",
        "Save KSh 3,500",
        "Picosecond laser technology",
        "Negative cold therapy",
        "Session tracking",
        "Flexible scheduling",
        "Aftercare support"
      ],
      popular: true,
      badge: "Most Popular"
    },
    {
      name: "Medium Tattoo Package",
      price: "KSh 15,000",
      originalPrice: "KSh 22,500",
      description: "5 sessions - Best for medium-sized tattoos (3x3 to 6x6 inches)",
      features: [
        "5 laser removal sessions",
        "Save KSh 7,500",
        "Picosecond laser technology",
        "Negative cold therapy",
        "Session tracking",
        "Priority scheduling",
        "Dedicated support",
        "Free consultation"
      ],
      popular: false,
      badge: "Best Value"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-3">
              <img src="/logo.png" alt="Inkless Is More" className="h-12 w-12" />
              <span className="font-bold text-xl hidden sm:inline-block">Inkless Is More</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/"><a className="transition-colors hover:text-primary">Home</a></Link>
            <Link href="/services"><a className="text-primary font-semibold">Services</a></Link>
            <Link href="/how-it-works"><a className="transition-colors hover:text-primary">How It Works</a></Link>
            <Link href="/gallery"><a className="transition-colors hover:text-primary">Gallery</a></Link>
            <Link href="/about"><a className="transition-colors hover:text-primary">About Us</a></Link>
            <Link href="/contact"><a className="transition-colors hover:text-primary">Contact</a></Link>
          </nav>

          <Link href="/booking">
            <Button className="font-semibold">Book Now</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/10 to-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Services & Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your needs. All packages include our advanced Picosecond 
            laser technology and negative cold therapy for safe, effective tattoo removal.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, idx) => (
              <Card key={idx} className={pkg.popular ? "border-primary border-2 shadow-lg" : ""}>
                <CardHeader>
                  {pkg.badge && (
                    <Badge className="w-fit mb-2" variant={pkg.popular ? "default" : "secondary"}>
                      {pkg.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    {pkg.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through mb-1">
                        {pkg.originalPrice}
                      </p>
                    )}
                    <p className="text-4xl font-bold text-primary">{pkg.price}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/booking" className="w-full">
                    <Button className="w-full" variant={pkg.popular ? "default" : "outline"}>
                      Select Package
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Additional Services</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Laser Scar Removal</CardTitle>
                <CardDescription>Reduce the appearance of scars with advanced laser technology</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-through">KSh 50,000</p>
                  <p className="text-3xl font-bold text-primary">KSh 15,000</p>
                  <p className="text-sm text-muted-foreground mt-1">Limited time offer</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Effective for various scar types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Minimal downtime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Safe for all skin types</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/booking" className="w-full">
                  <Button className="w-full" variant="outline">Book Consultation</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Treatment Plans</CardTitle>
                <CardDescription>Personalized solutions for large or complex tattoos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold">Custom Pricing</p>
                  <p className="text-sm text-muted-foreground mt-1">Based on your specific needs</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tailored session count</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Flexible payment options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated specialist</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/contact" className="w-full">
                  <Button className="w-full" variant="outline">Contact Us</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Have a Coupon Code?</h2>
              <p className="text-lg mb-6 opacity-90">
                Enter your affiliate coupon code during booking to receive your exclusive discount!
              </p>
              <Link href="/booking">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Book with Coupon Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Inkless Is More. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

