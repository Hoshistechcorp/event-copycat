import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Loader2, Check } from "lucide-react";
import mainLogo from "@/assets/mainlogo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery session
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // No recovery token, redirect
      navigate("/signin");
    }
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground mb-2">Password updated!</h1>
          <p className="text-sm text-muted-foreground">Redirecting you to the app...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={mainLogo} alt="iBLOOV" className="h-6 mx-auto" />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Set new password</h1>
          <p className="text-sm text-muted-foreground">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium text-center">{error}</div>
          )}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl pl-10" required minLength={6} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl pl-10" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl h-11 font-bold" disabled={loading || !password.trim() || !confirmPassword.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
