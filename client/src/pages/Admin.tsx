import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, LogOut, Save, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function Admin() {
  const { user: adminUser, logout } = useAdminAuth();
  const [, setLocation] = useLocation();

  function handleLogout() {
    logout();
    setLocation("/");
  }

  // Demo data - will be replaced with SaaS backend API calls
  const [tenant, setTenant] = useState({
    id: "demo-tenant",
    name: "Inkless Is More",
    email: "info@inklessismore.ke",
    phone: "+254 XXX XXX XXX",
    whatsappNumber: "+254 XXX XXX XXX",
    address: "Two Rivers Mall, Nairobi",
    description: "Professional laser tattoo removal service",
    logoUrl: "/logo.png",
    primaryColor: "#00BFA5",
    accentColor: "#FF6F61",
  });

  const [packagesList, setPackagesList] = useState([
    {
      id: "1",
      name: "Single Session",
      description: "1 laser treatment session",
      price: 50,
      originalPrice: 75,
      sessionsIncluded: 1,
    },
    {
      id: "2",
      name: "3-Pack",
      description: "3 laser treatment sessions",
      price: 120,
      originalPrice: 225,
      sessionsIncluded: 3,
    },
    {
      id: "3",
      name: "5-Pack",
      description: "5 laser treatment sessions",
      price: 180,
      originalPrice: 375,
      sessionsIncluded: 5,
    },
  ]);

  const [coupons, setCoupons] = useState([
    {
      id: "1",
      code: "AFFILIATE10",
      description: "10% discount for affiliates",
      discountType: "percentage" as const,
      discountValue: 10,
      maxUses: 100,
      currentUses: 45,
      validFrom: "2025-10-01",
      validUntil: "2025-12-31",
      isActive: true,
    },
    {
      id: "2",
      code: "AMBASSADOR20",
      description: "20% discount for trained ambassadors",
      discountType: "percentage" as const,
      discountValue: 20,
      maxUses: 50,
      currentUses: 12,
      validFrom: "2025-10-01",
      validUntil: "2025-12-31",
      isActive: true,
    },
    {
      id: "3",
      code: "WELCOME500",
      description: "KES 500 discount for new customers",
      discountType: "fixed" as const,
      discountValue: 500,
      maxUses: 200,
      currentUses: 87,
      validFrom: "2025-10-01",
      validUntil: "2025-12-31",
      isActive: true,
    },
  ]);

  const [affiliates, setAffiliates] = useState([
    {
      id: "1",
      name: "John's Massage Salon",
      email: "john@massagesalon.ke",
      phone: "+254 700 123 456",
      businessType: "Massage Salon",
      tier: "trained_ambassador" as const,
      commissionRate: 20,
      couponCode: "AMBASSADOR20",
      referralsCount: 15,
      totalCommission: 45000,
      pendingCommission: 12000,
      status: "active" as const,
      joinedDate: "2025-09-15",
    },
    {
      id: "2",
      name: "Beauty Hub Nairobi",
      email: "info@beautyhub.ke",
      phone: "+254 700 234 567",
      businessType: "Beauty Center",
      tier: "standard" as const,
      commissionRate: 10,
      couponCode: "AFFILIATE10",
      referralsCount: 8,
      totalCommission: 18000,
      pendingCommission: 5000,
      status: "active" as const,
      joinedDate: "2025-10-01",
    },
    {
      id: "3",
      name: "Hair Studio Plus",
      email: "contact@hairstudio.ke",
      phone: "+254 700 345 678",
      businessType: "Hair Salon",
      tier: "standard" as const,
      commissionRate: 10,
      couponCode: "AFFILIATE10",
      referralsCount: 5,
      totalCommission: 8000,
      pendingCommission: 2000,
      status: "active" as const,
      joinedDate: "2025-10-05",
    },
  ]);

  const [bookings, setBookings] = useState([
    {
      id: "1",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: "+254 700 111 111",
      packageName: "3-Pack",
      appointmentDate: "2025-10-25",
      appointmentTime: "09:00",
      status: "confirmed" as const,
      paymentStatus: "paid" as const,
      amount: 120,
      couponUsed: "AMBASSADOR20",
      discount: 24,
      finalAmount: 96,
      createdAt: "2025-10-20",
    },
    {
      id: "2",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      customerPhone: "+254 700 222 222",
      packageName: "5-Pack",
      appointmentDate: "2025-10-26",
      appointmentTime: "14:00",
      status: "pending" as const,
      paymentStatus: "pending" as const,
      amount: 180,
      couponUsed: null,
      discount: 0,
      finalAmount: 180,
      createdAt: "2025-10-20",
    },
  ]);

  const [showNewPackageForm, setShowNewPackageForm] = useState(false);
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [showNewAffiliateForm, setShowNewAffiliateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [showCouponCode, setShowCouponCode] = useState<Record<string, boolean>>({});

  if (!adminUser) {
    return null;
  }

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    setTenant({
      ...tenant,
      name: (formData.get("name") as string) || tenant.name,
      email: (formData.get("email") as string) || tenant.email,
      phone: (formData.get("phone") as string) || tenant.phone,
      whatsappNumber: (formData.get("whatsappNumber") as string) || tenant.whatsappNumber,
      address: (formData.get("address") as string) || tenant.address,
      description: (formData.get("description") as string) || tenant.description,
      logoUrl: (formData.get("logoUrl") as string) || tenant.logoUrl,
      primaryColor: (formData.get("primaryColor") as string) || tenant.primaryColor,
      accentColor: (formData.get("accentColor") as string) || tenant.accentColor,
    });
    
    toast.success("Business settings updated!");
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const newPackage = {
      id: Date.now().toString(),
      name: (formData.get("name") as string) || "",
      description: (formData.get("description") as string) || "",
      price: parseInt((formData.get("price") as string) || "0"),
      originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0,
      sessionsIncluded: parseInt((formData.get("sessionsIncluded") as string) || "1"),
    };

    setPackagesList([...packagesList, newPackage]);
    setShowNewPackageForm(false);
    toast.success("Package created!");
  };

  const handleDeletePackage = (id: string) => {
    setPackagesList(packagesList.filter(p => p.id !== id));
    toast.success("Package deleted!");
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const newCoupon = {
      id: Date.now().toString(),
      code: (formData.get("code") as string)?.toUpperCase() || "",
      description: (formData.get("description") as string) || "",
      discountType: (formData.get("discountType") as "percentage" | "fixed") || "percentage",
      discountValue: parseInt((formData.get("discountValue") as string) || "0"),
      maxUses: parseInt((formData.get("maxUses") as string) || "0"),
      currentUses: 0,
      validFrom: (formData.get("validFrom") as string) || "",
      validUntil: (formData.get("validUntil") as string) || "",
      isActive: true,
    };

    setCoupons([...coupons, newCoupon]);
    setShowNewCouponForm(false);
    toast.success("Coupon created!");
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success("Coupon deleted!");
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
    toast.success("Coupon status updated!");
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{tenant.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="business">Business Settings</TabsTrigger>
            <TabsTrigger value="packages">Service Packages</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Business Settings Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business details and branding</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTenant} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={tenant.name}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={tenant.email}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={tenant.phone}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        name="whatsappNumber"
                        defaultValue={tenant.whatsappNumber}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={tenant.address}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={tenant.description}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="primaryColor"
                          name="primaryColor"
                          type="color"
                          defaultValue={tenant.primaryColor}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          defaultValue={tenant.primaryColor}
                          className="flex-1"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="accentColor"
                          name="accentColor"
                          type="color"
                          defaultValue={tenant.accentColor}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          defaultValue={tenant.accentColor}
                          className="flex-1"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Service Packages</h2>
                <p className="text-muted-foreground">Manage your service packages and pricing</p>
              </div>
              <Button
                onClick={() => setShowNewPackageForm(!showNewPackageForm)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Package
              </Button>
            </div>

            {showNewPackageForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePackage} className="space-y-4">
                    <div>
                      <Label htmlFor="pkg-name">Package Name</Label>
                      <Input
                        id="pkg-name"
                        name="name"
                        placeholder="e.g., 3-Session Package"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pkg-description">Description</Label>
                      <Textarea
                        id="pkg-description"
                        name="description"
                        placeholder="Describe this package"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pkg-price">Price (KES)</Label>
                        <Input
                          id="pkg-price"
                          name="price"
                          type="number"
                          placeholder="0"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pkg-original">Original Price (KES)</Label>
                        <Input
                          id="pkg-original"
                          name="originalPrice"
                          type="number"
                          placeholder="0"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pkg-sessions">Sessions Included</Label>
                        <Input
                          id="pkg-sessions"
                          name="sessionsIncluded"
                          type="number"
                          placeholder="1"
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Create Package</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewPackageForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {packagesList.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-bold text-lg">KES {pkg.price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Original Price</p>
                        <p className="font-bold">KES {pkg.originalPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-bold">{pkg.sessionsIncluded}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Discount</p>
                        <p className="font-bold">
                          {pkg.originalPrice > 0
                            ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Coupon Codes</h2>
                <p className="text-muted-foreground">Manage discount coupons and promotional codes</p>
              </div>
              <Button
                onClick={() => setShowNewCouponForm(!showNewCouponForm)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Coupon
              </Button>
            </div>

            {showNewCouponForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Coupon</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coupon-code">Coupon Code</Label>
                        <Input
                          id="coupon-code"
                          name="code"
                          placeholder="e.g., AFFILIATE10"
                          className="mt-2 uppercase"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="coupon-type">Discount Type</Label>
                        <select
                          id="coupon-type"
                          name="discountType"
                          className="mt-2 w-full px-3 py-2 border rounded-md"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (KES)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coupon-description">Description</Label>
                      <Input
                        id="coupon-description"
                        name="description"
                        placeholder="e.g., 10% discount for affiliates"
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="coupon-value">Discount Value</Label>
                        <Input
                          id="coupon-value"
                          name="discountValue"
                          type="number"
                          placeholder="0"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="coupon-maxuses">Max Uses</Label>
                        <Input
                          id="coupon-maxuses"
                          name="maxUses"
                          type="number"
                          placeholder="0 (unlimited)"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="coupon-validfrom">Valid From</Label>
                        <Input
                          id="coupon-validfrom"
                          name="validFrom"
                          type="date"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coupon-validuntil">Valid Until</Label>
                      <Input
                        id="coupon-validuntil"
                        name="validUntil"
                        type="date"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Create Coupon</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCouponForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="font-mono text-lg">
                            {showCouponCode[coupon.id] ? coupon.code : "••••••••"}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowCouponCode({
                                ...showCouponCode,
                                [coupon.id]: !showCouponCode[coupon.id],
                              })
                            }
                          >
                            {showCouponCode[coupon.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCouponCode(coupon.code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardDescription>{coupon.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={coupon.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCoupon(coupon.id)}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Discount</p>
                        <p className="font-bold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `KES ${coupon.discountValue}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uses</p>
                        <p className="font-bold">
                          {coupon.currentUses}/{coupon.maxUses || "∞"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid From</p>
                        <p className="font-bold">{coupon.validFrom}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Until</p>
                        <p className="font-bold">{coupon.validUntil}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-bold ${coupon.isActive ? "text-green-600" : "text-red-600"}`}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Affiliates Tab */}
          <TabsContent value="affiliates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Affiliate Partners</h2>
                <p className="text-muted-foreground">Manage your affiliate network and commissions</p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Affiliate
              </Button>
            </div>

            {/* Affiliate Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Affiliates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{affiliates.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {affiliates.reduce((sum, a) => sum + a.referralsCount, 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Commissions Paid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    KES {affiliates.reduce((sum, a) => sum + a.totalCommission, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Commissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">
                    KES {affiliates.reduce((sum, a) => sum + a.pendingCommission, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Affiliates List */}
            <div className="grid gap-4">
              {affiliates.map((affiliate) => (
                <Card key={affiliate.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{affiliate.name}</CardTitle>
                        <CardDescription>{affiliate.businessType}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            affiliate.tier === "trained_ambassador"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {affiliate.tier === "trained_ambassador"
                            ? "Trained Ambassador"
                            : "Standard Affiliate"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            affiliate.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {affiliate.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Information</p>
                        <p className="font-medium">{affiliate.email}</p>
                        <p className="text-sm">{affiliate.phone}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Joined {affiliate.joinedDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Details</p>
                        <div className="space-y-2 mt-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Commission Rate:</span>
                            <span className="font-bold">{affiliate.commissionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Coupon Code:</span>
                            <span className="font-mono font-bold">{affiliate.couponCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Referrals:</span>
                            <span className="font-bold">{affiliate.referralsCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Commission:</span>
                            <span className="font-bold">KES {affiliate.totalCommission.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-orange-600">
                            <span className="text-sm">Pending:</span>
                            <span className="font-bold">KES {affiliate.pendingCommission.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Recent Bookings</h2>
              <p className="text-muted-foreground">View and manage customer bookings</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Package</th>
                    <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Coupon</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{booking.packageName}</td>
                      <td className="py-3 px-4">
                        {booking.appointmentDate} {booking.appointmentTime}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">KES {booking.finalAmount}</p>
                          {booking.discount > 0 && (
                            <p className="text-xs text-green-600">
                              -KES {booking.discount} ({Math.round((booking.discount / booking.amount) * 100)}%)
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {booking.couponUsed ? (
                          <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {booking.couponUsed}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

