import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle, Loader, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { saasApi } from "@/lib/saasApi";

export default function SelectDate() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const [, setLocation] = useLocation();

  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const serviceId = purchaseInfo?.service?.id || "default";
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Verify token and load purchase info
  useEffect(() => {
    const loadPurchaseInfo = async () => {
      if (!token) {
        toast.error("Invalid token");
        return;
      }

      try {
        const response = await saasApi.verifyBookingToken(token);
        if (response.success) {
          setPurchaseInfo(response.data);
          // Load available dates
          const svc = response.data.service as any;
          const datesResponse = await saasApi.getAvailableDates(
            svc?.id || "default"
          );
          if (datesResponse.success) {
            setAvailableDates(datesResponse.data.availableDates);
          }
        } else {
          toast.error("Invalid or expired token");
        }
      } catch (error) {
        toast.error("Failed to load booking information");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseInfo();
  }, [token]);

  // Load slots when date is selected
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !purchaseInfo) return;

      try {
        const svc = purchaseInfo.service as any;
        const response = await saasApi.getAvailableSlots(
          svc?.id || "default",
          selectedDate
        );
        if (response.success) {
          setAvailableSlots(response.data.slots);
          setSelectedTime(""); // Reset time selection
        }
      } catch (error) {
        toast.error("Failed to load available times");
        console.error(error);
      }
    };

    loadSlots();
  }, [selectedDate, purchaseInfo]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    setSubmitting(true);

    try {
      const response = await saasApi.createAppointmentWithToken({
        token: token!,
        bookingDate: selectedDate,
        startTime: selectedTime,
      });

      if (response.success) {
        toast.success("Appointment booked successfully!");
        setLocation(`/booking-confirmed?appointment=${response.data.appointmentId}`);
      } else {
        toast.error("Failed to create appointment");
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

  if (!purchaseInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Unable to load booking information</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="space-y-8">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {purchaseInfo.customer.name}!</CardTitle>
              <CardDescription>
                {purchaseInfo.service.name} - {purchaseInfo.sessionsRemaining} sessions remaining
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select a Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableDates.map((dateOption) => (
                  <Button
                    key={dateOption.date}
                    variant={selectedDate === dateOption.date ? "default" : "outline"}
                    disabled={!dateOption.isAvailable}
                    onClick={() => setSelectedDate(dateOption.date)}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <span className="text-sm font-semibold">{dateOption.date}</span>
                    <span className="text-xs text-muted-foreground">
                      {dateOption.availableSlots} slots
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Select a Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {selectedDate && selectedTime && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  Appointment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-bold">{selectedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-bold">{selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-bold">{purchaseInfo.service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold">{purchaseInfo.service.durationMinutes} min</p>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={submitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

