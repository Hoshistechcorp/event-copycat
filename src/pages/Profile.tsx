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
import { Loader2, Camera, User, Mail, Calendar, Mic, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AccountType = "attendee" | "host";

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

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
      }
      setAccountType(user.user_metadata?.account_type || "attendee");
      setLoadingProfile(false);
    };
    fetchProfile();
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

    // Update user metadata for account_type
    await supabase.auth.updateUser({
      data: { display_name: displayName.trim(), account_type: accountType },
    });

    toast({ title: "Profile updated", description: "Your changes have been saved." });
    setSaving(false);
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
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
