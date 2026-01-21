import { Phone, Calendar, Wrench, ThumbsUp } from 'lucide-react'
import { Section } from '@/components/ui/section'

const steps = [
  {
    icon: Phone,
    title: 'Call or Book Online',
    description: 'Contact us by phone or schedule online. We\'ll gather details about your electrical needs.',
  },
  {
    icon: Calendar,
    title: 'Schedule Service',
    description: 'We\'ll find a convenient time that works for your schedule, often same-day or next-day.',
  },
  {
    icon: Wrench,
    title: 'Professional Service',
    description: 'Our licensed electrician arrives on time, diagnoses the issue, and provides upfront pricing.',
  },
  {
    icon: ThumbsUp,
    title: 'Complete Satisfaction',
    description: 'We ensure the job is done right. Your satisfaction is backed by our guarantee.',
  },
]

export function WhatToExpect() {
  return (
    <Section background="surface">
      <div className="text-center mb-12">
        <h2 className="mb-4">What to Expect</h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Simple, transparent, and stress-free electrical service from start to finish.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="relative">
            {/* Connector Line (hidden on mobile, first item, and last item on specific breakpoints) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5 bg-border" />
            )}

            <div className="flex flex-col items-center text-center">
              {/* Step Number & Icon */}
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-primary mb-2">{step.title}</h3>
              <p className="text-muted text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
