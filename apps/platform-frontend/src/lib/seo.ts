export interface SEOData {
  title: string
  description: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export const defaultSEO: SEOData = {
  title: 'VidyalayaOne - All-in-one School ERP | Streamline Operations',
  description: 'Complete school management system with admissions, fees, attendance, exams, and communication. Trusted by educational institutions across India.',
  keywords: 'school management system, school ERP, education software, student management, school administration',
  ogTitle: 'VidyalayaOne - All-in-one School ERP',
  ogDescription: 'Streamline your school operations with our comprehensive management system',
  ogImage: '/og-image.jpg'
}

export const pageSEO: Record<string, SEOData> = {
  home: {
    title: 'VidyalayaOne - All-in-one School ERP | Streamline Operations',
    description: 'Complete school management system with admissions, fees, attendance, exams, and communication. Trusted by educational institutions across India.',
    keywords: 'school management system, school ERP, education software, student management'
  },
  platform: {
    title: 'Platform Features - VidyalayaOne School ERP',
    description: 'Discover all the powerful features of VidyalayaOne including admissions, student management, attendance, exams, fees, and communication tools.',
    keywords: 'school platform features, education management modules, school software capabilities'
  },
  whyUs: {
    title: 'Why Choose VidyalayaOne - School Management System',
    description: 'Learn why schools choose VidyalayaOne for usability, all-in-one solution, security, scalability, and parent engagement.',
    keywords: 'why choose vidyalayaone, school erp benefits, education software advantages'
  },
  pricing: {
    title: 'Pricing - VidyalayaOne School ERP',
    description: 'Simple and affordable pricing for VidyalayaOne school management system. Get started with our comprehensive solution today.',
    keywords: 'school erp pricing, education software cost, school management system price'
  },
  about: {
    title: 'About VidyalayaOne - School Management System',
    description: 'Learn about VidyalayaOne\'s mission to transform education through technology and our commitment to educational excellence.',
    keywords: 'about vidyalayaone, company mission, education technology, school erp company'
  },
  contact: {
    title: 'Contact VidyalayaOne - Get in Touch',
    description: 'Contact VidyalayaOne for inquiries about our school management system. Get support, book a demo, or ask questions.',
    keywords: 'contact vidyalayaone, school erp support, education software contact'
  }
}
