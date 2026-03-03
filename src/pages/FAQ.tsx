import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is iBloov?",
    a: "iBloov is a modern event platform that helps you discover, create, and manage events. Whether you're an attendee looking for exciting experiences or an organiser wanting to sell tickets, iBloov makes it simple."
  },
  {
    q: "How do I buy tickets?",
    a: "Browse events on our platform, select the event you're interested in, choose your ticket tier, and complete the checkout. Your tickets will be available in the 'My Tickets' section of your account."
  },
  {
    q: "How do I create an event?",
    a: "Sign in to your account, click 'Create Events' in the navigation bar, and fill out the event details including title, date, venue, ticket tiers, and description. Once submitted, your event will be live on the platform."
  },
  {
    q: "Can I get a refund?",
    a: "Refund policies are set by individual event organisers. Please contact the event organiser directly or reach out to our support team for assistance with refund requests."
  },
  {
    q: "How do I contact an event organiser?",
    a: "You can find the organiser's details on the event page. If you need further help, contact our support team and we'll connect you."
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. We use industry-standard encryption and secure payment processors to protect your financial information. We never store your full card details on our servers."
  },
  {
    q: "How do I update my profile?",
    a: "Go to your Profile page from the dropdown menu in the navigation bar. There you can update your display name, email, and other account settings."
  },
  {
    q: "What currencies are supported?",
    a: "iBloov supports multiple currencies. You can change your preferred currency using the currency selector in the navigation bar."
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 md:px-8 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-10">Find answers to common questions about iBloov.</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
