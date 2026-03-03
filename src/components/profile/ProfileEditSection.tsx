import { User as UserType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Mic, Save, Loader2 } from "lucide-react";

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
  user, displayName, setDisplayName,
  accountType, setAccountType, handleSave, saving,
}: Props) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold mb-1.5">Display Name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="rounded-xl h-11 bg-secondary border-border"
            maxLength={100}
          />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1.5">Email Address</Label>
          <Input
            value={user.email || ""}
            disabled
            className="rounded-xl h-11 bg-secondary border-border opacity-60"
          />
        </div>
      </div>

      {/* Account type selector */}
      <div>
        <Label className="text-xs font-semibold mb-2">Account Type</Label>
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

      <Button className="w-full sm:w-auto rounded-xl h-11 font-bold px-8" disabled={saving} onClick={handleSave}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Changes
      </Button>
    </div>
  );
};

export default ProfileEditSection;
