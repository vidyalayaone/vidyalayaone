import { Link } from 'react-router-dom';
import { GraduationCap, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/register', label: 'Get Started' },
    { href: '/login', label: 'Login' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/refund', label: 'Refund Policy' },
  ];

  return (
    <footer className="bg-background border-t border-border/30">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">VidyalayaOne</span>
            </Link>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com/company/vidyalayaone"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted/50 hover:bg-primary/10 rounded-lg transition-colors duration-300"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a
                href="https://twitter.com/vidyalayaone"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted/50 hover:bg-primary/10 rounded-lg transition-colors duration-300"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium text-sm tracking-wide uppercase">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium text-sm tracking-wide uppercase">Legal</h3>
            <nav className="space-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-muted-foreground hover:text-primary text-sm transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium text-sm tracking-wide uppercase">Contact</h3>
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                <p className="font-medium text-foreground">VidyalayaOne Technologies</p>
                <p>C-318, Hall 1, IIT Kanpur</p>
                <p>Kalyanpur, Kanpur, Uttar Pradesh</p>
                <p>India – 208016</p>
              </div>
              <div className="text-muted-foreground text-sm">
                <a href="mailto:team@vidyalayaone.com" className="hover:text-primary transition-colors duration-300">
                  team@vidyalayaone.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <p className="text-center text-muted-foreground text-sm">
            © 2025 VidyalayaOne Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;