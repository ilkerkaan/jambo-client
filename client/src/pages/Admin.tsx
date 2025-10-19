import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, LogOut, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  const [showNewPackageForm, setShowNewPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);

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
    setPackagesList(packagesList.filter(pkg => pkg.id !== id));
    toast.success("Package deleted!");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </a>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{adminUser?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Business Settings</TabsTrigger>
            <TabsTrigger value="packages">Service Packages</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Business Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details, branding, and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTenant} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input id="name" name="name" defaultValue={tenant.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={tenant.email || ""} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={tenant.phone || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input id="whatsappNumber" name="whatsappNumber" defaultValue={tenant.whatsappNumber || ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={tenant.address || ""} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={tenant.description || ""} rows={4} />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Branding</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" name="logoUrl" defaultValue={tenant.logoUrl || ""} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input id="primaryColor" name="primaryColor" type="color" defaultValue={tenant.primaryColor || "#00BFA5"} className="w-20" />
                          <Input defaultValue={tenant.primaryColor || "#00BFA5"} readOnly />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input id="accentColor" name="accentColor" type="color" defaultValue={tenant.accentColor || "#FF6F61"} className="w-20" />
                          <Input defaultValue={tenant.accentColor || "#FF6F61"} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Packages Tab */}
          <TabsContent value="packages">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Service Packages</h2>
                  <p className="text-muted-foreground">Manage your service offerings and pricing</p>
                </div>
                <Button onClick={() => setShowNewPackageForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </div>

              {showNewPackageForm && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>New Package</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePackage} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Package Name</Label>
                          <Input id="name" name="name" placeholder="e.g., 3-Pack" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sessionsIncluded">Sessions Included</Label>
                          <Input id="sessionsIncluded" name="sessionsIncluded" type="number" defaultValue="1" required />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (KES)</Label>
                          <Input id="price" name="price" type="number" placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">Original Price (optional)</Label>
                          <Input id="originalPrice" name="originalPrice" type="number" placeholder="0" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe this package..." rows={3} />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">Create Package</Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewPackageForm(false)}>
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
                    <CardHeader>
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
                          Delete
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-2xl font-bold">{pkg.price} KES</p>
                          {pkg.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">{pkg.originalPrice} KES</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sessions</p>
                          <p className="text-2xl font-bold">{pkg.sessionsIncluded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price per Session</p>
                          <p className="text-2xl font-bold">{Math.round(pkg.price / pkg.sessionsIncluded)} KES</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  View and manage customer bookings (Coming soon - will connect to SaaS backend)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Booking management will be available once the SaaS backend is integrated.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

