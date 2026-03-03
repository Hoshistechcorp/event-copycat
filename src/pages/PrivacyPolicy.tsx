import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 md:px-8 py-16 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 2026</p>

        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and payment details when you create an account, purchase tickets, or contact us. We also collect usage data automatically, including device information, IP address, and browsing behaviour on our platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve our services, process transactions, send communications about your account and events, personalise your experience, and ensure the security of our platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your data with event organisers (for events you attend), payment processors, and service providers who help us operate the platform. We may also disclose information when required by law.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>We use cookies and similar technologies to enhance your experience, analyse usage patterns, and deliver personalised content. You can manage cookie preferences through your browser settings.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, please contact us at hello@ibloov.com.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of any material changes by posting the updated policy on our platform with a revised effective date.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at hello@ibloov.com.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
