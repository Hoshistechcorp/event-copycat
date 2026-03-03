import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 md:px-8 py-16 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 2026</p>

        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using iBloov, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Use of the Platform</h2>
            <p>You must be at least 18 years old to use iBloov. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree not to use the platform for any unlawful purpose.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Event Creation</h2>
            <p>Event organisers are responsible for the accuracy of their event information, fulfilling their obligations to ticket holders, and complying with all applicable laws and regulations. iBloov is not responsible for the content or execution of events listed on the platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Ticket Purchases</h2>
            <p>All ticket sales are subject to the organiser's refund policy. iBloov facilitates the transaction but is not the seller of the tickets. By purchasing a ticket, you agree to the event organiser's terms and conditions.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Intellectual Property</h2>
            <p>All content on the iBloov platform, including logos, designs, text, and software, is the property of iBloov or its licensors. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
            <p>iBloov is provided "as is" without warranties of any kind. To the fullest extent permitted by law, iBloov shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our discretion if you violate these terms or engage in conduct that is harmful to other users or the platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact</h2>
            <p>For questions about these Terms, please contact us at hello@ibloov.com.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
