import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, Mail, Shield, CreditCard, Building2, Lock, Camera, Calendar, Mic, Save, Bell, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileEditSection from "@/components/profile/ProfileEditSection";
import ProfileBankAccounts from "@/components/profile/ProfileBankAccounts";
import ProfileWithdrawalPin from "@/components/profile/ProfileWithdrawalPin";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import ProfileNotifications from "@/components/profile/ProfileNotifications";
import ProfileCurrency from "@/components/profile/ProfileCurrency";

type AccountType = "attendee" | "host";

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>("attendee");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Withdrawal PIN
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, withdrawal_pin")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
        setHasPin(!!data.withdrawal_pin);
      }
      setAccountType(user.user_metadata?.account_type || "attendee");
      setLoadingProfile(false);
    };

    const fetchBankAccounts = async () => {
      const { data } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data) setBankAccounts(data);
    };

    fetchProfile();
    fetchBankAccounts();
  }, [user]);

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/signin");
    return null;
  }

  const isHost = accountType === "host";

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = avatarUrl;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      newAvatarUrl = urlData.publicUrl;
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, avatar_url: newAvatarUrl })
      .eq("user_id", user.id);

    if (profileErr) {
      toast({ title: "Update failed", description: profileErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    await supabase.auth.updateUser({
      data: { display_name: displayName.trim(), account_type: accountType },
    });

    toast({ title: "Profile updated", description: "Your changes have been saved." });
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl px-4 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Profile & Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account, security and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card - Avatar & Basic Info */}
          <Card className="rounded-2xl border-border overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={avatarPreview || avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-bold text-foreground">{displayName || "Your Name"}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {accountType === "host" ? "Event Host" : "Attendee"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileEditSection
                user={user}
                displayName={displayName}
                setDisplayName={setDisplayName}
                avatarUrl={avatarUrl}
                avatarPreview={avatarPreview}
                initials={initials}
                accountType={accountType}
                setAccountType={setAccountType}
                handleAvatarChange={handleAvatarChange}
                handleSave={handleSave}
                saving={saving}
              />
            </CardContent>
          </Card>

          {/* Bank Accounts - Host only */}
          {isHost && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProfileBankAccounts
                user={user}
                bankAccounts={bankAccounts}
                setBankAccounts={setBankAccounts}
              />
            </motion.div>
          )}

          {/* Withdrawal PIN - Host only */}
          {isHost && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <ProfileWithdrawalPin
                user={user}
                hasPin={hasPin}
                setHasPin={setHasPin}
              />
            </motion.div>
          )}

          {/* Display currency */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <ProfileCurrency />
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ProfileNotifications />
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ProfileSecurity user={user} />
          </motion.div>

          {/* Sign Out */}
          <Card className="rounded-2xl border-destructive/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground">Log out of your account on this device</p>
              </div>
              <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
