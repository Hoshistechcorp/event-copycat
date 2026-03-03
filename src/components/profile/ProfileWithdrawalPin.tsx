import { useState } from "react";
import { User as UserType } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  user: UserType;
  hasPin: boolean;
  setHasPin: (v: boolean) => void;
}

const ProfileWithdrawalPin = ({ user, hasPin, setHasPin }: Props) => {
  const { toast } = useToast();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

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
    const { error } = await supabase.from("profiles").update({ withdrawal_pin: pin }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      setHasPin(true);
      setShowPinSetup(false);
      setPin("");
      setConfirmPin("");
      toast({ title: hasPin ? "PIN updated" : "Withdrawal PIN set" });
    }
    setSavingPin(false);
  };

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">Withdrawal PIN</CardTitle>
          </div>
          {hasPin && <Badge variant="secondary" className="text-[10px]">PIN Set ✓</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">A 4-digit PIN required for all withdrawals</p>
      </CardHeader>
      <CardContent>
        {!showPinSetup ? (
          <Button size="sm" variant={hasPin ? "outline" : "default"} className="rounded-xl text-xs font-bold" onClick={() => setShowPinSetup(true)}>
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
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPin(!showPin)}>
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
              <Button size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => { setShowPinSetup(false); setPin(""); setConfirmPin(""); }}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileWithdrawalPin;
