import { User as UserType } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, User, Mail, Calendar, Mic, Save, Loader2 } from "lucide-react";

type AccountType = "attendee" | "host";

interface Props {
  user: UserType;
  displayName: string;
  setDisplayName: (v: string) => void;
  avatarUrl: string | null;
  avatarPreview: string | null;
  initials: string;
  accountType: AccountType;
  setAccountType: (v: AccountType) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  saving: boolean;
}

const ProfileEditSection = ({
  user, displayName, setDisplayName, avatarUrl, avatarPreview, initials,
  accountType, setAccountType, handleAvatarChange, handleSave, saving,
}: Props) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Edit Profile</h2>

      {/* Avatar centered */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || avatarUrl || undefined} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </label>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <p className="font-bold text-foreground mt-3">{displayName || "Your Name"}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-5 max-w-lg mx-auto">
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

        <Button className="w-full rounded-xl h-12 font-bold mt-4" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditSection;
