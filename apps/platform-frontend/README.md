# VidyalayaOne Platform Frontend

A modern marketing website for VidyalayaOne's school management platform, built with the exact same stack as the main school frontend for perfect design consistency.

## 🚀 Tech Stack

- **Framework**: Vite 5.4.19 + React 18.3.1
- **Language**: TypeScript 5.6.3
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Package Manager**: pnpm (workspace setup)
- **Build Tool**: Vite with TypeScript support
- **SEO**: React Helmet Async

## 📁 Project Structure

```
apps/platform-frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Core UI components (Button, Card, Input, Badge)
│   │   └── layout/       # Layout components (Navbar, Footer)
│   ├── pages/           # Main page components
│   │   ├── Home.tsx     # Landing page with hero & benefits
│   │   ├── Platform.tsx # Platform overview with TOC
│   │   ├── WhyUs.tsx    # Why choose us differentiators
│   │   ├── Pricing.tsx  # Pricing with payment integration
│   │   ├── About.tsx    # About us with timeline
│   │   └── Contact.tsx  # Contact form & info
│   ├── components/page/ # Reusable page sections
│   │   ├── Hero.tsx     # Hero sections
│   │   ├── BenefitGrid.tsx
│   │   ├── ProductTeaser.tsx
│   │   ├── SocialProof.tsx
│   │   └── CTABand.tsx
│   ├── lib/             # Utilities and configurations
│   │   ├── utils.ts     # Utility functions
│   │   └── seo.ts       # SEO configurations
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🎨 Design System

This project maintains **exact design parity** with the main school frontend:

- **Colors**: Same custom color palette and gradients
- **Typography**: Consistent font weights and sizing
- **Components**: Identical UI component styling
- **Spacing**: Same padding, margins, and layout grid
- **Responsive**: Mobile-first design with same breakpoints

## 🔧 Development

### Prerequisites

- Node.js 18+
- pnpm (for workspace management)

### Installation

```bash
# From workspace root
pnpm install

# Or specifically for platform-frontend
pnpm install --filter platform-frontend
```

### Running the Development Server

```bash
# From workspace root
pnpm --filter platform-frontend dev

# Or from platform-frontend directory
cd apps/platform-frontend
pnpm dev
```

The application will be available at `http://localhost:8081`

### Building for Production

```bash
# From workspace root
pnpm --filter platform-frontend build

# Or from platform-frontend directory
cd apps/platform-frontend
pnpm build
```

### Preview Production Build

```bash
# From workspace root
pnpm --filter platform-frontend preview

# Or from platform-frontend directory
cd apps/platform-frontend
pnpm preview
```

## 🔌 Payment Integration

The pricing page integrates with the payment service API:

- **Endpoint**: `http://localhost:3005/api/v1/payments`
- **Environment Variable**: `VITE_PAYMENT_API_URL`
- **Features**: Order creation, payment verification, status tracking

### Environment Setup

Create a `.env.local` file:

