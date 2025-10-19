import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle, Clock, DollarSign, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getProducts,
  getAvailability,
  createBooking,
  validateCoupon,
  getErrorMessage,
  saasConfig,
  type Product,
  type TimeSlot,
} from "@/lib/saasApi";

export default function Booking() {
  // Form state
  const [step, setStep] = useState<"product" | "date" | "details" | "payment" | "confirmation">("product");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Customer details
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [bookingId, setBookingId] = useState<string>("");

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      
      if (!saasConfig.isConfigured) {
        setError("SaaS backend not configured. Please set VITE_SAAS_API_URL and VITE_TENANT_SLUG environment variables.");
        // Show demo products for development
        setProducts(getDemoProducts());
        setLoading(false);
        return;
      }

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(getErrorMessage(err));
      // Show demo products on error
      setProducts(getDemoProducts());
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability(date: string) {
    try {
      setError("");
      
      if (!saasConfig.isConfigured) {
        // Show demo slots for development
        setAvailableSlots(getDemoSlots());
        return;
      }

      const response = await getAvailability(date);
      setAvailableSlots(response.slots);
    } catch (err) {
      setError(getErrorMessage(err));
      setAvailableSlots(getDemoSlots());
    }
  }

  async function validateCouponCode() {
    if (!couponCode.trim()) {
      setCouponDiscount(0);
      return;
    }

    try {
      setError("");
      
      if (!saasConfig.isConfigured) {
        // Demo: accept any coupon with 10% discount
        setCouponDiscount(10);
        return;
      }

      const response = await validateCoupon({ code: couponCode });
      if (response.valid) {
        setCouponDiscount(
          response.discountType === "percentage" ? response.discountValue : 0
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitBooking() {
    if (!selectedProduct || !selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!saasConfig.isConfigured) {
        // Demo: create fake booking
        setBookingId("DEMO-" + Date.now());
        setStep("confirmation");
        setLoading(false);
        return;
      }

      const response = await createBooking({
        productId: selectedProduct.id,
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate: `${selectedDate}T${selectedTime}:00Z`,
        couponCode: couponCode || undefined,
      });

      setBookingId(response.id);
      
      if (response.paymentRequired && response.paymentUrl) {
        // Redirect to payment
        window.location.href = response.paymentUrl;
      } else {
        setStep("confirmation");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const finalPrice = selectedProduct
    ? Math.round(selectedProduct.price * (1 - couponDiscount / 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <Header />

      <section className="py-12">
        <div className="container max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Book Your Appointment</h1>
            <p className="text-muted-foreground">
              Simple, straightforward process to schedule your tattoo removal sessions
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Configuration Warning */}
          {!saasConfig.isConfigured && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Demo mode: SaaS backend not configured. Set VITE_SAAS_API_URL and VITE_TENANT_SLUG to enable real bookings.
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Select Product */}
          {step === "product" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Step 1: Choose Your Package</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all ${
                        selectedProduct?.id === product.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              KES {(product.price / 100).toLocaleString()}
                            </div>
                            {product.sessions && (
                              <div className="text-sm text-muted-foreground">
                                {product.sessions} sessions
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setStep("date")}
                disabled={!selectedProduct}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue to Date Selection
              </Button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === "date" && selectedProduct && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Step 2: Choose Date & Time</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    loadAvailability(e.target.value);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="mb-4"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-2">Available Times</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className="text-sm"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep("product")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep("details")}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === "details" && selectedProduct && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Step 3: Your Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone (M-Pesa) *</label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code (Optional)</label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <Button
                      onClick={validateCouponCode}
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {couponDiscount}% discount applied!
                    </p>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Package Price:</span>
                    <span>KES {(selectedProduct.price / 100).toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({couponDiscount}%):</span>
                      <span>-KES {((selectedProduct.price * couponDiscount) / 100 / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">KES {(finalPrice / 100).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep("date")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={submitBooking}
                  disabled={loading || !customerName || !customerEmail || !customerPhone}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirmation" && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <CardTitle className="text-green-900">Booking Confirmed!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-green-800">
                  Your appointment has been successfully booked. A confirmation email has been sent to {customerEmail}.
                </p>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID:</span>
                      <span className="font-mono">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package:</span>
                      <span>{selectedProduct?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span>{selectedDate} at {selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-bold">KES {(finalPrice / 100).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• Payment reminder will be sent 24 hours before appointment</li>
                    <li>• Arrive 10 minutes early on your appointment date</li>
                    <li>• Bring a valid ID and any relevant medical documents</li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setStep("product");
                    setSelectedProduct(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setCustomerName("");
                    setCustomerEmail("");
                    setCustomerPhone("");
                    setCouponCode("");
                    setCouponDiscount(0);
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Book Another Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ============ DEMO DATA ============

function getDemoProducts() {
  return [
    {
      id: "pkg_1",
      name: "Single Session",
      description: "Perfect for small tattoos or first-time assessment",
      price: 50000, // KES 500
      currency: "KES",
      productType: "appointment" as const,
      sessions: 1,
      duration: 30,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pkg_3",
      name: "3-Session Package",
      description: "Ideal for medium-sized tattoos",
      price: 120000, // KES 1,200
      currency: "KES",
      productType: "appointment" as const,
      sessions: 3,
      duration: 30,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "pkg_5",
      name: "5-Session Package",
      description: "Best value for larger or complex tattoos",
      price: 180000, // KES 1,800
      currency: "KES",
      productType: "appointment" as const,
      sessions: 5,
      duration: 30,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDemoSlots(): TimeSlot[] {
  return [
    { date: new Date().toISOString().split("T")[0], time: "09:00", available: true },
    { date: new Date().toISOString().split("T")[0], time: "10:00", available: true },
    { date: new Date().toISOString().split("T")[0], time: "11:00", available: true },
    { date: new Date().toISOString().split("T")[0], time: "14:00", available: true },
    { date: new Date().toISOString().split("T")[0], time: "15:00", available: false },
    { date: new Date().toISOString().split("T")[0], time: "16:00", available: true },
  ];
}

