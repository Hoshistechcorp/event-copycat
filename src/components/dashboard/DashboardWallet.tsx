import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const transactions = [
  { id: 1, type: "credit", label: "Ticket sale – Neon Nights", amount: "+₦5,000", date: "Mar 1, 2026", status: "completed" },
  { id: 2, type: "debit", label: "Withdrawal to bank", amount: "-₦3,000", date: "Feb 28, 2026", status: "completed" },
  { id: 3, type: "credit", label: "Ticket sale – Lagos Tech Meetup", amount: "+₦2,500", date: "Feb 25, 2026", status: "pending" },
];

const DashboardWallet = () => {
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
              <p className="text-3xl font-extrabold">₦0.00</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-4 rounded-xl text-xs font-bold"
              >
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
              <p className="text-3xl font-extrabold text-foreground">₦0.00</p>
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
              <p className="text-3xl font-extrabold text-foreground">₦0.00</p>
              <p className="text-xs text-muted-foreground mt-2">All time earnings</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transaction history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Transaction History</CardTitle>
            <p className="text-xs text-muted-foreground">Your recent earnings and withdrawals</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      tx.type === "credit" ? "bg-green-500/10" : "bg-destructive/10"
                    }`}>
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${tx.type === "credit" ? "text-green-500" : "text-destructive"}`}>
                      {tx.amount}
                    </span>
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-[10px] rounded-full">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-10">
                <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground">Start selling tickets to see your earnings here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardWallet;
