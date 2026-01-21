import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Site Config
  console.log('📝 Creating site config...')
  await prisma.siteConfig.upsert({
    where: { id: 'site-config' },
    update: {},
    create: {
      id: 'site-config',
      businessName: 'Velocity Electric',
      phone: '(571) 532-1594',
      email: 'info@velocityelectric.com',
      primaryArea: 'Northern Virginia',
      citiesServed: JSON.stringify([
        'Ashburn',
        'Fairfax',
        'Vienna',
        'Sterling',
        'Leesburg',
        'Purcellville',
        'Winchester',
        'Reston',
        'Manassas',
        'Woodbridge',
      ]),
      hours: 'Mon-Fri 7AM-6PM, Sat 8AM-4PM',
      emergencyEnabled: true,
      licenseNumber: 'VA Master Electrician #2710047894',
      googleReviewUrl: '',
      address: '503 Carlisle Dr. Ste 100, Herndon, VA 20170',
      tagline: 'Your Trusted Master Electrician',
      aboutText:
        'With over 20 years of experience, Velocity Electric has been proudly serving Northern Virginia with reliable, professional electrical services. As a licensed Master Electrician, we bring expertise, integrity, and a commitment to excellence to every job. Our team treats your home like our own, ensuring clean, courteous service every time.',
    },
  })

  // Services
  console.log('⚡ Creating services...')
  const services = [
    {
      slug: 'electrical-repairs-troubleshooting',
      title: 'Electrical Repairs & Troubleshooting',
      excerpt:
        'Fast, reliable electrical repair services for any issue. From flickering lights to tripped breakers, we diagnose and fix problems quickly.',
      contentHtml: `
        <h2>Expert Electrical Repair Services</h2>
        <p>Electrical problems can be frustrating and even dangerous. Our licensed electricians have the experience and tools to quickly diagnose and repair any electrical issue in your home or business.</p>

        <h3>Common Issues We Fix</h3>
        <ul>
          <li>Flickering or dimming lights</li>
          <li>Frequently tripping breakers</li>
          <li>Dead outlets or switches</li>
          <li>Burning smell from outlets</li>
          <li>Buzzing or humming sounds</li>
          <li>Warm outlets or switch plates</li>
        </ul>

        <h3>Our Repair Process</h3>
        <p>We start with a thorough diagnosis to identify the root cause of the problem—not just the symptoms. Our upfront pricing means no surprises, and our work is backed by our satisfaction guarantee.</p>

        <h3>Emergency Repairs</h3>
        <p>Electrical emergencies don't wait for business hours. We offer 24/7 emergency repair services to keep your family safe and your power on.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'How quickly can you respond to an electrical emergency?',
          answer:
            "We offer 24/7 emergency service and typically arrive within 1-2 hours for urgent calls. For non-emergency repairs, we often offer same-day or next-day appointments.",
        },
        {
          question: 'Why do my circuit breakers keep tripping?',
          answer:
            'Frequently tripping breakers can indicate an overloaded circuit, a short circuit, or a ground fault. It could also mean your panel needs upgrading. We can diagnose the exact cause and recommend the best solution.',
        },
        {
          question: 'Is it safe to reset a tripped breaker myself?',
          answer:
            "It's generally safe to reset a tripped breaker once. However, if it trips again immediately or frequently, stop resetting it and call us. Repeated tripping indicates a problem that needs professional attention.",
        },
        {
          question: 'How much do electrical repairs cost?',
          answer:
            'Repair costs vary depending on the issue. We provide upfront pricing before starting any work. Minor repairs may be $100-200, while more complex issues may cost more. We always explain your options.',
        },
      ]),
      iconName: 'Wrench',
      published: true,
      sortOrder: 1,
    },
    {
      slug: 'panel-upgrades-breakers',
      title: 'Panel Upgrades & Breakers',
      excerpt:
        'Upgrade your electrical panel to handle modern power demands. Increase capacity, improve safety, and prepare for future needs.',
      contentHtml: `
        <h2>Electrical Panel Upgrade Services</h2>
        <p>Your electrical panel is the heart of your home's electrical system. An outdated or undersized panel can cause problems and even pose safety risks. We specialize in panel upgrades that bring your home up to modern standards.</p>

        <h3>Signs You Need a Panel Upgrade</h3>
        <ul>
          <li>Frequent breaker trips</li>
          <li>Fuses instead of breakers</li>
          <li>Panel is over 25 years old</li>
          <li>Adding major appliances or EV charger</li>
          <li>Planning a renovation or addition</li>
          <li>Burning smell or visible damage</li>
        </ul>

        <h3>Panel Upgrade Options</h3>
        <p>We offer 100-amp, 200-amp, and 400-amp panel upgrades depending on your needs. Our team will assess your current and future electrical demands to recommend the right solution.</p>

        <h3>The Upgrade Process</h3>
        <p>A typical panel upgrade takes 4-8 hours. We handle all permits and inspections, ensure minimal disruption to your home, and leave the work area clean.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'How long does a panel upgrade take?',
          answer:
            'Most panel upgrades are completed in a single day, typically 4-8 hours. More complex upgrades or those requiring utility coordination may take longer.',
        },
        {
          question: 'Will I need a permit for a panel upgrade?',
          answer:
            'Yes, panel upgrades require permits and inspections. We handle all the paperwork and coordinate with inspectors so you don\'t have to worry about it.',
        },
        {
          question: 'How much does a panel upgrade cost?',
          answer:
            'Panel upgrade costs typically range from $1,500 to $4,000+ depending on the amperage, panel location, and any additional work needed. We provide detailed quotes before starting.',
        },
        {
          question: 'Should I upgrade to 200 amps?',
          answer:
            'For most modern homes, 200 amps is recommended. It provides enough capacity for current appliances plus future needs like EV chargers, hot tubs, or home additions.',
        },
      ]),
      iconName: 'Gauge',
      published: true,
      sortOrder: 2,
    },
    {
      slug: 'lighting-ceiling-fans',
      title: 'Lighting & Ceiling Fans',
      excerpt:
        'Transform your space with professional lighting installation. From recessed lights to chandeliers and ceiling fans, we do it all.',
      contentHtml: `
        <h2>Professional Lighting Installation</h2>
        <p>Great lighting transforms a space. Whether you want to brighten a dark room, add ambiance, or improve energy efficiency, our lighting experts can help you achieve your vision.</p>

        <h3>Lighting Services We Offer</h3>
        <ul>
          <li>Recessed/can light installation</li>
          <li>Pendant and chandelier installation</li>
          <li>Under-cabinet lighting</li>
          <li>Outdoor and landscape lighting</li>
          <li>Dimmer switch installation</li>
          <li>LED upgrades and retrofits</li>
        </ul>

        <h3>Ceiling Fan Installation</h3>
        <p>Ceiling fans improve comfort and energy efficiency year-round. We install all types and sizes, from simple bedroom fans to large outdoor fans. We ensure proper support, balance, and wiring for safe, quiet operation.</p>

        <h3>Smart Lighting Solutions</h3>
        <p>Take control of your lighting with smart switches and bulbs. Program scenes, control from your phone, or use voice commands. We'll set up everything and show you how it works.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'Can you add recessed lights where there are none?',
          answer:
            'Yes! We can add recessed lights to most ceilings. We\'ll assess your ceiling type and determine the best approach, which may include running new wiring from a nearby circuit.',
        },
        {
          question: 'How many recessed lights do I need?',
          answer:
            'The number depends on room size, ceiling height, and how you use the space. A general rule is one light per 4-6 square feet for general lighting. We can create a lighting plan for you.',
        },
        {
          question: 'Can I put a ceiling fan where a light fixture is?',
          answer:
            'Often yes, but the electrical box must be fan-rated to support the weight and motion. We\'ll replace it if needed and ensure safe installation.',
        },
        {
          question: 'Do LED lights really save money?',
          answer:
            'Absolutely! LEDs use 75% less energy than incandescent bulbs and last 25 times longer. The upfront cost is quickly offset by energy savings.',
        },
      ]),
      iconName: 'Lightbulb',
      published: true,
      sortOrder: 3,
    },
    {
      slug: 'ev-charger-installation',
      title: 'EV Charger Installation',
      excerpt:
        'Charge your electric vehicle at home with professional Level 2 charger installation. Fast, safe, and convenient.',
      contentHtml: `
        <h2>Electric Vehicle Charger Installation</h2>
        <p>Make the most of your electric vehicle with a Level 2 home charger. Charge overnight and wake up to a full battery every day. We're certified to install all major brands including Tesla, ChargePoint, JuiceBox, and more.</p>

        <h3>Why Level 2 Charging?</h3>
        <ul>
          <li>5-10x faster than standard outlet (Level 1)</li>
          <li>Full charge overnight for most vehicles</li>
          <li>Convenient—charge while you sleep</li>
          <li>May qualify for utility rebates</li>
          <li>Increases home value</li>
        </ul>

        <h3>Installation Process</h3>
        <p>We start with a site assessment to determine the best location and verify your panel has adequate capacity. We handle permits, install a dedicated circuit (typically 50 amps), mount your charger, and test everything thoroughly.</p>

        <h3>Charger Options</h3>
        <p>We can install a charger you've purchased or recommend one based on your vehicle and needs. Hardwired or plug-in options are available. We also install Tesla Wall Connectors and NEMA 14-50 outlets.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'Do I need to upgrade my panel for an EV charger?',
          answer:
            'Not always. Many homes have enough capacity for a 50-amp EV circuit. We\'ll assess your panel during the site visit and let you know if an upgrade is needed.',
        },
        {
          question: 'How long does EV charger installation take?',
          answer:
            'Most installations take 2-4 hours. If a panel upgrade or long wire run is needed, it may take longer. We\'ll give you a time estimate upfront.',
        },
        {
          question: 'Should I get a hardwired or plug-in charger?',
          answer:
            'Both work well. Hardwired chargers are permanent and slightly cleaner looking. Plug-in chargers (NEMA 14-50) offer flexibility if you move. We can help you decide.',
        },
        {
          question: 'What does EV charger installation cost?',
          answer:
            'Installation typically ranges from $500 to $1,500+ depending on distance from the panel and whether any upgrades are needed. We provide detailed quotes after a site assessment.',
        },
      ]),
      iconName: 'Car',
      published: true,
      sortOrder: 4,
    },
    {
      slug: 'surge-protection',
      title: 'Surge Protection',
      excerpt:
        'Protect your home electronics and appliances from power surges with whole-home surge protection systems.',
      contentHtml: `
        <h2>Whole-Home Surge Protection</h2>
        <p>Power surges can damage or destroy expensive electronics, appliances, and HVAC systems. A whole-home surge protector installed at your electrical panel provides comprehensive protection for everything in your home.</p>

        <h3>What Causes Surges?</h3>
        <ul>
          <li>Lightning strikes (even nearby)</li>
          <li>Utility grid switching</li>
          <li>Large appliances cycling on/off</li>
          <li>Power outages and restoration</li>
        </ul>

        <h3>Benefits of Whole-Home Protection</h3>
        <p>Unlike power strips that only protect what's plugged in, a whole-home surge protector guards your entire electrical system. This includes hardwired items like HVAC, water heater, and garage door opener that power strips can't protect.</p>

        <h3>Professional Installation</h3>
        <p>We install top-rated surge protection devices directly at your electrical panel. Installation typically takes about an hour and provides immediate protection for your home.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'Do I still need power strips with whole-home surge protection?',
          answer:
            'For best protection, use both. Whole-home protection handles large surges; power strips add a second layer of defense for sensitive electronics.',
        },
        {
          question: 'How long do surge protectors last?',
          answer:
            'Quality whole-home surge protectors last 3-5 years or longer, depending on surge activity in your area. Some have indicator lights that show when replacement is needed.',
        },
        {
          question: 'Can surge protection prevent all damage?',
          answer:
            'No surge protector can guarantee 100% protection from direct lightning strikes. However, they significantly reduce the risk of damage from most surges.',
        },
        {
          question: 'What does whole-home surge protection cost?',
          answer:
            'Including installation, whole-home surge protection typically costs $300-600. This small investment can save thousands in potential equipment damage.',
        },
      ]),
      iconName: 'Shield',
      published: true,
      sortOrder: 5,
    },
    {
      slug: 'generator-transfer-switches',
      title: 'Generator & Transfer Switches',
      excerpt:
        'Keep your power on during outages with generator installation and transfer switch services. Automatic or manual options available.',
      contentHtml: `
        <h2>Generator Installation Services</h2>
        <p>Don't let power outages disrupt your life. A standby generator automatically keeps your essential systems running when the grid goes down. We install, service, and repair generators of all sizes.</p>

        <h3>Generator Options</h3>
        <ul>
          <li>Whole-home standby generators</li>
          <li>Portable generator hookups</li>
          <li>Natural gas and propane generators</li>
          <li>Battery backup systems</li>
        </ul>

        <h3>Transfer Switch Installation</h3>
        <p>A transfer switch safely connects your generator to your home's electrical system. We install both automatic transfer switches (for standby generators) and manual transfer switches (for portable generators).</p>

        <h3>Why You Need a Transfer Switch</h3>
        <p>Never plug a generator directly into an outlet—it's dangerous and illegal. A proper transfer switch prevents backfeed that could injure utility workers and damage your home.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'What size generator do I need?',
          answer:
            'Size depends on what you want to power. A 7-10kW generator handles essentials (lights, fridge, sump pump). 15-20kW+ can power most or all of your home. We\'ll help you size it correctly.',
        },
        {
          question: "Can I hook up my portable generator safely?",
          answer:
            'Yes, with a manual transfer switch or interlock kit. We can install either option to let you safely use your portable generator to power selected circuits.',
        },
        {
          question: 'How much does a standby generator cost?',
          answer:
            'Whole-home standby generators with installation typically range from $5,000 to $15,000+ depending on size and features. We provide detailed quotes after assessing your needs.',
        },
        {
          question: 'Do generators require maintenance?',
          answer:
            'Yes, annual maintenance keeps your generator ready when you need it. We offer maintenance services including oil changes, filter replacement, and load testing.',
        },
      ]),
      iconName: 'Power',
      published: true,
      sortOrder: 6,
    },
    {
      slug: 'smart-home',
      title: 'Smart Home',
      excerpt:
        'Upgrade to a connected home with professional smart device installation. Control lights, thermostats, and more from your phone.',
      contentHtml: `
        <h2>Smart Home Electrical Services</h2>
        <p>Transform your home into a smart home with professional installation of connected devices. From smart switches to whole-home automation, we make technology work seamlessly in your space.</p>

        <h3>Smart Devices We Install</h3>
        <ul>
          <li>Smart light switches and dimmers</li>
          <li>Smart thermostats</li>
          <li>Video doorbells and cameras</li>
          <li>Smart locks</li>
          <li>Motorized shades</li>
          <li>Whole-home audio</li>
        </ul>

        <h3>Why Professional Installation?</h3>
        <p>Many smart devices require proper wiring to function correctly. Smart switches often need a neutral wire that older homes may lack. We ensure proper installation and can add wiring where needed.</p>

        <h3>Integration and Setup</h3>
        <p>We don't just install—we set up and integrate your devices so they work together. We'll show you how to use your new smart home features and answer any questions.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'Do smart switches need special wiring?',
          answer:
            'Most smart switches require a neutral wire, which some older homes lack. We can often add a neutral wire or recommend alternative solutions.',
        },
        {
          question: 'Can I install smart devices myself?',
          answer:
            'Simple devices like smart bulbs and plugs are DIY-friendly. Smart switches and hardwired devices should be installed by a licensed electrician for safety.',
        },
        {
          question: 'What smart home platform should I use?',
          answer:
            'It depends on your preferences. We work with all major platforms including Google Home, Amazon Alexa, Apple HomeKit, and others. We can help you choose.',
        },
        {
          question: 'Will my smart devices work if the internet goes out?',
          answer:
            'Most smart switches still work manually without internet. Smart features require internet, but you can always flip the switch the old-fashioned way.',
        },
      ]),
      iconName: 'Smartphone',
      published: true,
      sortOrder: 7,
    },
    {
      slug: 'commercial-electrical',
      title: 'Commercial Electrical',
      excerpt:
        'Professional electrical services for businesses. From retail buildouts to office renovations, we handle commercial projects of all sizes.',
      contentHtml: `
        <h2>Commercial Electrical Services</h2>
        <p>Keep your business running with reliable commercial electrical services. We work with retail stores, offices, restaurants, warehouses, and more to provide dependable electrical solutions.</p>

        <h3>Commercial Services</h3>
        <ul>
          <li>New construction wiring</li>
          <li>Tenant improvements and buildouts</li>
          <li>Lighting retrofits and upgrades</li>
          <li>Power distribution</li>
          <li>Equipment circuits</li>
          <li>Emergency and exit lighting</li>
          <li>Parking lot lighting</li>
        </ul>

        <h3>Minimize Downtime</h3>
        <p>We understand that downtime costs money. We work efficiently and can schedule work during off-hours to minimize disruption to your business.</p>

        <h3>Code Compliance</h3>
        <p>Commercial electrical work must meet strict codes and pass inspection. Our licensed electricians ensure all work is up to code and properly documented.</p>
      `,
      faqsJson: JSON.stringify([
        {
          question: 'Do you work with general contractors?',
          answer:
            'Yes, we frequently partner with general contractors on commercial projects. We coordinate scheduling and work seamlessly with other trades.',
        },
        {
          question: 'Can you work outside business hours?',
          answer:
            'Absolutely. We regularly schedule commercial work for evenings and weekends to minimize disruption to your business operations.',
        },
        {
          question: 'Do you handle permit and inspection coordination?',
          answer:
            'Yes, we handle all permitting and schedule inspections. We ensure your project passes inspection and meets all code requirements.',
        },
        {
          question: 'What types of businesses do you serve?',
          answer:
            'We serve all types of commercial clients including retail, restaurants, offices, medical facilities, warehouses, and industrial spaces.',
        },
      ]),
      iconName: 'Building2',
      published: true,
      sortOrder: 8,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    })
  }

  // Testimonials
  console.log('⭐ Creating testimonials...')
  const testimonials = [
    {
      name: 'Jennifer M.',
      rating: 5,
      text: "Velocity Electric did an amazing job upgrading our panel. The team was professional, explained everything clearly, and finished on time. Our house finally has enough power for all our modern appliances. Highly recommend!",
      location: 'Ashburn',
      published: true,
    },
    {
      name: 'Robert K.',
      rating: 5,
      text: 'Called them for an emergency at 10pm when our power went out. They arrived within an hour and had everything fixed. Fair pricing even for late-night work. These guys are the real deal.',
      location: 'Fairfax',
      published: true,
    },
    {
      name: 'Sarah L.',
      rating: 5,
      text: 'We had recessed lights installed throughout our main floor and the results are stunning. Clean work, respectful of our home, and the price was exactly what was quoted. Will definitely use again.',
      location: 'Vienna',
      published: true,
    },
    {
      name: 'Michael D.',
      rating: 5,
      text: 'Finally got a Level 2 EV charger installed in our garage. The electrician walked me through all my options and even helped me apply for the utility rebate. Excellent service from start to finish.',
      location: 'Sterling',
      published: true,
    },
    {
      name: 'Patricia H.',
      rating: 5,
      text: 'Very impressed with their knowledge and professionalism. They troubleshot a tricky wiring issue that two other electricians couldn\'t figure out. Fixed it in one visit. Worth every penny.',
      location: 'Leesburg',
      published: true,
    },
    {
      name: 'David W.',
      rating: 5,
      text: 'Great experience with our whole-house surge protector installation. The electrician was knowledgeable, efficient, and cleaned up perfectly. Good to have peace of mind protecting our electronics.',
      location: 'Purcellville',
      published: true,
    },
    {
      name: 'Linda B.',
      rating: 5,
      text: 'They installed a standby generator for us before hurricane season. The automatic transfer switch works flawlessly. Lost power twice already and the generator kicked in immediately both times.',
      location: 'Winchester',
      published: true,
    },
    {
      name: 'James T.',
      rating: 5,
      text: 'Had them do a complete smart home upgrade - switches, thermostats, doorbell. They made sure everything worked together perfectly. My wife and I love controlling everything from our phones now.',
      location: 'Reston',
      published: true,
    },
    {
      name: 'Nancy S.',
      rating: 5,
      text: 'Used Velocity Electric for our restaurant buildout. They worked around our schedule, passed inspection first time, and the lighting looks fantastic. Definitely recommend for commercial work.',
      location: 'Manassas',
      published: true,
    },
    {
      name: 'Thomas R.',
      rating: 5,
      text: 'Honest, reliable, and fairly priced. Been using them for years for all our electrical needs. They always show up when they say they will and stand behind their work. Can\'t ask for more.',
      location: 'Woodbridge',
      published: true,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial })
  }

  // Service Areas - Northern Virginia cities
  console.log('📍 Creating service areas...')
  const serviceAreas = [
    {
      city: 'Ashburn',
      state: 'VA',
      slug: 'ashburn',
      intro:
        'Velocity Electric proudly serves Ashburn residents and businesses with professional electrical services. As your local Master Electrician, we understand the unique electrical needs of Ashburn homes, from data center corridor properties to the newest developments in Loudoun County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Same-Day Service',
          description:
            'Most Ashburn service calls are completed same-day or next-day.',
        },
        {
          title: 'Data Center Expertise',
          description:
            'We understand the high-power demands of Ashburn area homes and businesses.',
        },
        {
          title: 'Community Trusted',
          description:
            'Serving Ashburn families and businesses for over 20 years.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'Do you serve all of Ashburn?',
          answer:
            'Yes! We serve all Ashburn neighborhoods including Broadlands, Ashburn Village, Ashburn Farm, Brambleton, and surrounding areas.',
        },
        {
          question: 'How quickly can you come to Ashburn?',
          answer:
            'We typically offer same-day or next-day service for Ashburn addresses. Emergency calls are prioritized.',
        },
        {
          question: 'Are there any extra charges for Ashburn service?',
          answer:
            "No! Ashburn is in our primary service area with no travel fees or extra charges.",
        },
        {
          question: 'Do you work on new construction in Ashburn?',
          answer:
            'Absolutely. We work on both new construction and existing homes throughout Loudoun County.',
        },
        {
          question: 'Can you help with permit requirements in Ashburn?',
          answer:
            'Yes, we handle all permit applications and inspections. We\'re familiar with Loudoun County building department requirements.',
        },
      ]),
      published: true,
    },
    {
      city: 'Fairfax',
      state: 'VA',
      slug: 'fairfax',
      intro:
        'Looking for a trusted electrician in Fairfax? Velocity Electric provides comprehensive electrical services to Fairfax homes and businesses. Our licensed electricians deliver quality workmanship and outstanding customer service throughout Fairfax County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Fast Response',
          description: 'Quick service for all Fairfax electrical needs.',
        },
        {
          title: 'Licensed & Insured',
          description: 'Fully licensed Master Electrician serving Fairfax.',
        },
        {
          title: 'Fair Pricing',
          description: 'Competitive rates with upfront pricing for Fairfax residents.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'What areas of Fairfax do you service?',
          answer:
            'We serve all of Fairfax including City of Fairfax, Fair Oaks, Burke, Fairfax Station, and surrounding neighborhoods.',
        },
        {
          question: 'Do you offer emergency service in Fairfax?',
          answer:
            'Yes! We provide 24/7 emergency electrical service to Fairfax customers.',
        },
        {
          question: 'How do I schedule service in Fairfax?',
          answer:
            'Call us or fill out our online form. We typically can schedule Fairfax appointments within 1-2 business days.',
        },
        {
          question: 'Are your Fairfax electricians licensed?',
          answer:
            'Yes, all our electricians are licensed, insured, and background-checked.',
        },
        {
          question: 'Do you do commercial work in Fairfax?',
          answer:
            'Absolutely! We serve Fairfax businesses of all sizes from small retail to large commercial properties.',
        },
      ]),
      published: true,
    },
    {
      city: 'Vienna',
      state: 'VA',
      slug: 'vienna',
      intro:
        'Velocity Electric is Vienna\'s preferred electrical contractor. We provide residential and commercial electrical services with a focus on quality, safety, and customer satisfaction in this historic Northern Virginia town.',
      highlightsJson: JSON.stringify([
        {
          title: 'Quality Work',
          description: 'Meticulous attention to detail on every Vienna job.',
        },
        {
          title: 'Historic Home Expertise',
          description: 'Experience with older Vienna homes and updated wiring.',
        },
        {
          title: 'Satisfaction Guaranteed',
          description: '100% satisfaction guarantee on all Vienna services.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'Why choose Velocity Electric for Vienna homes?',
          answer:
            'We combine technical expertise with personalized service. Our electricians treat your Vienna home with respect and keep work areas clean.',
        },
        {
          question: 'What electrical services do you offer in Vienna?',
          answer:
            'We offer full-service electrical including repairs, installations, panel upgrades, lighting, EV chargers, and more.',
        },
        {
          question: 'Can you upgrade my Vienna home\'s electrical panel?',
          answer:
            'Yes! Panel upgrades are one of our specialties. We can upgrade your Vienna home to 200 amps or higher.',
        },
        {
          question: 'Do you work on older Vienna homes?',
          answer:
            'Yes, we have extensive experience with older homes including knob-and-tube rewiring and bringing electrical systems up to code.',
        },
        {
          question: 'How much does an electrician cost in Vienna?',
          answer:
            'Our rates are competitive with other Vienna electricians. We provide upfront pricing so you know exactly what to expect.',
        },
      ]),
      published: true,
    },
    {
      city: 'Sterling',
      state: 'VA',
      slug: 'sterling',
      intro:
        'Serving Sterling with expert electrical services. Whether you need a simple repair or a complete rewire, Velocity Electric has the skills and experience to get the job done right in Sterling and eastern Loudoun County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Experienced Team',
          description: '20+ years serving Sterling families.',
        },
        {
          title: 'Wide Service Range',
          description: 'From repairs to new construction.',
        },
        {
          title: 'Honest Service',
          description: 'We\'ll never sell you something you don\'t need.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'How long have you been serving Sterling?',
          answer:
            'We\'ve been proudly serving Sterling homeowners and businesses for over 20 years.',
        },
        {
          question: 'Do you offer free estimates in Sterling?',
          answer:
            'Yes! We provide free estimates for most Sterling electrical projects.',
        },
        {
          question: 'Can you install an EV charger at my Sterling home?',
          answer:
            'Absolutely! We\'re certified to install all major EV charger brands in Sterling.',
        },
        {
          question: 'Do you work on weekends in Sterling?',
          answer:
            'Yes, we offer Saturday appointments for Sterling customers.',
        },
        {
          question: 'Are you familiar with Loudoun County building codes?',
          answer:
            'Yes, we\'re well-versed in local codes and handle all permits and inspections.',
        },
      ]),
      published: true,
    },
    {
      city: 'Leesburg',
      state: 'VA',
      slug: 'leesburg',
      intro:
        'Leesburg residents trust Velocity Electric for reliable electrical services. Our team of licensed electricians provides prompt, professional service for all your electrical needs in historic Leesburg and surrounding areas.',
      highlightsJson: JSON.stringify([
        {
          title: 'Reliable Service',
          description: 'On-time, every time for Leesburg customers.',
        },
        {
          title: 'Historic District Experience',
          description: 'Skilled work in Leesburg\'s historic downtown.',
        },
        {
          title: 'Prompt Response',
          description: 'Fast scheduling for Leesburg area.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'What\'s your response time for Leesburg?',
          answer:
            'We typically schedule Leesburg appointments within 1-2 days. Emergency calls receive priority.',
        },
        {
          question: 'Do you service both old and new Leesburg homes?',
          answer:
            'Yes! We work on homes of all ages, from historic Leesburg properties to brand new construction in Lansdowne and River Creek.',
        },
        {
          question: 'Can you add outdoor lighting to my Leesburg home?',
          answer:
            'Yes, we install all types of outdoor and landscape lighting.',
        },
        {
          question: 'Do you offer maintenance services in Leesburg?',
          answer:
            'Yes, we offer electrical safety inspections and maintenance services.',
        },
        {
          question: 'What payment methods do you accept in Leesburg?',
          answer:
            'We accept cash, check, and all major credit cards.',
        },
      ]),
      published: true,
    },
    {
      city: 'Purcellville',
      state: 'VA',
      slug: 'purcellville',
      intro:
        'Velocity Electric brings professional electrical services to Purcellville. We\'re committed to providing safe, reliable electrical work at fair prices in western Loudoun County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Safe Work',
          description: 'Safety is our top priority on every job.',
        },
        {
          title: 'Fair Prices',
          description: 'Competitive rates with no hidden fees.',
        },
        {
          title: 'Rural Experience',
          description: 'Experienced with rural properties and well pumps.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'Is Purcellville in your service area?',
          answer:
            'Yes! Purcellville and all of western Loudoun County are in our service area.',
        },
        {
          question: 'Can you help with a Purcellville home sale inspection?',
          answer:
            'Yes, we can perform electrical inspections and make repairs needed for home sales.',
        },
        {
          question: 'Do you install whole-house surge protection in Purcellville?',
          answer:
            'Yes, we install and recommend whole-house surge protection for Purcellville homes, especially important in rural areas.',
        },
        {
          question: 'Can you work on well pump electrical in Purcellville?',
          answer:
            'Yes, we service well pump electrical systems throughout western Loudoun.',
        },
        {
          question: 'What brands do you work with?',
          answer:
            'We work with all major brands and can recommend quality products for your needs.',
        },
      ]),
      published: true,
    },
    {
      city: 'Winchester',
      state: 'VA',
      slug: 'winchester',
      intro:
        'Your trusted electrician in Winchester. Velocity Electric provides comprehensive electrical services with a commitment to excellence and customer satisfaction in Winchester and Frederick County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Excellence',
          description: 'High-quality work on every project.',
        },
        {
          title: 'Trust',
          description: 'Building long-term relationships in Winchester.',
        },
        {
          title: 'Valley Coverage',
          description: 'Serving Winchester and the Shenandoah Valley.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'How do I book an electrician in Winchester?',
          answer:
            'Call us or use our online booking form. We\'ll schedule a convenient time.',
        },
        {
          question: 'Do you provide written estimates for Winchester jobs?',
          answer:
            'Yes, we provide detailed written estimates before starting work.',
        },
        {
          question: 'Can you add circuits in my Winchester garage?',
          answer:
            'Yes, we frequently add circuits for workshops, EV chargers, and appliances.',
        },
        {
          question: 'Do you offer senior discounts in Winchester?',
          answer:
            'Yes, we offer a 10% senior discount on labor. Ask when scheduling.',
        },
        {
          question: 'Is your work guaranteed in Winchester?',
          answer:
            'Yes, all our work is backed by our satisfaction guarantee.',
        },
      ]),
      published: true,
    },
    {
      city: 'Reston',
      state: 'VA',
      slug: 'reston',
      intro:
        'Reston homeowners choose Velocity Electric for quality electrical services. Our experienced team handles everything from simple repairs to complex installations in this planned community.',
      highlightsJson: JSON.stringify([
        {
          title: 'Quality Focus',
          description: 'Premium workmanship on every Reston job.',
        },
        {
          title: 'Condo Experience',
          description: 'Experienced with Reston condos and townhomes.',
        },
        {
          title: 'Full Service',
          description: 'Complete electrical solutions available.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'What makes you different from other Reston electricians?',
          answer:
            'We combine technical expertise with genuine customer care. Our goal is long-term relationships, not just one-time jobs.',
        },
        {
          question: 'Can you work on Reston condos and townhomes?',
          answer:
            'Yes, we have extensive experience with Reston condominiums, townhomes, and cluster homes.',
        },
        {
          question: 'Do you install smart home devices in Reston?',
          answer:
            'Yes! We install and configure smart switches, thermostats, and more.',
        },
        {
          question: 'What hours are you available in Reston?',
          answer:
            'Regular hours are Mon-Fri 7AM-6PM, Sat 8AM-4PM. Emergency service is available 24/7.',
        },
        {
          question: 'Do you do commercial work in Reston?',
          answer:
            'Yes, we serve Reston businesses including those in Reston Town Center.',
        },
      ]),
      published: true,
    },
    {
      city: 'Manassas',
      state: 'VA',
      slug: 'manassas',
      intro:
        'Velocity Electric serves the Manassas community with professional electrical services. Count on us for honest advice, quality work, and fair pricing in Manassas and Prince William County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Honest',
          description: 'Straightforward advice you can trust.',
        },
        {
          title: 'Quality',
          description: 'Work that meets our high standards.',
        },
        {
          title: 'Local Knowledge',
          description: 'Familiar with Manassas and PWC requirements.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'Do you serve residential and commercial in Manassas?',
          answer:
            'Yes, we provide both residential and commercial electrical services in Manassas and Manassas Park.',
        },
        {
          question: 'Can you install a generator at my Manassas home?',
          answer:
            'Yes, we install standby generators and transfer switches for Manassas homes.',
        },
        {
          question: 'Do you fix code violations in Manassas?',
          answer:
            'Yes, we correct code violations and bring electrical systems up to current standards.',
        },
        {
          question: 'What if I\'m not satisfied with the work?',
          answer:
            'We offer a 100% satisfaction guarantee. If something isn\'t right, we\'ll make it right.',
        },
        {
          question: 'How do I get a quote for Manassas service?',
          answer:
            'Call us or submit an online request. Most quotes are provided same-day.',
        },
      ]),
      published: true,
    },
    {
      city: 'Woodbridge',
      state: 'VA',
      slug: 'woodbridge',
      intro:
        'Looking for a reliable electrician in Woodbridge? Velocity Electric provides top-quality electrical services backed by years of experience and thousands of satisfied customers in Prince William County.',
      highlightsJson: JSON.stringify([
        {
          title: 'Reliable',
          description: 'Dependable service Woodbridge can count on.',
        },
        {
          title: 'Proven',
          description: 'Thousands of successful projects.',
        },
        {
          title: 'Local',
          description: 'Serving our Woodbridge neighbors with pride.',
        },
      ]),
      faqsJson: JSON.stringify([
        {
          question: 'Why should I choose you for Woodbridge electrical work?',
          answer:
            'We offer the perfect combination of technical skill, fair pricing, and genuine customer care.',
        },
        {
          question: 'Can you add dedicated circuits in Woodbridge?',
          answer:
            'Yes, we add circuits for appliances, home offices, workshops, and more.',
        },
        {
          question: 'Do you do electrical inspections in Woodbridge?',
          answer:
            'Yes, we offer safety inspections and can provide reports for real estate transactions.',
        },
        {
          question: 'What\'s your warranty on Woodbridge work?',
          answer:
            'We offer a 1-year workmanship warranty on all electrical work performed.',
        },
        {
          question: 'Are you available for same-day service in Woodbridge?',
          answer:
            'Often yes! Call us and we\'ll do our best to accommodate same-day requests.',
        },
      ]),
      published: true,
    },
  ]

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { slug: area.slug },
      update: area,
      create: area,
    })
  }

  // Promos (all unpublished by default as specified)
  console.log('🏷️ Creating promos...')
  const promos = [
    {
      title: '$50 Off Any Service',
      description:
        'New customers save $50 on any electrical service over $200. Mention this offer when scheduling.',
      code: 'WELCOME50',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      published: false,
      sortOrder: 1,
    },
    {
      title: 'Free Panel Inspection',
      description:
        'Get a free electrical panel safety inspection with any service call. We\'ll check for hazards and capacity issues.',
      code: null,
      expiresAt: null,
      published: false,
      sortOrder: 2,
    },
    {
      title: '10% Senior Discount',
      description:
        'Seniors 65+ receive 10% off labor on all electrical services. Thank you for your trust!',
      code: 'SENIOR10',
      expiresAt: null,
      published: false,
      sortOrder: 3,
    },
    {
      title: '$100 Off Panel Upgrade',
      description:
        'Save $100 on any electrical panel upgrade. Upgrade to 200 amps and power your modern lifestyle.',
      code: 'PANEL100',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      published: false,
      sortOrder: 4,
    },
  ]

  for (const promo of promos) {
    await prisma.promo.create({ data: promo })
  }

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('Summary:')
  console.log('- Site config created')
  console.log(`- ${services.length} services created`)
  console.log(`- ${testimonials.length} testimonials created`)
  console.log(`- ${serviceAreas.length} service areas created`)
  console.log(`- ${promos.length} promos created (unpublished)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
