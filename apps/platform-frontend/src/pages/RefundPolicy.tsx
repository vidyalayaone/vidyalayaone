import { Card, CardContent } from "@/components/ui/card";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">Refund Policy</h1>
                <p className="text-muted-foreground text-lg">
                  <strong>Last Updated:</strong> 04/10/2025
                </p>
              </div>

              {/* Main Message */}
              <div className="max-w-2xl mx-auto">
                <div className="p-8 bg-muted/50 rounded-lg mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">No Paid Services Currently</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    VidyalayaOne is currently <strong>completely free</strong> for all users. 
                    We do not offer any paid services at this time.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    If we introduce paid services in the future, we will include a comprehensive 
                    refund policy on this page with clear terms and conditions.
                  </p>
                </div>

                {/* Contact Info */}
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Questions? Contact us at:
                  </p>
                  <a 
                    href="mailto:team@vidyalayaone.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    team@vidyalayaone.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;