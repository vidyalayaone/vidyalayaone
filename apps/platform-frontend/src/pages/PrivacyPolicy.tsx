import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 lg:p-12">
            <div className="prose prose-slate max-w-none">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground text-lg">
                  <strong>Last Updated:</strong> 04/10/2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>VidyalayaOne Technologies</strong> ("we," "our," or "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and platform at{" "}
                  <a href="https://vidyalayaone.com" className="text-primary hover:underline">
                    https://vidyalayaone.com
                  </a>{" "}
                  (the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using the Service, you agree to the terms of this Privacy Policy.
                </p>
              </div>

              {/* Section 1 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect the following information to provide and improve the Service:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>School Administrator Information:</strong> Name, email, school details, contact info, login credentials.</li>
                  <li>• <strong>Teacher and Student Information:</strong> Names, emails, addresses, documents, academic data, contact details, and other information typically stored by a school.</li>
                  <li>• <strong>Account and Authentication Data:</strong> Login tokens (stored locally), password hashes, and access logs.</li>
                  <li>• <strong>Technical Information:</strong> IP addresses and device information necessary to provide the Service.</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> We do <strong>not</strong> use cookies for tracking or analytics.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use collected information to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Provide and maintain the Service.</li>
                  <li>• Allow school administrators to manage teachers and students.</li>
                  <li>• Facilitate communication with users.</li>
                  <li>• Ensure security, including encrypted passwords and HTTPS-protected access.</li>
                  <li>• Comply with legal obligations.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Sharing & Third-Party Services</h2>
                <p className="text-muted-foreground mb-4">
                  We may share your data only as necessary to provide the Service or comply with law:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Cloud Services:</strong> Google Cloud Platform (GCP) for storage and hosting.</li>
                  <li>• <strong>Email Services:</strong> Brevo for transactional emails and notifications.</li>
                  <li>• <strong>Legal Requirements:</strong> To comply with laws, regulations, or legal processes.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We <strong>do not sell or rent</strong> your personal information to third parties.
                </p>
              </section>

              {/* Section 4 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain personal information <strong>indefinitely</strong> unless you request deletion. Users have the right to request deletion or export of their data by contacting{" "}
                  <a href="mailto:team@vidyalayaone.com" className="text-primary hover:underline">
                    team@vidyalayaone.com
                  </a>.
                </p>
              </section>

              {/* Section 5 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Security Measures</h2>
                <p className="text-muted-foreground mb-4">We take reasonable steps to protect user data:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• All data is transmitted over <strong>HTTPS</strong>.</li>
                  <li>• Passwords are stored using <strong>encryption and secure hashing</strong>.</li>
                  <li>• Access to sensitive data is limited to authorized personnel only.</li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> While we take security seriously, no system is 100% secure. Users are responsible for maintaining the confidentiality of their login credentials.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Minor Students</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• The Service is primarily intended for use by school administrators. Students may have accounts managed by parents or guardians.</li>
                  <li>• While students can independently use the Service, we <strong>advise parental guidance</strong> for account creation and use.</li>
                  <li>• Personal data of minors is <strong>protected</strong>, and parents/guardians have the right to request deletion or review of their child's data.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. User Rights</h2>
                <p className="text-muted-foreground mb-4">Users have the right to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Access their personal data.</li>
                  <li>• Request correction of inaccurate information.</li>
                  <li>• Request deletion of their data at any time by contacting{" "}
                    <a href="mailto:team@vidyalayaone.com" className="text-primary hover:underline">
                      team@vidyalayaone.com
                    </a>.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the new Privacy Policy.
                </p>
              </section>

              {/* Section 9 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions or concerns about this Privacy Policy:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">VidyalayaOne Technologies</p>
                  <p className="text-muted-foreground mb-1">
                    C-318, Hall 1, IIT Kanpur, Kalyanpur, Kanpur, Uttar Pradesh, India – 208016
                  </p>
                  <p className="text-muted-foreground mb-1">
                    Email:{" "}
                    <a href="mailto:team@vidyalayaone.com" className="text-primary hover:underline">
                      team@vidyalayaone.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    Website:{" "}
                    <a href="https://vidyalayaone.com" className="text-primary hover:underline">
                      https://vidyalayaone.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;