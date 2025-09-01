import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Home from '@/pages/Home'
import Platform from '@/pages/Platform'
import WhyUs from '@/pages/WhyUs'
import Pricing from '@/pages/Pricing'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Register from '@/pages/Register'
import VerifyOtp from '@/pages/VerifyOtp'
import Login from '@/pages/Login'
import CreateSchool from '@/pages/CreateSchool'
import Payment from '@/pages/Payment'
import Dashboard from '@/pages/Dashboard'

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// Layout without navbar/footer for auth and app pages
function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public pages with navbar/footer */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="platform" element={<Platform />} />
        <Route path="why-us" element={<WhyUs />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      
      {/* Auth and app pages without navbar/footer */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="register" element={<Register />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route path="login" element={<Login />} />
        <Route path="create-school" element={<CreateSchool />} />
        <Route path="payment" element={<Payment />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
