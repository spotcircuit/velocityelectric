'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { leadFormSchema, type LeadFormData } from '@/lib/validations'
import { trackLeadSubmit } from '@/lib/analytics'
import { submitLead } from '@/app/actions/lead'

interface BookingFormProps {
  services: { slug: string; title: string }[]
  sourcePage: string
  className?: string
}

const serviceOptions = [
  { value: 'electrical-repairs-troubleshooting', label: 'Electrical Repairs & Troubleshooting' },
  { value: 'panel-upgrades-breakers', label: 'Panel Upgrades & Breakers' },
  { value: 'lighting-ceiling-fans', label: 'Lighting & Ceiling Fans' },
  { value: 'ev-charger-installation', label: 'EV Charger Installation' },
  { value: 'surge-protection', label: 'Surge Protection' },
  { value: 'generator-transfer-switches', label: 'Generator & Transfer Switches' },
  { value: 'smart-home', label: 'Smart Home' },
  { value: 'commercial-electrical', label: 'Commercial Electrical' },
  { value: 'other', label: 'Other / Not Sure' },
]

export function BookingForm({ sourcePage, className }: BookingFormProps) {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: '',
      serviceRequested: '',
      message: '',
      sourcePage,
      website: '', // Honeypot
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    // Check honeypot
    if (data.website) {
      // Bot detected, silently fail
      setStatus('success')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const result = await submitLead(data)

      if (result.success) {
        setStatus('success')
        trackLeadSubmit(data.serviceRequested || 'general')
        reset()
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-2xl font-semibold text-primary mb-2">Thank You!</h3>
            <p className="text-muted mb-6">
              We've received your request and will contact you shortly.
            </p>
            <Button onClick={() => setStatus('idle')}>Submit Another Request</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className} id="booking-form">
      <CardHeader>
        <CardTitle>Request Service</CardTitle>
        <p className="text-muted">Fill out the form below and we'll get back to you ASAP.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot - hidden from users */}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website')}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your name"
              {...register('name')}
              error={errors.name?.message}
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-danger mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              {...register('phone')}
              error={errors.phone?.message}
              className="mt-1"
            />
            {errors.phone && (
              <p className="text-sm text-danger mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City (optional)</Label>
            <Input
              id="city"
              placeholder="Your city"
              {...register('city')}
              error={errors.city?.message}
              className="mt-1"
            />
          </div>

          {/* Service */}
          <div>
            <Label htmlFor="service">Service Needed (optional)</Label>
            <Select
              onValueChange={(value) => setValue('serviceRequested', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your project or issue..."
              {...register('message')}
              error={errors.message?.message}
              className="mt-1"
            />
            {errors.message && (
              <p className="text-sm text-danger mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-danger">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>

          <p className="text-xs text-muted text-center">
            By submitting this form, you agree to be contacted about your service request.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
