import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { saasApi } from "@/lib/saasApi";

export default function Purchase() {
  const [, params] = useRoute("/purchase/:serviceId");
  const [, setLocation] = useLocation();
  const serviceId = params?.serviceId || "";

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    payNow: false,
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState(false);

  // Load service details
  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await saasApi.getService(serviceId);
        if (response.success) {
          setService(response.data);
        }
      } catch (error) {
        toast.error("Failed to load service details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await saasApi.validateCoupon(couponCode);
      if (response.success && response.data.isValid) {
        setCouponValid(true);
        const discount =
          response.data.discountType === "percentage"
            ? (service.price * response.data.discountValue) / 100
            : response.data.discountValue;
        setCouponDiscount(discount);
        toast.success("Coupon applied!");
      } else {
        setCouponValid(false);
        setCouponDiscount(0);
        toast.error(response.data.message || "Invalid coupon");
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await saasApi.createPurchase({
        serviceId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        payNow: formData.payNow,
        couponCode: couponValid ? couponCode : undefined,
      });

      if (response.success) {
        toast.success("Purchase created! Check your email for next steps.");
        // Redirect to booking confirmation
        setLocation(`/booking-confirmation?purchase=${response.data.purchaseId}`);
      } else {
        toast.error("Failed to create purchase");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Service not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const finalPrice = service.price - couponDiscount;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="space-y-8">
          {/* Service Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Included</p>
                  <p className="text-2xl font-bold">{service.sessionsIncluded}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration per Session</p>
                  <p className="text-2xl font-bold">{service.durationMinutes} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Regular Price</p>
                  <p className="text-xl font-bold">KES {service.price.toLocaleString()}</p>
                </div>
                {couponDiscount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Your Discount</p>
                    <p className="text-xl font-bold text-green-600">
                      -KES {couponDiscount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-3xl font-bold text-primary">
                    KES {finalPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                We'll use this to send you booking and payment links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      placeholder="Your full name"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, customerEmail: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      placeholder="+254 700 000 000"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="border-t pt-4">
                  <Label>Promo Code (Optional)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      disabled={couponValid}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidateCoupon}
                      disabled={couponValid || !couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponValid && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Coupon applied successfully!</span>
                    </div>
                  )}
                </div>

                {/* Payment Option */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.payNow}
                      onChange={(e) =>
                        setFormData({ ...formData, payNow: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Pay now (KES {finalPrice.toLocaleString()})
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uncheck to receive a payment link via email/WhatsApp
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After purchase, you'll receive a link to choose your appointment date and time.
              You can book at your own pace!
            </AlertDescription>
          </Alert>
        </div>
      </main>

      <Footer />
    </div>
  );
}

