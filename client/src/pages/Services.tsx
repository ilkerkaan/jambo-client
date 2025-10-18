import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Services() {
  const { data: packages, isLoading } = trpc.packages.getActive.useQuery({
    tenantSlug: "inklessismore",
  });

  const { data: tenant } = trpc.tenant.getBySlug.useQuery({
    slug: "inklessismore",
  });

  const formatPrice = (priceInCents: number) => {
    const currency = tenant?.currency || "KSh";
    return `${currency} ${(priceInCents / 100).toLocaleString()}`;
  };

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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          ) : packages && packages.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg) => (
                <Card key={pkg.id} className={pkg.isPopular ? "border-primary border-2 shadow-lg" : ""}>
                  <CardHeader>
                    {pkg.badge && (
                      <Badge className="w-fit mb-2" variant={pkg.isPopular ? "default" : "secondary"}>
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
                          {formatPrice(pkg.originalPrice)}
                        </p>
                      )}
                      <p className="text-4xl font-bold text-primary">{formatPrice(pkg.price)}</p>
                    </div>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{pkg.sessionsIncluded} laser removal session{pkg.sessionsIncluded > 1 ? 's' : ''}</span>
                      </li>
                      {pkg.originalPrice && (
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Save {formatPrice(pkg.originalPrice - pkg.price)}</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Picosecond laser technology</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Negative cold therapy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Professional consultation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Aftercare support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/booking?package=${pkg.id}`} className="w-full">
                      <Button className="w-full" variant={pkg.isPopular ? "default" : "outline"}>
                        Select Package
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No packages available at the moment.</p>
            </div>
          )}
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

