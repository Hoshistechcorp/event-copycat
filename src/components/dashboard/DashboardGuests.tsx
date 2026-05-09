import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Download, Users, Send, Plus, Trash2, Copy, ScanLine, Search, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface EventOpt { id: string; title: string; visibility: string; requires_rsvp: boolean; date: string; }
interface InviteRow { id: string; email: string; name: string | null; status: string; invite_token: string; sent_at: string | null; created_at: string; }
interface RsvpRow { id: string; email: string | null; name: string | null; status: string; plus_ones: number; responded_at: string; user_id: string | null; invite_id: string | null; }

const csvEscape = (v: any) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const downloadCsv = (filename: string, rows: any[][]) => {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const DashboardGuests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventOpt[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newInvite, setNewInvite] = useState({ email: "", name: "" });
  const [adding, setAdding] = useState(false);

  // Load events
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, visibility, requires_rsvp, date")
        .eq("host_id", user.id)
        .order("date", { ascending: false });
      const list = (data || []) as EventOpt[];
      setEvents(list);
      if (!eventId && list[0]) setEventId(list[0].id);
      setLoading(false);
    })();
  }, [user]);

  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);

  const loadGuests = async () => {
    if (!eventId) return;
    const [{ data: inv }, { data: rsv }] = await Promise.all([
      supabase.from("event_invites").select("*").eq("event_id", eventId).order("created_at", { ascending: false }),
      supabase.from("rsvps").select("*").eq("event_id", eventId).order("responded_at", { ascending: false }),
    ]);
    setInvites((inv || []) as InviteRow[]);
    setRsvps((rsv || []) as RsvpRow[]);
  };
  useEffect(() => { loadGuests(); }, [eventId]);

  const inviteByRsvp = useMemo(() => {
    const m = new Map<string, InviteRow>();
    invites.forEach((i) => m.set(i.id, i));
    return m;
  }, [invites]);
  const rsvpByInvite = useMemo(() => {
    const m = new Map<string, RsvpRow>();
    rsvps.forEach((r) => { if (r.invite_id) m.set(r.invite_id, r); });
    return m;
  }, [rsvps]);

  const counts = useMemo(() => ({
    invited: invites.length,
    responded: invites.filter((i) => rsvpByInvite.has(i.id)).length,
    going: rsvps.filter((r) => r.status === "going").length,
    maybe: rsvps.filter((r) => r.status === "maybe").length,
    no: rsvps.filter((r) => r.status === "not_going").length,
    plusOnes: rsvps.reduce((a, r) => a + (r.plus_ones || 0), 0),
  }), [invites, rsvps, rsvpByInvite]);

  const filteredInvites = useMemo(() => {
    return invites.filter((i) => {
      if (statusFilter !== "all") {
        const r = rsvpByInvite.get(i.id);
        const s = r ? r.status : "pending";
        if (s !== statusFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!(i.email.toLowerCase().includes(q) || (i.name || "").toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [invites, rsvpByInvite, statusFilter, search]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!((r.email || "").toLowerCase().includes(q) || (r.name || "").toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [rsvps, statusFilter, search]);

  const addInvite = async () => {
    if (!eventId || !newInvite.email.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("event_invites").insert({
      event_id: eventId,
      email: newInvite.email.trim().toLowerCase(),
      name: newInvite.name.trim() || null,
      status: "pending",
    });
    setAdding(false);
    if (error) { toast({ title: "Failed to add invite", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Invite added" });
    setNewInvite({ email: "", name: "" });
    loadGuests();
  };

  const removeInvite = async (id: string) => {
    const { error } = await supabase.from("event_invites").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setInvites((xs) => xs.filter((x) => x.id !== id));
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Invite link copied", description: url });
  };

  const exportInvitesCsv = () => {
    const rows = [
      ["Email", "Name", "RSVP Status", "Plus Ones", "Responded At", "Invite Link"],
      ...invites.map((i) => {
        const r = rsvpByInvite.get(i.id);
        return [
          i.email,
          i.name || "",
          r?.status || "pending",
          r?.plus_ones || 0,
          r?.responded_at ? new Date(r.responded_at).toISOString() : "",
          `${window.location.origin}/rsvp/${i.invite_token}`,
        ];
      }),
    ];
    downloadCsv(`${event?.title || "event"}-invites.csv`, rows);
  };

  const exportRsvpsCsv = () => {
    const rows = [
      ["Name", "Email", "Status", "Plus Ones", "Source", "Responded At"],
      ...rsvps.map((r) => [
        r.name || "",
        r.email || "",
        r.status,
        r.plus_ones,
        r.invite_id ? "invited" : "public",
        new Date(r.responded_at).toISOString(),
      ]),
    ];
    downloadCsv(`${event?.title || "event"}-rsvps.csv`, rows);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-1">No events yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Create a private event with RSVPs to manage guests here.</p>
        <Button className="rounded-xl" onClick={() => navigate("/create-event")}><Plus className="h-4 w-4 mr-2" /> Create Event</Button>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      going: "bg-primary/15 text-primary",
      maybe: "bg-amber-400/15 text-amber-600",
      not_going: "bg-destructive/15 text-destructive",
      pending: "bg-secondary text-muted-foreground",
    };
    return <Badge className={`rounded-full text-[10px] font-bold ${map[s] || map.pending}`}>{s.replace("_", " ")}</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* Event picker + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={eventId} onValueChange={setEventId}>
          <SelectTrigger className="rounded-xl sm:max-w-xs"><SelectValue placeholder="Choose event" /></SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} {e.visibility !== "public" && <span className="text-[10px] text-muted-foreground ml-1">· {e.visibility}</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => eventId && navigate(`/checkin/${eventId}`)}>
            <ScanLine className="h-3.5 w-3.5 mr-1.5" /> Check-in
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card className="p-3 rounded-xl"><p className="text-[10px] uppercase text-muted-foreground tracking-wide">Invited</p><p className="text-xl font-extrabold">{counts.invited}</p></Card>
        <Card className="p-3 rounded-xl"><p className="text-[10px] uppercase text-muted-foreground tracking-wide">Responded</p><p className="text-xl font-extrabold">{counts.responded}</p></Card>
        <Card className="p-3 rounded-xl"><p className="text-[10px] uppercase text-muted-foreground tracking-wide">Going</p><p className="text-xl font-extrabold text-primary">{counts.going}</p></Card>
        <Card className="p-3 rounded-xl"><p className="text-[10px] uppercase text-muted-foreground tracking-wide">Maybe</p><p className="text-xl font-extrabold text-amber-500">{counts.maybe}</p></Card>
        <Card className="p-3 rounded-xl"><p className="text-[10px] uppercase text-muted-foreground tracking-wide">+ Guests</p><p className="text-xl font-extrabold">{counts.plusOnes}</p></Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="invites">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
          <TabsList className="rounded-xl">
            <TabsTrigger value="invites" className="rounded-lg">Invites ({invites.length})</TabsTrigger>
            <TabsTrigger value="rsvps" className="rounded-lg">RSVPs ({rsvps.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="pl-8 rounded-xl h-9 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="going">Going</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="not_going">Not going</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="invites" className="space-y-3">
          {/* Add invite */}
          <Card className="p-3 rounded-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="guest@email.com" value={newInvite.email} onChange={(e) => setNewInvite((s) => ({ ...s, email: e.target.value }))} className="rounded-xl h-9 text-sm" />
              <Input placeholder="Name (optional)" value={newInvite.name} onChange={(e) => setNewInvite((s) => ({ ...s, name: e.target.value }))} className="rounded-xl h-9 text-sm sm:max-w-xs" />
              <div className="flex gap-2">
                <Button className="rounded-xl h-9" onClick={addInvite} disabled={adding || !newInvite.email.trim()}>
                  {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5 mr-1" /> Add</>}
                </Button>
                <Button variant="outline" className="rounded-xl h-9" onClick={exportInvitesCsv} disabled={invites.length === 0}>
                  <Download className="h-3.5 w-3.5 mr-1" /> CSV
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Guest</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">+1s</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvites.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-10">No invites match your filters.</TableCell></TableRow>
                ) : filteredInvites.map((i) => {
                  const r = rsvpByInvite.get(i.id);
                  return (
                    <TableRow key={i.id}>
                      <TableCell>
                        <p className="text-sm font-semibold">{i.name || i.email.split("@")[0]}</p>
                        <p className="text-[11px] text-muted-foreground">{i.email}</p>
                      </TableCell>
                      <TableCell>{statusBadge(r?.status || "pending")}</TableCell>
                      <TableCell className="text-xs">{r?.plus_ones || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Copy invite link" onClick={() => copyInviteLink(i.invite_token)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Email invite" asChild>
                          <a href={`mailto:${i.email}?subject=${encodeURIComponent("You're invited: " + (event?.title || ""))}&body=${encodeURIComponent(`Please RSVP: ${window.location.origin}/rsvp/${i.invite_token}`)}`}>
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" title="Remove" onClick={() => removeInvite(i.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="rsvps" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" className="rounded-xl h-9" onClick={exportRsvpsCsv} disabled={rsvps.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export RSVPs
            </Button>
          </div>
          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Guest</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">+1s</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Responded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRsvps.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-10">No RSVPs yet.</TableCell></TableRow>
                ) : filteredRsvps.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="text-sm font-semibold">{r.name || r.email?.split("@")[0] || "Guest"}</p>
                      <p className="text-[11px] text-muted-foreground">{r.email}</p>
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs">{r.plus_ones}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.invite_id ? "Invited" : "Public"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.responded_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardGuests;
