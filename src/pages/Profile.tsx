import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, User, Mail, Calendar, Mic, Save, Building2, Plus, Trash2, Lock, Eye, EyeOff, Star, ArrowLeft, Shield, Bell, CreditCard, HelpCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileEditSection from "@/components/profile/ProfileEditSection";
import ProfileBankAccounts from "@/components/profile/ProfileBankAccounts";
import ProfileWithdrawalPin from "@/components/profile/ProfileWithdrawalPin";
import ProfileSecurity from "@/components/profile/ProfileSecurity";

type AccountType = "attendee" | "host";
type ProfileTab = "edit" | "withdrawal" | "security";

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
  const [activeTab, setActiveTab] = useState<ProfileTab>("edit");

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

  const sidebarTabs = [
    { id: "edit" as ProfileTab, label: "Edit Profile", icon: User },
    ...(isHost ? [{ id: "withdrawal" as ProfileTab, label: "Withdrawal Settings", icon: CreditCard }] : []),
    { id: "security" as ProfileTab, label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl px-4 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Profile & Settings</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <nav className="space-y-1.5">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "edit" && (
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
              )}
              {activeTab === "withdrawal" && isHost && (
                <div className="space-y-6">
                  <ProfileBankAccounts
                    user={user}
                    bankAccounts={bankAccounts}
                    setBankAccounts={setBankAccounts}
                  />
                  <ProfileWithdrawalPin
                    user={user}
                    hasPin={hasPin}
                    setHasPin={setHasPin}
                  />
                </div>
              )}
              {activeTab === "security" && (
                <ProfileSecurity user={user} />
              )}
            </motion.div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
