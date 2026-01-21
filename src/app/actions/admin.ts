'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { clearConfigCache } from '@/lib/config'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  if (authCookie?.value !== 'authenticated') {
    throw new Error('Unauthorized')
  }
}

// Services
export async function createService(formData: FormData) {
  await checkAdminAuth()

  const data = {
    slug: formData.get('slug') as string,
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    contentHtml: formData.get('contentHtml') as string,
    faqsJson: formData.get('faqsJson') as string || '[]',
    iconName: formData.get('iconName') as string || 'Zap',
    published: formData.get('published') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    metaTitle: formData.get('metaTitle') as string || null,
    metaDescription: formData.get('metaDescription') as string || null,
  }

  await prisma.service.create({ data })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  redirect('/admin/services')
}

export async function updateService(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const data = {
    slug: formData.get('slug') as string,
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    contentHtml: formData.get('contentHtml') as string,
    faqsJson: formData.get('faqsJson') as string || '[]',
    iconName: formData.get('iconName') as string || 'Zap',
    published: formData.get('published') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    metaTitle: formData.get('metaTitle') as string || null,
    metaDescription: formData.get('metaDescription') as string || null,
  }

  await prisma.service.update({ where: { id }, data })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath(`/services/${data.slug}`)
  redirect('/admin/services')
}

export async function toggleServicePublished(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const service = await prisma.service.findUnique({ where: { id } })

  if (service) {
    await prisma.service.update({
      where: { id },
      data: { published: !service.published },
    })
    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath(`/services/${service.slug}`)
  }
}

export async function deleteService(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  await prisma.service.delete({ where: { id } })
  revalidatePath('/admin/services')
  revalidatePath('/services')
  redirect('/admin/services')
}

// Service Areas
export async function createServiceArea(formData: FormData) {
  await checkAdminAuth()

  const data = {
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    slug: formData.get('slug') as string,
    intro: formData.get('intro') as string,
    highlightsJson: formData.get('highlightsJson') as string || '[]',
    faqsJson: formData.get('faqsJson') as string || '[]',
    published: formData.get('published') === 'true',
  }

  await prisma.serviceArea.create({ data })
  revalidatePath('/admin/service-areas')
  revalidatePath('/service-areas')
  redirect('/admin/service-areas')
}

export async function updateServiceArea(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const data = {
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    slug: formData.get('slug') as string,
    intro: formData.get('intro') as string,
    highlightsJson: formData.get('highlightsJson') as string || '[]',
    faqsJson: formData.get('faqsJson') as string || '[]',
    published: formData.get('published') === 'true',
  }

  await prisma.serviceArea.update({ where: { id }, data })
  revalidatePath('/admin/service-areas')
  revalidatePath('/service-areas')
  revalidatePath(`/service-areas/${data.slug}`)
  redirect('/admin/service-areas')
}

export async function toggleServiceAreaPublished(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const area = await prisma.serviceArea.findUnique({ where: { id } })

  if (area) {
    await prisma.serviceArea.update({
      where: { id },
      data: { published: !area.published },
    })
    revalidatePath('/admin/service-areas')
    revalidatePath('/service-areas')
    revalidatePath(`/service-areas/${area.slug}`)
  }
}

export async function deleteServiceArea(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  await prisma.serviceArea.delete({ where: { id } })
  revalidatePath('/admin/service-areas')
  revalidatePath('/service-areas')
  redirect('/admin/service-areas')
}

// Testimonials
export async function createTestimonial(formData: FormData) {
  await checkAdminAuth()

  const data = {
    name: formData.get('name') as string,
    rating: parseInt(formData.get('rating') as string) || 5,
    text: formData.get('text') as string,
    location: formData.get('location') as string || null,
    published: formData.get('published') === 'true',
  }

  await prisma.testimonial.create({ data })
  revalidatePath('/admin/testimonials')
  revalidatePath('/reviews')
  redirect('/admin/testimonials')
}

export async function updateTestimonial(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const data = {
    name: formData.get('name') as string,
    rating: parseInt(formData.get('rating') as string) || 5,
    text: formData.get('text') as string,
    location: formData.get('location') as string || null,
    published: formData.get('published') === 'true',
  }

  await prisma.testimonial.update({ where: { id }, data })
  revalidatePath('/admin/testimonials')
  revalidatePath('/reviews')
  redirect('/admin/testimonials')
}

export async function toggleTestimonialPublished(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const testimonial = await prisma.testimonial.findUnique({ where: { id } })

  if (testimonial) {
    await prisma.testimonial.update({
      where: { id },
      data: { published: !testimonial.published },
    })
    revalidatePath('/admin/testimonials')
    revalidatePath('/reviews')
  }
}

export async function deleteTestimonial(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  await prisma.testimonial.delete({ where: { id } })
  revalidatePath('/admin/testimonials')
  revalidatePath('/reviews')
  redirect('/admin/testimonials')
}

// Promos
export async function createPromo(formData: FormData) {
  await checkAdminAuth()

  const expiresAtStr = formData.get('expiresAt') as string
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    code: formData.get('code') as string || null,
    expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
    published: formData.get('published') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
  }

  await prisma.promo.create({ data })
  revalidatePath('/admin/promos')
  revalidatePath('/specials')
  redirect('/admin/promos')
}

export async function updatePromo(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const expiresAtStr = formData.get('expiresAt') as string
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    code: formData.get('code') as string || null,
    expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
    published: formData.get('published') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
  }

  await prisma.promo.update({ where: { id }, data })
  revalidatePath('/admin/promos')
  revalidatePath('/specials')
  redirect('/admin/promos')
}

export async function togglePromoPublished(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  const promo = await prisma.promo.findUnique({ where: { id } })

  if (promo) {
    await prisma.promo.update({
      where: { id },
      data: { published: !promo.published },
    })
    revalidatePath('/admin/promos')
    revalidatePath('/specials')
  }
}

export async function deletePromo(formData: FormData) {
  await checkAdminAuth()

  const id = formData.get('id') as string
  await prisma.promo.delete({ where: { id } })
  revalidatePath('/admin/promos')
  revalidatePath('/specials')
  redirect('/admin/promos')
}

// Site Config
export async function updateSiteConfig(formData: FormData) {
  await checkAdminAuth()

  const data = {
    businessName: formData.get('businessName') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    primaryArea: formData.get('primaryArea') as string,
    citiesServed: formData.get('citiesServed') as string,
    hours: formData.get('hours') as string,
    emergencyEnabled: formData.get('emergencyEnabled') === 'true',
    licenseNumber: formData.get('licenseNumber') as string || '',
    googleReviewUrl: formData.get('googleReviewUrl') as string || '',
    address: formData.get('address') as string,
    tagline: formData.get('tagline') as string,
    aboutText: formData.get('aboutText') as string,
  }

  await prisma.siteConfig.upsert({
    where: { id: 'site-config' },
    update: data,
    create: { id: 'site-config', ...data },
  })

  clearConfigCache()
  revalidatePath('/')
  revalidatePath('/admin/settings')
}
