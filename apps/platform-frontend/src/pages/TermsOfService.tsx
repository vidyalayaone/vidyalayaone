import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 lg:p-12">
            <div className="prose prose-slate max-w-none">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
                <p className="text-muted-foreground text-lg">
                  <strong>Last Updated:</strong> 04/10/2025
                </p>
                <p className="text-lg font-medium text-primary mt-4">
                  Welcome to VidyalayaOne!
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service ("Terms") govern your use of the website and platform operated by{" "}
                  <strong>VidyalayaOne Technologies</strong> ("we," "our," or "us"), accessible at{" "}
                  <a href="https://vidyalayaone.com" className="text-primary hover:underline">
                    https://vidyalayaone.com
                  </a>{" "}
                  (the "Service"). By accessing or using the Service, you agree to these Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  If you do not agree to these Terms, please do not use the Service.
                </p>
              </div>

              {/* Section 1 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Eligibility</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• The Service is intended for <strong>school administrators, teachers, and students</strong>.</li>
                  <li>• Only <strong>school administrators</strong> can register directly. Teachers and students are added by the school administrators.</li>
                  <li>• By registering, you confirm you are at least 18 years old and authorized to act on behalf of your school.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Account Registration & Responsibilities</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You must provide accurate and complete information when creating an account.</li>
                  <li>• You are responsible for maintaining the <strong>security of your account</strong> and any activity that occurs under it.</li>
                  <li>• Notify us immediately at{" "}
                    <a href="mailto:team@vidyalayaone.com" className="text-primary hover:underline">
                      team@vidyalayaone.com
                    </a>{" "}
                    if you suspect any unauthorized use of your account.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Content & Data Ownership</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Schools and their users retain <strong>full ownership of the data</strong> entered into the Service.</li>
                  <li>• By using the Service, you grant VidyalayaOne Technologies a <strong>limited license</strong> to host, store, and display the data as necessary to provide the Service.</li>
                  <li>• We will not share your data with third parties except as needed to provide the Service (e.g., payment processing via Razorpay) or as required by law.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground mb-4">You agree not to use the Service to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Upload or distribute <strong>illegal content</strong> or content that infringes the rights of others.</li>
                  <li>• Attempt to <strong>hack, disrupt, or compromise</strong> the Service or other users' data.</li>
                  <li>• Send <strong>spam, malware, or malicious content</strong> through the Service.</li>
                  <li>• Use the Service for <strong>unauthorized commercial purposes</strong> outside your school's management operations.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Service Access & Modifications</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We reserve the right to <strong>modify, suspend, or discontinue</strong> the Service at any time, with or without notice.</li>
                  <li>• While we strive to keep the Service available, we <strong>do not guarantee uninterrupted or error-free access</strong>.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Fees & Payments</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Currently, the Service is <strong>free</strong> for all users.</li>
                  <li>• Any future paid plans will have their <strong>own terms</strong>, and you will be informed before purchase.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We may <strong>terminate or suspend your account</strong> for violations of these Terms or inactivity.</li>
                  <li>• Upon termination, your access to the Service will end, but <strong>data retention policies</strong> will apply as described in the Privacy Policy.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disclaimers & Limitation of Liability</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• The Service is provided <strong>"as is" and "as available"</strong>.</li>
                  <li>• VidyalayaOne Technologies does not guarantee that the Service will be free from errors, bugs, or downtime.</li>
                  <li>• We are <strong>not liable for indirect, incidental, or consequential damages</strong> arising from your use of the Service.</li>
                  <li>• Schools are responsible for <strong>accuracy and legality of the data</strong> entered into the Service.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Governing Law</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• These Terms are governed by the laws of <strong>Uttar Pradesh, India</strong>, without regard to conflict of law principles.</li>
                  <li>• Any disputes arising out of or relating to these Terms or the Service shall be resolved exclusively in the courts located in <strong>Kanpur, Uttar Pradesh, India</strong>.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to These Terms</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We may update these Terms from time to time.</li>
                  <li>• Updated Terms will be posted on this page with a revised "Last Updated" date.</li>
                  <li>• Continued use of the Service after changes constitutes acceptance of the new Terms.</li>
                </ul>
              </section>

              {/* Section 11 */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions or concerns about these Terms, contact us at:
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

export default TermsOfService;