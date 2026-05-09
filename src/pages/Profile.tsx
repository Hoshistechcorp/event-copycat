import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, Camera, Bell, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileEditSection from "@/components/profile/ProfileEditSection";
import ProfileBankAccounts from "@/components/profile/ProfileBankAccounts";
import ProfileWithdrawalPin from "@/components/profile/ProfileWithdrawalPin";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import ProfileNotifications from "@/components/profile/ProfileNotifications";
import ProfileCurrency from "@/components/profile/ProfileCurrency";

type AccountType = "attendee" | "host";
type Tab = "account" | "notifications" | "privacy";

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "account", label: "Account", icon: <User className="h-4 w-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { key: "privacy", label: "Privacy", icon: <Shield className="h-4 w-4" /> },
];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const tabParam = params.get("tab");
  // Map "settings" alias → privacy tab so /profile?tab=settings works.
  const initialTab: Tab =
    tabParam === "notifications"
      ? "notifications"
      : tabParam === "privacy" || tabParam === "settings" || tabParam === "security"
      ? "privacy"
      : "account";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const t = params.get("tab");
    if (!t) return;
    if (t === "notifications") setActiveTab("notifications");
    else if (t === "privacy" || t === "settings" || t === "security") setActiveTab("privacy");
    else if (t === "account") setActiveTab("account");
  }, [params]);

  const switchTab = (t: Tab) => {
    setActiveTab(t);
    const next = new URLSearchParams(params);
    next.set("tab", t);
    setParams(next, { replace: true });
  };

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>("attendee");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    // Immediate upload for snappy mobile UX
    setSaving(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = urlData.publicUrl;
    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
    setAvatarUrl(newUrl);
    setSaving(false);
    toast({ title: "Profile picture updated" });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null })
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
      <div className="container max-w-4xl px-4 py-6 sm:py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="rounded-xl shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground truncate">Profile & Settings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Manage your account, security and preferences</p>
          </div>
        </div>

        {/* Identity card */}
        <Card className="rounded-2xl border-border overflow-hidden mb-5">
          <div className="h-20 sm:h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
          <CardContent className="relative px-4 sm:px-6 pb-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarPreview || avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md active:scale-95"
                  aria-label="Change profile picture"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{displayName || "Your Name"}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant="outline" className="capitalize shrink-0">
                {isHost ? "Event Host" : "Attendee"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {activeTab === "account" && (
            <>
              <Card className="rounded-2xl border-border">
                <CardHeader className="pb-3">
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

              <ProfileCurrency />

              {isHost && (
                <ProfileBankAccounts
                  user={user}
                  bankAccounts={bankAccounts}
                  setBankAccounts={setBankAccounts}
                />
              )}
            </>
          )}

          {activeTab === "notifications" && <ProfileNotifications />}

          {activeTab === "privacy" && (
            <>
              <ProfileSecurity user={user} />
              {isHost && (
                <ProfileWithdrawalPin user={user} hasPin={hasPin} setHasPin={setHasPin} />
              )}
              <Card className="rounded-2xl border-destructive/20">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Sign Out</p>
                    <p className="text-xs text-muted-foreground">Log out of your account on this device</p>
                  </div>
                  <Button variant="destructive" size="sm" className="rounded-xl w-full sm:w-auto" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