```env
VITE_PAYMENT_API_URL=http://localhost:3005/api/v1/payments
VITE_AUTH_API_URL=http://localhost:3001/api/v1
VITE_SCHOOL_API_URL=http://localhost:3002/api/v1
VITE_APP_BASE_URL=http://localhost:8080
VITE_PLATFORM_APP_URL=http://localhost:8081
VITE_DEMO_URL=http://localhost:8081/contact
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

## 📄 Pages Overview

### Static Marketing Pages

### 1. Home (`/`)
- Hero section with main value proposition
- Benefits grid showcasing key features
- Product teaser with screenshots
- Social proof with testimonials and stats
- Call-to-action band

### 2. Platform (`/platform`)
- Detailed platform overview
- Table of contents with smooth scrolling
- Feature sections with icons and descriptions
- Mobile-optimized jump navigation

### 3. Why Us (`/why-us`)
- Differentiators grid
- Key statistics
- Competitive advantages
- Value propositions

### 4. Pricing (`/pricing`)
- Single Basic tier at ₹1 one-time payment
- Feature list with checkmarks
- Redirects to register page on "Get Started"

### 5. About (`/about`)
- Company timeline with milestones
- Leadership team profiles
- Core values and mission
- Company story and vision

### 6. Contact (`/contact`)
- Contact form with validation
- Contact information panel
- Office hours and location
- FAQ section

### Authentication & User Flow

### 7. Register (`/register`)
- User registration form
- Form validation
- Redirects to create-school after successful registration
- Links to login page

### 8. Login (`/login`)
- User authentication
- Smart redirects based on user state:
  - No school → create-school
  - School exists but no payment → payment
  - School with payment → dashboard

### 9. Create School (`/create-school`)
- Comprehensive school information form
- Form data persistence in localStorage
- Automatic restoration of incomplete forms
- Creates school with status='pending' and plan=null
- Redirects to payment page

### 10. Payment (`/payment`)
- Displays school details and plan information
- Razorpay payment integration
- Order creation and payment verification
- Secure payment processing

### 11. Dashboard (`/dashboard`)
- User and school information display
- School status (pending/active/inactive)
- Subdomain link when active
- Quick action cards for support and training

## 🎯 SEO Configuration

Each page includes:
- Custom meta titles and descriptions
- Open Graph tags for social sharing
- Structured keywords
- Helmet async for head management

## 🚀 Deployment

The application is configured for static deployment and can be hosted on:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🔄 Theme Synchronization

To maintain design consistency with the main school frontend:

1. **Color Palette**: All colors are defined in `tailwind.config.ts`
2. **Component Styling**: UI components mirror school-frontend exactly
3. **Gradients**: Same gradient definitions for backgrounds
4. **Typography**: Consistent font sizes and weights

### Syncing Changes

When updating the design system:

1. Update `tailwind.config.ts` in both projects
2. Sync component styles in `src/components/ui/`
3. Update global styles in `src/index.css`
4. Test responsiveness across all breakpoints

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm preview         # Preview production build
pnpm lint           # Run ESLint
pnpm type-check     # TypeScript type checking

# From workspace root
pnpm --filter platform-frontend [command]
```

## 🏗️ Architecture Decisions

- **Vite over Create React App**: Faster builds and HMR
- **React Router**: Client-side routing for SPA experience
- **shadcn/ui**: Consistent, accessible component library
- **Tailwind**: Utility-first CSS for rapid development
- **TypeScript**: Type safety and better developer experience
- **Component Composition**: Reusable page sections and UI components

## 🔧 Configuration Files

- `vite.config.ts`: Vite configuration with path aliases
- `tailwind.config.ts`: Tailwind CSS configuration with custom theme
- `tsconfig.json`: TypeScript configuration with strict mode
- `package.json`: Dependencies and workspace configuration

## 🎉 Features

- ✅ Responsive design (mobile-first)
- ✅ Fast loading with Vite
- ✅ Type-safe with TypeScript
- ✅ SEO optimized
- ✅ **Complete user authentication flow**
- ✅ **School registration and management**
- ✅ **Razorpay payment integration**
- ✅ **Form data persistence**
- ✅ **Smart routing based on user state**
- ✅ **Dashboard with school status**
- ✅ Accessible UI components
- ✅ Smooth animations and transitions
- ✅ Form validation and handling
- ✅ Static deployment ready

## 🤝 Contributing

When contributing to this project:

1. Maintain design parity with school-frontend
2. Follow the established component patterns
3. Use TypeScript for all new code
4. Test responsive behavior on all devices
5. Update documentation as needed

## 📞 Support

For questions about the platform frontend:
- Email: hello@vidyalayaone.com
- Review the main school frontend for design references
- Check the payment service documentation for API details

---

Built with ❤️ for modern schools using the VidyalayaOne platform.
