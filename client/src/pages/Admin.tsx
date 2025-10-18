import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Plus, Edit, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [editingPackage, setEditingPackage] = useState<string | null>(null);

  const { data: tenant, refetch: refetchTenant } = trpc.tenant.getMy.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: packages, refetch: refetchPackages } = trpc.packages.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateTenantMutation = trpc.tenant.update.useMutation({
    onSuccess: () => {
      toast.success("Business settings updated!");
      refetchTenant();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPackageMutation = trpc.packages.create.useMutation({
    onSuccess: () => {
      toast.success("Package created!");
      refetchPackages();
      setShowNewPackageForm(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePackageMutation = trpc.packages.update.useMutation({
    onSuccess: () => {
      toast.success("Package updated!");
      refetchPackages();
      setEditingPackage(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePackageMutation = trpc.packages.delete.useMutation({
    onSuccess: () => {
      toast.success("Package deleted!");
      refetchPackages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [showNewPackageForm, setShowNewPackageForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Business Found</CardTitle>
            <CardDescription>You don't have a business set up yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact support to set up your business account.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateTenantMutation.mutate({
                      name: formData.get("name") as string,
                      description: formData.get("description") as string,
                      phone: formData.get("phone") as string,
                      email: formData.get("email") as string,
                      whatsappNumber: formData.get("whatsappNumber") as string,
                      address: formData.get("address") as string,
                      logoUrl: formData.get("logoUrl") as string,
                      primaryColor: formData.get("primaryColor") as string,
                      accentColor: formData.get("accentColor") as string,
                    });
                  }}
                  className="space-y-6"
                >
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
                          <Input id="primaryColor" name="primaryColor" type="color" defaultValue={tenant.primaryColor || "#D4AF37"} className="w-20" />
                          <Input defaultValue={tenant.primaryColor || "#D4AF37"} readOnly />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input id="accentColor" name="accentColor" type="color" defaultValue={tenant.accentColor || "#000000"} className="w-20" />
                          <Input defaultValue={tenant.accentColor || "#000000"} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateTenantMutation.isPending}>
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
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createPackageMutation.mutate({
                          name: formData.get("name") as string,
                          description: formData.get("description") as string,
                          price: parseInt(formData.get("price") as string),
                          originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : undefined,
                          sessionsIncluded: parseInt(formData.get("sessionsIncluded") as string),
                          isPopular: formData.get("isPopular") === "on",
                          badge: formData.get("badge") as string || undefined,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-name">Package Name</Label>
                          <Input id="new-name" name="name" required placeholder="e.g., Small Tattoo Package" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-sessions">Sessions Included</Label>
                          <Input id="new-sessions" name="sessionsIncluded" type="number" required defaultValue="1" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-description">Description</Label>
                        <Textarea id="new-description" name="description" rows={2} />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-price">Price (in cents)</Label>
                          <Input id="new-price" name="price" type="number" required placeholder="10000" />
                          <p className="text-xs text-muted-foreground">e.g., 10000 = KSh 100.00</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-originalPrice">Original Price (optional)</Label>
                          <Input id="new-originalPrice" name="originalPrice" type="number" placeholder="13500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-badge">Badge (optional)</Label>
                          <Input id="new-badge" name="badge" placeholder="Best Value" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="new-isPopular" name="isPopular" className="h-4 w-4" />
                        <Label htmlFor="new-isPopular" className="cursor-pointer">Mark as Popular</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={createPackageMutation.isPending}>Create Package</Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewPackageForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {packages?.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardContent className="pt-6">
                      {editingPackage === pkg.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            updatePackageMutation.mutate({
                              id: pkg.id,
                              name: formData.get("name") as string,
                              description: formData.get("description") as string,
                              price: parseInt(formData.get("price") as string),
                              sessionsIncluded: parseInt(formData.get("sessionsIncluded") as string),
                              isActive: formData.get("isActive") === "on",
                            });
                          }}
                          className="space-y-4"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            <Input name="name" defaultValue={pkg.name} required />
                            <Input name="sessionsIncluded" type="number" defaultValue={pkg.sessionsIncluded} required />
                          </div>
                          <Textarea name="description" defaultValue={pkg.description || ""} rows={2} />
                          <Input name="price" type="number" defaultValue={pkg.price} required />
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`active-${pkg.id}`} name="isActive" defaultChecked={pkg.isActive ?? true} className="h-4 w-4" />
                            <Label htmlFor={`active-${pkg.id}`}>Active</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">Save</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setEditingPackage(null)}>Cancel</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{pkg.name}</h3>
                              {pkg.isPopular && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Popular</span>}
                              {!pkg.isActive && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Inactive</span>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                            <div className="flex gap-4 text-sm">
                              <span><strong>Price:</strong> KSh {(pkg.price / 100).toFixed(2)}</span>
                              <span><strong>Sessions:</strong> {pkg.sessionsIncluded}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingPackage(pkg.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this package?")) {
                                  deletePackageMutation.mutate({ id: pkg.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
                <CardTitle>Customer Bookings</CardTitle>
                <CardDescription>View and manage customer appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Booking management will be available once customers start purchasing packages.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

