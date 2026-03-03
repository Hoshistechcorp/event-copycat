import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, Clock, CreditCard, Building2, Lock, Loader2, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  bank_accounts: { bank_name: string; account_number: string } | null;
}

const COMMISSION_RATE = 0.05; // 5%

const DashboardWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Withdrawal form state — always visible
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"amount" | "confirm">("amount");

  // Mock earnings
  const totalEarned = 0;
  const commission = totalEarned * COMMISSION_RATE;
  const availableBalance = totalEarned - commission;
  const pendingAmount = 0;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [bankRes, withdrawRes, profileRes] = await Promise.all([
        supabase.from("bank_accounts").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("withdrawals").select("*, bank_accounts(bank_name, account_number)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("withdrawal_pin").eq("user_id", user.id).single(),
      ]);
      if (bankRes.data) {
        setBankAccounts(bankRes.data);
        const defaultAcc = bankRes.data.find((b) => b.is_default);
        if (defaultAcc) setSelectedBank(defaultAcc.id);
      }
      if (withdrawRes.data) setWithdrawals(withdrawRes.data as unknown as Withdrawal[]);
      if (profileRes.data) setHasPin(!!profileRes.data.withdrawal_pin);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleStartWithdraw = () => {
    setStep("amount");
    setShowWithdraw(true);
    setWithdrawAmount("");
    setPinInput("");
  };

  const handleConfirmWithdraw = async () => {
    if (bankAccounts.length === 0) {
      toast({ title: "No bank account", description: "Add a bank account in your Profile → Withdrawal Settings.", variant: "destructive" });
      return;
    }
    if (!hasPin) {
      toast({ title: "No withdrawal PIN", description: "Set up a withdrawal PIN in your Profile → Withdrawal Settings.", variant: "destructive" });
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (!selectedBank) {
      toast({ title: "Select a bank account", variant: "destructive" });
      return;
    }
    if (pinInput.length !== 4) {
      toast({ title: "Enter your 4-digit PIN", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const { data: profile } = await supabase.from("profiles").select("withdrawal_pin").eq("user_id", user!.id).single();
    if (!profile || profile.withdrawal_pin !== pinInput) {
      toast({ title: "Incorrect PIN", description: "The withdrawal PIN you entered is wrong.", variant: "destructive" });
      setProcessing(false);
      return;
    }

    const { data, error } = await supabase.from("withdrawals").insert({
      user_id: user!.id,
      bank_account_id: selectedBank,
      amount,
      status: "pending",
    }).select("*, bank_accounts(bank_name, account_number)").single();

    if (error) {
      toast({ title: "Withdrawal failed", description: error.message, variant: "destructive" });
    } else if (data) {
      setWithdrawals([data as unknown as Withdrawal, ...withdrawals]);
      toast({ title: "Withdrawal submitted", description: `₦${amount.toLocaleString()} will be sent to your bank account.` });
      setShowWithdraw(false);
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedBankAccount = bankAccounts.find((b) => b.id === selectedBank);

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border-border bg-primary text-primary-foreground">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Available Balance</span>
              </div>
              <p className="text-3xl font-extrabold">₦{availableBalance.toLocaleString()}</p>
              <p className="text-[10px] opacity-70 mt-1">After 5% platform commission</p>
              <Button size="sm" variant="secondary" className="mt-4 rounded-xl text-xs font-bold" onClick={handleStartWithdraw}>
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Pending</span>
              </div>
              <p className="text-3xl font-extrabold text-foreground">₦{pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Processing in 2-3 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Total Earned</span>
              </div>
              <p className="text-3xl font-extrabold text-foreground">₦{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">All time earnings</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Commission breakdown */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Earnings Breakdown
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-bold text-foreground">₦{totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Platform Commission (5%)</span>
              <span className="font-bold text-destructive">-₦{commission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground font-semibold">Available to Withdraw</span>
              <span className="font-extrabold text-foreground">₦{availableBalance.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal flow — always accessible */}
      {showWithdraw && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border-primary/30 ring-2 ring-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">
                {step === "amount" ? "Withdraw Funds" : "Confirm Withdrawal"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === "amount" ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Amount (₦)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="rounded-xl h-12 text-lg font-bold bg-secondary border-border"
                      min={100}
                    />
                  </div>

                  {bankAccounts.length > 0 ? (
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">Withdraw to</label>
                      <div className="space-y-2">
                        {bankAccounts.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => setSelectedBank(acc.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              selectedBank === acc.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{acc.bank_name}</p>
                              <p className="text-xs text-muted-foreground">{acc.account_name} • ****{acc.account_number.slice(-4)}</p>
                            </div>
                            {acc.is_default && <Badge className="text-[9px] ml-auto">Default</Badge>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center">
                      <Building2 className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-2">No bank accounts added yet</p>
                      <Button size="sm" variant="outline" className="text-xs rounded-lg" onClick={() => navigate("/profile")}>
                        Add Bank Account
                      </Button>
                    </div>
                  )}

                  {!hasPin && (
                    <div className="p-3 rounded-xl border border-dashed border-border flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">You need a withdrawal PIN to proceed</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs rounded-lg h-7" onClick={() => navigate("/profile")}>
                        Set PIN
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="rounded-xl font-bold text-xs" onClick={() => {
                      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                        toast({ title: "Enter an amount", variant: "destructive" });
                        return;
                      }
                      if (bankAccounts.length === 0) {
                        toast({ title: "Add a bank account first", variant: "destructive" });
                        return;
                      }
                      if (!hasPin) {
                        toast({ title: "Set up a withdrawal PIN first", variant: "destructive" });
                        return;
                      }
                      setStep("confirm");
                    }}>
                      Continue
                    </Button>
                    <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-foreground">₦{parseFloat(withdrawAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-semibold text-foreground">{selectedBankAccount?.bank_name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Account</span>
                      <span className="text-foreground">****{selectedBankAccount?.account_number.slice(-4)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Enter Withdrawal PIN</label>
                    <div className="relative max-w-[200px]">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="rounded-xl h-10 pl-10 pr-10 bg-secondary border-border tracking-[0.5em] text-center font-bold"
                        maxLength={4}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPin(!showPin)}>
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="rounded-xl font-bold text-xs" disabled={processing} onClick={handleConfirmWithdraw}>
                      {processing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Confirm Withdrawal
                    </Button>
                    <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setStep("amount")}>Back</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-destructive/10">
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Withdrawal to {w.bank_accounts?.bank_name || "Bank"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(w.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-destructive">-₦{w.amount.toLocaleString()}</span>
                      <Badge variant={w.status === "completed" ? "default" : "secondary"} className="text-[10px] rounded-full">{w.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardWallet;
