import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Mail, Lock, User, Loader2, Check, Eye, EyeOff, Mic, Calendar } from "lucide-react";
import mainLogo from "@/assets/mainlogo.png";
import AuthCarousel from "@/components/AuthCarousel";

type AccountType = "attendee" | "host";

const SignUp = () => {
  const [accountType, setAccountType] = useState<AccountType>("attendee");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim() || !displayName.trim()) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName.trim(), account_type: accountType },
      },
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
            We sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Click the link to activate your account.
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

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Create an Account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join iBLOOV and start exploring events</p>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("attendee")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === "attendee"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary hover:border-muted-foreground/30"
              }`}
            >
              <Calendar className={`h-5 w-5 ${accountType === "attendee" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${accountType === "attendee" ? "text-primary" : "text-foreground"}`}>Attendee</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">Discover & attend events</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("host")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === "host"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary hover:border-muted-foreground/30"
              }`}
            >
              <Mic className={`h-5 w-5 ${accountType === "host" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${accountType === "host" ? "text-primary" : "text-foreground"}`}>Event Host</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">Create & manage events</span>
            </button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium text-center">{error}</div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Enter your full name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" required maxLength={100} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl pl-10 h-12 bg-secondary border-border" required maxLength={255} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl pl-10 pr-10 h-12 bg-secondary border-border" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl h-12 font-bold text-base" disabled={loading || !email.trim() || !password.trim() || !displayName.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button type="button" variant="outline" className="w-full rounded-xl h-12 font-semibold" disabled={googleLoading} onClick={async () => {
            setGoogleLoading(true);
            setError("");
            const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (error) { setError(error.message); setGoogleLoading(false); }
          }}>
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-primary hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
