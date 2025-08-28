import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from '@/components/hero'
import BenefitGrid from '@/components/benefit-grid'
import ProductTeaser from '@/components/product-teaser'
import SocialProof from '@/components/social-proof'
import CTABand from '@/components/cta-band'
import { pageSEO } from '@/lib/seo'

const Home: React.FC = () => {
  const seo = pageSEO.home

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VidyalayaOne",
            "description": "Complete school management system for modern educational institutions",
            "url": "https://vidyalayaone.com",
            "logo": "https://vidyalayaone.com/logo.png",
            "sameAs": [
              "https://twitter.com/vidyalayaone",
              "https://linkedin.com/company/vidyalayaone"
            ]
          })}
        </script>
      </Helmet>

      <Hero
        title="Run your entire school on one platform"
        subtitle="Complete school management system with admissions, fees, attendance, exams, and communication. Trusted by 100+ schools across India."
      />
      
      <BenefitGrid />
      
      <ProductTeaser />
      
      <SocialProof />
      
      <CTABand />
    </>
  )
}

export default Home
