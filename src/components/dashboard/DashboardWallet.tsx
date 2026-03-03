import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Building2, Lock, Loader2, Eye, EyeOff, AlertCircle, Info, Filter, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface TicketPurchase {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_name: string | null;
  buyer_email: string;
  ticket_tiers: { name: string } | null;
  events: { title: string } | null;
}

const COMMISSION_RATE = 0.05;

const DashboardWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [ticketSales, setTicketSales] = useState<TicketPurchase[]>([]);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"amount" | "confirm">("amount");

  // Transaction filters
  const [typeFilter, setTypeFilter] = useState<"all" | "sale" | "withdrawal">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [bankRes, withdrawRes, profileRes, salesRes] = await Promise.all([
        supabase.from("bank_accounts").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("withdrawals").select("*, bank_accounts(bank_name, account_number)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("withdrawal_pin").eq("user_id", user.id).single(),
        supabase.from("ticket_purchases").select("*, ticket_tiers(name), events(title)").order("created_at", { ascending: false }),
      ]);
      if (bankRes.data) {
        setBankAccounts(bankRes.data);
        const defaultAcc = bankRes.data.find((b) => b.is_default);
        if (defaultAcc) setSelectedBank(defaultAcc.id);
      }
      if (withdrawRes.data) setWithdrawals(withdrawRes.data as unknown as Withdrawal[]);
      if (profileRes.data) setHasPin(!!profileRes.data.withdrawal_pin);
      if (salesRes.data) setTicketSales(salesRes.data as unknown as TicketPurchase[]);
      setLoading(false);
    };
    load();
  }, [user]);

  // Compute real earnings from ticket sales
  const totalEarned = ticketSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const commission = totalEarned * COMMISSION_RATE;
  const availableBalance = totalEarned - commission;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + Number(w.amount), 0);

  // Merge withdrawals + sales into unified transaction list
  const transactions = [
    ...withdrawals.map((w) => ({
      id: w.id,
      type: "withdrawal" as const,
      description: `${w.bank_accounts?.bank_name || "Bank"} • ****${w.bank_accounts?.account_number?.slice(-4) || ""}`,
      date: w.created_at,
      amount: Number(w.amount),
      status: w.status,
    })),
    ...ticketSales.map((s) => ({
      id: s.id,
      type: "sale" as const,
      description: `${(s.ticket_tiers as any)?.name || "Ticket"} × ${s.quantity} – ${(s.events as any)?.title || "Event"}`,
      date: s.created_at,
      amount: Number(s.total_amount),
      status: s.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openWithdrawModal = () => {
    setStep("amount");
    setWithdrawAmount("");
    setPinInput("");
    setModalOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (bankAccounts.length === 0) {
      toast({ title: "No bank account", description: "Add a bank account in your Profile first.", variant: "destructive" });
      return;
    }
    if (!hasPin) {
      toast({ title: "No withdrawal PIN", description: "Set up a withdrawal PIN in your Profile first.", variant: "destructive" });
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
      setModalOpen(false);
    }
    setProcessing(false);
  };

  const selectedBankAccount = bankAccounts.find((b) => b.id === selectedBank);

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "failed": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row: title + withdraw button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Wallet</h2>
        <Button className="rounded-xl font-bold text-sm" onClick={openWithdrawModal}>
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Withdraw Funds
        </Button>
      </div>

      {/* Balance cards - equal height */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Wallet,
            label: "Available Balance",
            value: `₦${availableBalance.toLocaleString()}`,
            sub: "After 5% platform commission",
            primary: true,
          },
          {
            icon: Clock,
            label: "Pending",
            value: `₦${pendingWithdrawals.toLocaleString()}`,
            sub: "Processing in 2-3 days",
          },
          {
            icon: CreditCard,
            label: "Total Earned",
            value: `₦${totalEarned.toLocaleString()}`,
            sub: "All time earnings",
          },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`rounded-2xl border-border h-full ${card.primary ? "bg-primary text-primary-foreground" : ""}`}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <card.icon className={`h-4 w-4 ${card.primary ? "opacity-80" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${card.primary ? "opacity-80" : "text-muted-foreground"}`}>{card.label}</span>
                  </div>
                  <p className="text-3xl font-extrabold">{card.value}</p>
                </div>
                <p className={`text-[11px] mt-3 ${card.primary ? "opacity-70" : "text-muted-foreground"}`}>{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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

      {/* Transaction History */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Transaction History</CardTitle>
              <p className="text-xs text-muted-foreground">Your withdrawals and ticket sales</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-[140px] pl-8 text-xs rounded-lg bg-secondary border-border"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                {transactions.length === 0 ? "No transactions yet" : "No matching transactions"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transactions.length === 0
                  ? "Your withdrawal and sales history will appear here"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Details</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center ${t.type === "sale" ? "bg-green-500/10" : "bg-destructive/10"}`}>
                          {t.type === "sale" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </div>
                        <span className="text-xs font-medium capitalize">{t.type === "sale" ? "Ticket Sale" : "Withdrawal"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className={`text-xs font-bold text-right ${t.type === "sale" ? "text-green-600" : "text-destructive"}`}>
                      {t.type === "sale" ? "+" : "-"}₦{t.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`text-[10px] capitalize ${statusColor(t.status)}`}>
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {step === "amount" ? "Withdraw Funds" : "Confirm Withdrawal"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {step === "amount" ? "Enter the amount and select your bank account" : "Review and confirm your withdrawal"}
            </DialogDescription>
          </DialogHeader>

          {step === "amount" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5">Amount (₦)</Label>
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
                  <Label className="text-xs font-semibold mb-1.5">Withdraw to</Label>
                  <div className="space-y-2 max-h-40 overflow-auto">
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
                  <Button size="sm" variant="outline" className="text-xs rounded-lg" onClick={() => { setModalOpen(false); navigate("/profile"); }}>
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
                  <Button size="sm" variant="outline" className="text-xs rounded-lg h-7" onClick={() => { setModalOpen(false); navigate("/profile"); }}>
                    Set PIN
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="rounded-xl font-bold text-xs flex-1" onClick={() => {
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
                <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setModalOpen(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                <Label className="text-xs font-semibold mb-1.5">Enter Withdrawal PIN</Label>
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
              <div className="flex gap-2 pt-2">
                <Button className="rounded-xl font-bold text-xs flex-1" disabled={processing} onClick={handleConfirmWithdraw}>
                  {processing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Confirm Withdrawal
                </Button>
                <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setStep("amount")}>Back</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardWallet;
