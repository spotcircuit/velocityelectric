import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSiteConfig } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getSiteConfig() {
  return prisma.siteConfig.findFirst({
    where: { id: 'site-config' },
  })
}

export default async function AdminSettingsPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const config = await getSiteConfig()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Site Settings</h1>
        <p className="text-muted">Configure your business information.</p>
      </div>

      <form action={updateSiteConfig}>
        <div className="grid gap-8">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    defaultValue={config?.businessName || ''}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={config?.phone || ''}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={config?.email || ''}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    defaultValue={config?.licenseNumber || ''}
                    placeholder="e.g., LIC #12345"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={config?.address || ''}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hours">Business Hours</Label>
                <Input
                  id="hours"
                  name="hours"
                  defaultValue={config?.hours || ''}
                  placeholder="e.g., Mon-Fri 7AM-6PM, Sat 8AM-4PM"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryArea">Primary Area</Label>
                <Input
                  id="primaryArea"
                  name="primaryArea"
                  defaultValue={config?.primaryArea || ''}
                  placeholder="e.g., Metro Area"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="citiesServed">Cities Served (JSON Array)</Label>
                <Textarea
                  id="citiesServed"
                  name="citiesServed"
                  defaultValue={config?.citiesServed || '[]'}
                  placeholder='["City1", "City2", "City3"]'
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted mt-1">
                  JSON array of city names displayed on the home page
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding & Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  defaultValue={config?.tagline || ''}
                  placeholder="Your Trusted Master Electrician"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="aboutText">About Text</Label>
                <Textarea
                  id="aboutText"
                  name="aboutText"
                  defaultValue={config?.aboutText || ''}
                  placeholder="Tell your story..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="googleReviewUrl">Google Review URL</Label>
                <Input
                  id="googleReviewUrl"
                  name="googleReviewUrl"
                  defaultValue={config?.googleReviewUrl || ''}
                  placeholder="https://g.page/review/..."
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emergencyEnabled"
                  name="emergencyEnabled"
                  value="true"
                  defaultChecked={config?.emergencyEnabled ?? true}
                  className="h-4 w-4"
                />
                <Label htmlFor="emergencyEnabled">
                  Show Emergency Service Banner
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
