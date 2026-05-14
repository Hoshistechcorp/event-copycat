import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, MessageCircle, Clock, Globe, Calendar, Tag, Handshake } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const topic = searchParams.get("topic");
  const eventTitle = searchParams.get("eventTitle");
  const eventDate = searchParams.get("eventDate");
  const prefilledSubject = searchParams.get("subject") || "";
  const prefilledMessage = searchParams.get("message") || "";
  const isSponsorship = topic === "sponsorship";

  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState(prefilledMessage);

  useEffect(() => {
    setSubject(prefilledSubject);
    setMessage(prefilledMessage);
  }, [prefilledSubject, prefilledMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      (e.target as HTMLFormElement).reset();
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container px-4 md:px-8 py-20 md:py-32 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              We're here to help
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
              Get in <span className="text-gradient-accent">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Have a question, feedback, or need support? Our team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="container px-4 md:px-8 -mt-10 relative z-20 mb-16">
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Mail, label: "Email Us", value: "hello@ibloov.com", color: "bg-primary/10 text-primary" },
            { icon: Clock, label: "Response Time", value: "Within 24 hours", color: "bg-accent/10 text-accent-foreground" },
            { icon: Globe, label: "Based in", value: "Lagos, Nigeria", color: "bg-primary/10 text-primary" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <main className="container px-4 md:px-8 pb-20 max-w-4xl">
        <div className="grid md:grid-cols-5 gap-10">
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isSponsorship && eventTitle && (
              <motion.div
                className="mb-6 p-4 rounded-2xl border border-border bg-card shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Handshake className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Sponsorship Enquiry</p>
                    <p className="text-sm font-semibold text-foreground">{eventTitle}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {eventDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{eventDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="capitalize">{topic}</span>
                  </div>
                </div>
              </motion.div>
            )}
            <h2 className="text-2xl font-bold text-foreground mb-1">Send us a message</h2>
            <p className="text-muted-foreground mb-6 text-sm">Fill in the form and we'll respond as soon as possible.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  rows={5}
                  required
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="rounded-full px-8" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>

          <motion.div
            className="md:col-span-2 space-y-6 pt-8 md:pt-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">hello@ibloov.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Phone</p>
                <p className="text-sm text-muted-foreground">+234 800 000 0000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
