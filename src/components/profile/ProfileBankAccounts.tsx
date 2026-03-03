import { useState } from "react";
import { User as UserType } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { BankAccount } from "@/pages/Profile";

interface Props {
  user: UserType;
  bankAccounts: BankAccount[];
  setBankAccounts: (accounts: BankAccount[]) => void;
}

const ProfileBankAccounts = ({ user, bankAccounts, setBankAccounts }: Props) => {
  const { toast } = useToast();
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingBank, setSavingBank] = useState(false);

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
    await supabase.from("bank_accounts").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("bank_accounts").update({ is_default: true }).eq("id", id);
    setBankAccounts(bankAccounts.map((b) => ({ ...b, is_default: b.id === id })));
    toast({ title: "Default account updated" });
  };

  return (
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
            <Input placeholder="Bank Name (e.g. GTBank)" value={bankName} onChange={(e) => setBankName(e.target.value)} className="rounded-xl h-10 bg-background border-border" maxLength={50} />
            <Input placeholder="Account Holder Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="rounded-xl h-10 bg-background border-border" maxLength={100} />
            <Input placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} className="rounded-xl h-10 bg-background border-border" maxLength={10} />
            <div className="flex gap-2">
              <Button size="sm" className="rounded-lg text-xs font-bold" disabled={savingBank} onClick={handleAddBankAccount}>
                {savingBank ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Save Account
              </Button>
              <Button size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => setShowAddBank(false)}>Cancel</Button>
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
  );
};

export default ProfileBankAccounts;
