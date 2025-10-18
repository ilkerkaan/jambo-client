import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Sparkles, 
  Shield, 
  Clock, 
  MapPin, 
  Award, 
  Heart,
  ArrowRight,
  Star,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const benefits = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Advanced PicoSure Technology",
      description: "Gold standard laser technology for safe, effective tattoo removal with minimal discomfort"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe & FDA Approved",
      description: "Certified technology with proven safety record and professional medical standards"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Treatment Sessions",
      description: "Quick 15-30 minute sessions that fit into your busy schedule"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Prime Location",
      description: "Conveniently located at Two Rivers Mall, Nairobi's premier shopping destination"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Expert Professionals",
      description: "Skilled team with expertise in laser technology and skin health"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Care",
      description: "Tailored treatment plans based on your skin type, tattoo size, and goals"
    }
  ];

  const testimonials = [
    {
      name: "Faith",
      rating: 5,
      text: "The pain is nothing compared to getting a new tattoo. Highly recommend!"
    },
    {
      name: "Gabriel",
      rating: 5,
      text: "The service is great. Trustful, fast and very professional."
    },
    {
      name: "Stephen",
      rating: 5,
      text: "It feels good to see my tattoo fading away after each treatment."
    },
    {
      name: "Isabelle",
      rating: 5,
      text: "Only a few sessions and my tattoo is nearly gone. I couldn't be happier with the results!"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Free Consultation",
      description: "We assess your tattoo and create a personalized treatment plan"
    },
    {
      step: "2",
      title: "Choose Your Package",
      description: "Select the package that fits your needs and budget"
    },
    {
      step: "3",
      title: "Treatment Sessions",
      description: "Quick, comfortable sessions with our advanced PicoSure laser"
    },
    {
      step: "4",
      title: "Watch It Fade",
      description: "See visible results after each session as your tattoo disappears"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Inkless Is More" 
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-xl text-foreground">Inkless Is More</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/booking" className="text-foreground hover:text-primary transition-colors">
                Book Now
              </Link>
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Admin
              </Link>
            </nav>
            <Link href="/booking">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Book Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Kenya's Laser Tattoo Removal Experts
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Uncover Flawless Skin with{" "}
                <span className="text-primary">Advanced Laser</span>{" "}
                Tattoo Removal
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to Nairobi's premier destination for safe and effective tattoo removal! 
                At Inkless Is More, we use the groundbreaking <strong>PicoSure laser technology</strong>, 
                the gold standard in tattoo removal, to help you say goodbye to unwanted ink safely and comfortably.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                    Book Free Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Packages & Pricing
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Trusted by 500+ satisfied clients</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary to-accent rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center text-white space-y-4">
                  <h2 className="text-4xl font-bold">LET YOUR SKIN</h2>
                  <h2 className="text-5xl font-bold">SHINE AGAIN</h2>
                  <p className="text-xl opacity-90">REDEFINE YOUR STORY</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Inkless Is More?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We strive to change the scene in the Nairobi tattoo removal industry with expertise, 
              advanced technology, and personalized care.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple, straightforward process to flawless skin</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-lg text-muted-foreground">Real results from real people</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <p className="font-bold text-primary">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            If your tattoo no longer feels like a part of you, we are here to help you fade or 
            completely remove it safely. Reclaim your confidence and embrace flawless skin.
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
              Book Your Free Consultation Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}

