import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, ScanLine, CheckCircle2, XCircle, RotateCcw, Camera, CameraOff, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ScanResult =
  | { kind: "idle" }
  | { kind: "looking" }
  | { kind: "ok"; name: string; tier: string; qty: number; alreadyCheckedIn: boolean; at: string }
  | { kind: "error"; message: string };

const CheckIn = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<{ id: string; title: string; date: string } | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<ScanResult>({ kind: "idle" });
  const [stats, setStats] = useState({ scanned: 0, total: 0, dupes: 0 });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ token: string; t: number }>({ token: "", t: 0 });

  // Load event + counts
  useEffect(() => {
    if (!user || !eventId) return;
    (async () => {
      setEventLoading(true);
      const { data: ev } = await supabase
        .from("events")
        .select("id, title, date, host_id")
        .eq("id", eventId)
        .maybeSingle();
      if (!ev || ev.host_id !== user.id) {
        toast({ title: "Not authorized", description: "You can only check in your own events.", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setEvent({ id: ev.id, title: ev.title, date: ev.date });
      const { data: tix } = await supabase
        .from("ticket_purchases")
        .select("checked_in_at, quantity")
        .eq("event_id", eventId);
      const total = (tix || []).reduce((a, t) => a + (t.quantity || 1), 0);
      const scanned = (tix || []).filter((t) => t.checked_in_at).reduce((a, t) => a + (t.quantity || 1), 0);
      setStats({ scanned, total, dupes: 0 });
      setEventLoading(false);
    })();
  }, [user, eventId, navigate]);

  const verifyToken = async (raw: string) => {
    let token = raw.trim();
    // QR payload may be JSON {t,e,p}
    try {
      const parsed = JSON.parse(token);
      if (parsed?.t) token = parsed.t;
    } catch {}
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setResult({ kind: "error", message: "Invalid QR code or token format." });
      return;
    }
    setResult({ kind: "looking" });

    const { data: tp, error } = await supabase
      .from("ticket_purchases")
      .select("id, event_id, buyer_name, buyer_email, quantity, checked_in_at, ticket_tiers(name)")
      .eq("qr_token", token)
      .maybeSingle();

    if (error || !tp) {
      setResult({ kind: "error", message: "Ticket not found." });
      return;
    }
    if (tp.event_id !== eventId) {
      setResult({ kind: "error", message: "This ticket belongs to a different event." });
      return;
    }
    if (tp.checked_in_at) {
      setStats((s) => ({ ...s, dupes: s.dupes + 1 }));
      setResult({
        kind: "ok",
        name: tp.buyer_name || tp.buyer_email,
        tier: (tp as any).ticket_tiers?.name || "General",
        qty: tp.quantity || 1,
        alreadyCheckedIn: true,
        at: tp.checked_in_at,
      });
      return;
    }

    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from("ticket_purchases")
      .update({ checked_in_at: now })
      .eq("id", tp.id);
    if (upErr) {
      setResult({ kind: "error", message: upErr.message });
      return;
    }
    setStats((s) => ({ ...s, scanned: s.scanned + (tp.quantity || 1) }));
    setResult({
      kind: "ok",
      name: tp.buyer_name || tp.buyer_email,
      tier: (tp as any).ticket_tiers?.name || "General",
      qty: tp.quantity || 1,
      alreadyCheckedIn: false,
      at: now,
    });
  };

  const startScanner = async () => {
    setResult({ kind: "idle" });
    setScanning(true);
    try {
      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          const now = Date.now();
          if (decoded === lastScanRef.current.token && now - lastScanRef.current.t < 2500) return;
          lastScanRef.current = { token: decoded, t: now };
          verifyToken(decoded);
        },
        () => {}
      );
    } catch (e: any) {
      setScanning(false);
      toast({ title: "Camera error", description: e?.message || "Could not start camera. Try paste-mode below.", variant: "destructive" });
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {}
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => { stopScanner(); }, []);

  if (authLoading || eventLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) { navigate("/signin"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(`/dashboard?tab=events`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold truncate">Check-in</h1>
            <p className="text-xs text-muted-foreground truncate">{event?.title}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Card className="p-3 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Checked in</p>
            <p className="text-lg font-extrabold text-primary">{stats.scanned}</p>
          </Card>
          <Card className="p-3 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sold</p>
            <p className="text-lg font-extrabold">{stats.total}</p>
          </Card>
          <Card className="p-3 rounded-xl text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duplicates</p>
            <p className="text-lg font-extrabold text-amber-500">{stats.dupes}</p>
          </Card>
        </div>

        {/* Scanner */}
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">QR Scanner</span>
            </div>
            {scanning ? (
              <Button size="sm" variant="outline" className="rounded-full h-8" onClick={stopScanner}>
                <CameraOff className="h-3.5 w-3.5 mr-1" /> Stop
              </Button>
            ) : (
              <Button size="sm" className="rounded-full h-8" onClick={startScanner}>
                <Camera className="h-3.5 w-3.5 mr-1" /> Start camera
              </Button>
            )}
          </div>
          <div id="qr-reader" className={`rounded-xl overflow-hidden bg-secondary/40 ${scanning ? "min-h-[280px]" : "hidden"}`} />
          {!scanning && (
            <div className="rounded-xl bg-secondary/40 p-6 text-center text-xs text-muted-foreground">
              Tap “Start camera” to scan ticket QR codes, or paste a token below.
            </div>
          )}
        </Card>

        {/* Manual paste */}
        <Card className="p-4 rounded-2xl mt-4">
          <p className="text-sm font-bold mb-2">Manual check-in</p>
          <div className="flex gap-2">
            <Input
              placeholder="Paste QR token (UUID)"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="rounded-xl text-sm font-mono"
            />
            <Button className="rounded-xl" onClick={() => manualToken && verifyToken(manualToken)} disabled={!manualToken.trim()}>
              <Search className="h-4 w-4 mr-1" /> Verify
            </Button>
          </div>
        </Card>

        {/* Result */}
        {result.kind !== "idle" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            {result.kind === "looking" && (
              <Card className="p-4 rounded-2xl flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">Verifying ticket…</span>
              </Card>
            )}
            {result.kind === "error" && (
              <Card className="p-4 rounded-2xl border-destructive/40 bg-destructive/5 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-destructive">Rejected</p>
                  <p className="text-xs text-muted-foreground">{result.message}</p>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setResult({ kind: "idle" })}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </Card>
            )}
            {result.kind === "ok" && (
              <Card className={`p-4 rounded-2xl ${result.alreadyCheckedIn ? "border-amber-400/40 bg-amber-400/5" : "border-primary/40 bg-primary/5"} flex items-start gap-3`}>
                <CheckCircle2 className={`h-6 w-6 shrink-0 mt-0.5 ${result.alreadyCheckedIn ? "text-amber-500" : "text-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-extrabold ${result.alreadyCheckedIn ? "text-amber-600" : "text-primary"}`}>
                    {result.alreadyCheckedIn ? "Already checked in" : "Welcome in!"}
                  </p>
                  <p className="text-sm font-semibold truncate">{result.name}</p>
                  <p className="text-xs text-muted-foreground">{result.tier} · Qty {result.qty}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">at {new Date(result.at).toLocaleTimeString()}</p>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setResult({ kind: "idle" })}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-6">
          Need help? <Link to={`/events/${eventId}`} className="underline">View event page</Link>
        </p>
      </section>
    </div>
  );
};

export default CheckIn;
