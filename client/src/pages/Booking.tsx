import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Calendar, Clock, Package } from "lucide-react";

/**
 * Booking Page - Placeholder for SaaS Integration
 * 
 * This page will be connected to your Elixir/Phoenix SaaS backend via API calls.
 * The backend will handle:
 * - Real-time calendar availability
 * - Service/package selection
 * - M-Pesa payment integration
 * - Session tracking
 * - Affiliate coupon code validation
 */

export default function Booking() {
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
            <Link href="/services"><a className="transition-colors hover:text-primary">Services</a></Link>
            <Link href="/how-it-works"><a className="transition-colors hover:text-primary">How It Works</a></Link>
            <Link href="/gallery"><a className="transition-colors hover:text-primary">Gallery</a></Link>
            <Link href="/about"><a className="transition-colors hover:text-primary">About Us</a></Link>
            <Link href="/contact"><a className="transition-colors hover:text-primary">Contact</a></Link>
          </nav>

          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Booking Section */}
      <section className="py-16 flex-1">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
            <p className="text-lg text-muted-foreground">
              Schedule your free consultation or treatment session
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Choose Package</h3>
                <p className="text-sm text-muted-foreground">Select your service package</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Pick Date & Time</h3>
                <p className="text-sm text-muted-foreground">Choose from available slots</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Confirm & Pay</h3>
                <p className="text-sm text-muted-foreground">Secure payment via M-Pesa</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form - Will be replaced with SaaS integration */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Fill in your details and we'll contact you to schedule your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="+254 XXX XXX XXX" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Select Package *</Label>
                  <select 
                    id="package" 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Choose a package...</option>
                    <option value="single">Single Session - KSh 4,500</option>
                    <option value="small">Small Tattoo (3 sessions) - KSh 10,000</option>
                    <option value="medium">Medium Tattoo (5 sessions) - KSh 15,000</option>
                    <option value="scar">Laser Scar Removal - KSh 15,000</option>
                    <option value="custom">Custom Treatment Plan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon Code (Optional)</Label>
                  <Input id="coupon" placeholder="Enter affiliate coupon code" />
                  <p className="text-xs text-muted-foreground">
                    Have a referral code? Enter it here to get your discount!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your tattoo (size, location, colors) or any questions you have..."
                    rows={4}
                  />
                </div>

                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📍 Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Two Rivers Mall, 1st Floor<br />
                    Nairobi, Kenya
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" size="lg" className="flex-1">
                    Submit Booking Request
                  </Button>
                  <Link href="/services">
                    <Button type="button" variant="outline" size="lg">
                      View Packages
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  * This is a booking request. We'll contact you within 24 hours to confirm your appointment.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Integration Note */}
          <Card className="mt-8 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">🔄 SaaS Integration Ready</h3>
              <p className="text-sm text-muted-foreground">
                This booking form is a placeholder. When integrated with your Elixir/Phoenix SaaS backend, 
                it will provide:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Real-time calendar with available time slots</li>
                <li>Instant M-Pesa payment processing</li>
                <li>Automatic session package tracking</li>
                <li>Affiliate coupon code validation and discount application</li>
                <li>Email and SMS confirmation notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Inkless Is More. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

