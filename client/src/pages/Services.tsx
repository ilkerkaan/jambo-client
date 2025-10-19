import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Check, Sparkles, Tag, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Services() {
  const [couponCode, setCouponCode] = useState("");
  
  const { data: packages, isLoading } = trpc.packages.getActive.useQuery({
    tenantSlug: "inklessismore"
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  const sortedPackages = packages?.sort((a: any, b: any) => a.price - b.price) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container text-center space-y-4">
          <h1 className="text-5xl font-bold">Treatment Packages & Pricing</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Choose the package that fits your needs and budget.
          </p>
        </div>
      </section>

      {/* Coupon Section */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Apply</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Have a referral or affiliate code? Enter it above for your discount!
            </p>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedPackages.map((pkg: any) => {
              const isPopular = pkg.name.toLowerCase().includes('5') || pkg.name.toLowerCase().includes('medium');
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`relative border-2 hover:shadow-xl transition-all ${
                    isPopular ? 'border-primary shadow-lg scale-105' : 'hover:border-primary'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    {pkg.description && (
                      <CardDescription className="text-sm mt-2">{pkg.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {formatPrice(pkg.price)}
                      </div>
                      {pkg.sessions && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {pkg.sessions} {pkg.sessions === 1 ? 'session' : 'sessions'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>PicoSure laser technology</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Professional consultation</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Aftercare guidance</span>
                      </div>
                      {pkg.sessions && pkg.sessions > 1 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Flexible scheduling</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Link href="/booking" className="w-full">
                      <Button 
                        className={`w-full ${
                          isPopular 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-secondary hover:bg-secondary/90'
                        }`}
                      >
                        Select Package
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">What's Included</h2>
              <p className="text-muted-foreground">Every package includes comprehensive care and support</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Free Consultation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Initial assessment to evaluate your tattoo and create a personalized treatment plan
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Advanced Technology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    PicoSure laser - the gold standard in tattoo removal with minimal discomfort
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Expert Care
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Skilled professionals with expertise in laser technology and skin health
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Aftercare Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Comprehensive aftercare instructions and ongoing support throughout your journey
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Book your free consultation today and take the first step towards flawless skin
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
              Book Free Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

