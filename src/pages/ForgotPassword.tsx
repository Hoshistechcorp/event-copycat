import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, Loader2, Check } from "lucide-react";
import mainLogo from "@/assets/mainlogo.png";
import AuthCarousel from "@/components/AuthCarousel";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
          </p>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/signin">Back to sign in</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-card">
      <AuthCarousel />

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/">
              <img src={mainLogo} alt="iBLOOV" className="h-6" />
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter your email to receive a reset link</p>

          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium text-center">{error}</div>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl pl-10 h-12 bg-secondary border-border"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl h-12 font-bold text-base" disabled={loading || !email.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground" asChild>
              <Link to="/signin"><ArrowLeft className="w-3 h-3 mr-1" /> Back to sign in</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
