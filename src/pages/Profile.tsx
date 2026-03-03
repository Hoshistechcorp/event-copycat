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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, User, Mail, Calendar, Mic, Save, Building2, Plus, Trash2, Lock, Eye, EyeOff, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AccountType = "attendee" | "host";

interface BankAccount {
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
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  // Withdrawal PIN
  const [hasPin, setHasPin] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

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

  const handleAddBankAccount = async () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      toast({ title: "Missing fields", description: "Fill in all bank account fields.", variant: "destructive" });
      return;
    }
    if (accountNumber.trim().length < 10) {
      toast({ title: "Invalid account", description: "Account number must be at least 10 digits.", variant: "destructive" });
      return;
    }
    setSavingBank(true);
    const isFirst = bankAccounts.length === 0;
    const { data, error } = await supabase.from("bank_accounts").insert({
      user_id: user.id,
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      account_number: accountNumber.trim(),
      is_default: isFirst,
    }).select().single();

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else if (data) {
      setBankAccounts([...bankAccounts, data]);
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setShowAddBank(false);
      toast({ title: "Bank account added" });
    }
    setSavingBank(false);
  };

  const handleDeleteBank = async (id: string) => {
    const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
    if (!error) {
      setBankAccounts(bankAccounts.filter((b) => b.id !== id));
      toast({ title: "Bank account removed" });
    }
  };

  const handleSetDefault = async (id: string) => {
    // Unset all defaults first
    await supabase.from("bank_accounts").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("bank_accounts").update({ is_default: true }).eq("id", id);
    setBankAccounts(bankAccounts.map((b) => ({ ...b, is_default: b.id === id })));
    toast({ title: "Default account updated" });
  };

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "PIN must be exactly 4 digits.", variant: "destructive" });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: "PIN mismatch", description: "PINs do not match.", variant: "destructive" });
      return;
    }
    setSavingPin(true);
    // Store PIN as-is (in production, hash server-side)
    const { error } = await supabase.from("profiles").update({ withdrawal_pin: pin }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setHasPin(true);
      setShowPinSetup(false);
      setPin("");
      setConfirmPin("");
      toast({ title: hasPin ? "PIN updated" : "Withdrawal PIN set", description: "You can now make withdrawals." });
    }
    setSavingPin(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl px-4 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Profile Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your account details and preferences.</p>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || avatarUrl || undefined} />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-bold text-foreground">{displayName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" className="rounded-xl pl-10 h-12 bg-secondary border-border" maxLength={100} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={user.email || ""} disabled className="rounded-xl pl-10 h-12 bg-secondary border-border opacity-60" />
              </div>
            </div>

            {/* Account type selector */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

          <Button className="w-full rounded-xl h-12 font-bold mt-8" disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>

          {/* Bank Accounts Section — visible for hosts */}
          {isHost && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
              <Card className="rounded-2xl border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-bold text-foreground">Bank Accounts</CardTitle>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => setShowAddBank(!showAddBank)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Account
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add your bank details for withdrawals</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showAddBank && (
                    <div className="p-4 rounded-xl border border-border bg-secondary/50 space-y-3">
                      <Input
                        placeholder="Bank Name (e.g. GTBank)"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="rounded-xl h-10 bg-background border-border"
                        maxLength={50}
                      />
                      <Input
                        placeholder="Account Holder Name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="rounded-xl h-10 bg-background border-border"
                        maxLength={100}
                      />
                      <Input
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                        className="rounded-xl h-10 bg-background border-border"
                        maxLength={10}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-lg text-xs font-bold" disabled={savingBank} onClick={handleAddBankAccount}>
                          {savingBank ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Save Account
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => setShowAddBank(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {bankAccounts.length === 0 && !showAddBank ? (
                    <div className="text-center py-6">
                      <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">No bank accounts yet</p>
                      <p className="text-xs text-muted-foreground">Add an account to enable withdrawals.</p>
                    </div>
                  ) : (
                    bankAccounts.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{acc.bank_name}</p>
                              {acc.is_default && <Badge className="text-[9px] px-1.5 py-0 h-4">Default</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{acc.account_name} • ****{acc.account_number.slice(-4)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!acc.is_default && (
                            <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => handleSetDefault(acc.id)}>
                              <Star className="h-3 w-3 mr-1" /> Set Default
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleDeleteBank(acc.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Withdrawal PIN Section — visible for hosts */}
          {isHost && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Card className="rounded-2xl border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-bold text-foreground">Withdrawal PIN</CardTitle>
                    </div>
                    {hasPin && (
                      <Badge variant="secondary" className="text-[10px]">PIN Set ✓</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">A 4-digit PIN required for all withdrawals</p>
                </CardHeader>
                <CardContent>
                  {!showPinSetup ? (
                    <Button
                      size="sm"
                      variant={hasPin ? "outline" : "default"}
                      className="rounded-xl text-xs font-bold"
                      onClick={() => setShowPinSetup(true)}
                    >
                      <Lock className="h-3 w-3 mr-1.5" />
                      {hasPin ? "Change PIN" : "Set Up PIN"}
                    </Button>
                  ) : (
                    <div className="space-y-3 max-w-xs">
                      <div className="relative">
                        <Input
                          type={showPin ? "text" : "password"}
                          placeholder="Enter 4-digit PIN"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="rounded-xl h-10 bg-secondary border-border pr-10"
                          maxLength={4}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPin(!showPin)}
                        >
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="rounded-xl h-10 bg-secondary border-border"
                        maxLength={4}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-lg text-xs font-bold" disabled={savingPin} onClick={handleSetPin}>
                          {savingPin ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          {hasPin ? "Update PIN" : "Set PIN"}
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => { setShowPinSetup(false); setPin(""); setConfirmPin(""); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
