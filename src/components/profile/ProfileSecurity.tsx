import { useState } from "react";
import { User as UserType } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  user: UserType;
}

const ProfileSecurity = ({ user }: Props) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold">Security</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Update your account password</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5">New Password</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl h-11 bg-secondary border-border pr-10"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5">Confirm Password</Label>
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl h-11 bg-secondary border-border"
            />
          </div>
        </div>
        <Button size="sm" className="rounded-xl text-xs font-bold h-10 px-6" disabled={saving} onClick={handleChangePassword}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
          Update Password
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSecurity;
