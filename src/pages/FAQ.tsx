import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    q: "What is iBloov?",
    a: "iBloov is a modern event platform that helps you discover, create, and manage events. Whether you're an attendee looking for exciting experiences or an organiser wanting to sell tickets, iBloov makes it simple.",
    category: "General",
  },
  {
    q: "How do I buy tickets?",
    a: "Browse events on our platform, select the event you're interested in, choose your ticket tier, and complete the checkout. Your tickets will be available in the 'My Tickets' section of your account.",
    category: "Tickets",
  },
  {
    q: "How do I create an event?",
    a: "Sign in to your account, click 'Create Events' in the navigation bar, and fill out the event details including title, date, venue, ticket tiers, and description. Once submitted, your event will be live on the platform.",
    category: "Events",
  },
  {
    q: "Can I get a refund?",
    a: "Refund policies are set by individual event organisers. Please contact the event organiser directly or reach out to our support team for assistance with refund requests.",
    category: "Tickets",
  },
  {
    q: "How do I contact an event organiser?",
    a: "You can find the organiser's details on the event page. If you need further help, contact our support team and we'll connect you.",
    category: "General",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. We use industry-standard encryption and secure payment processors to protect your financial information. We never store your full card details on our servers.",
    category: "Payments",
  },
  {
    q: "How do I update my profile?",
    a: "Go to your Profile page from the dropdown menu in the navigation bar. There you can update your display name, email, and other account settings.",
    category: "Account",
  },
  {
    q: "What currencies are supported?",
    a: "iBloov supports multiple currencies. You can change your preferred currency using the currency selector in the navigation bar.",
    category: "Payments",
  },
];

const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

const FAQ = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = faqs.filter((faq) => {
    const matchesSearch =
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container px-4 md:px-8 py-20 md:py-32 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Centre
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
              Frequently Asked{" "}
              <span className="text-gradient-accent">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
              Everything you need to know about iBloov. Can't find your answer? Contact us.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full bg-card border-border"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="container px-4 md:px-8 py-16 max-w-3xl">
        {/* Category Pills */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No questions match your search. Try a different term.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <AccordionItem value={`item-${i}`} className="border-border">
                    <AccordionTrigger className="text-left text-foreground hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        {faq.q}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-9">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
