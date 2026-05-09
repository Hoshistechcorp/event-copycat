import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Plus, Pencil, Trash2, Eye, CalendarDays, MapPin, MoreVertical,
  ListChecks, ScanLine, Users, FlaskConical, Share2, Rocket, FileText,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import TestRunShareDialog from "./TestRunShareDialog";

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  status: string;
  visibility?: string;
  image_url: string | null;
  created_at: string;
}

type Bucket = "all" | "draft" | "test" | "published";

interface DashboardEventsListProps {
  events: Event[];
  loading: boolean;
  onEventsChange: (events: Event[]) => void;
}

const isTestRun = (e: Event) => e.status === "published" && /^\[Test Run\]/i.test(e.title);
const bucketOf = (e: Event): Bucket =>
  e.status === "draft" ? "draft" : isTestRun(e) ? "test" : "published";

const BUCKET_META: Record<Exclude<Bucket, "all">, { label: string; tone: string; Icon: any }> = {
  draft:     { label: "Draft",     tone: "bg-muted text-muted-foreground",                      Icon: FileText },
  test:      { label: "Test Run",  tone: "bg-amber-500/15 text-amber-700 border-amber-500/30",  Icon: FlaskConical },
  published: { label: "Live",      tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", Icon: Rocket },
};

const DashboardEventsList = ({ events, loading, onEventsChange }: DashboardEventsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bucket, setBucket] = useState<Bucket>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  const counts = {
    all: events.length,
    draft: events.filter((e) => bucketOf(e) === "draft").length,
    test: events.filter((e) => bucketOf(e) === "test").length,
    published: events.filter((e) => bucketOf(e) === "published").length,
  };
  const filtered = bucket === "all" ? events : events.filter((e) => bucketOf(e) === bucket);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("events").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      onEventsChange(events.filter((e) => e.id !== deleteId));
      toast({ title: "Event deleted" });
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const promoteToLive = async () => {
    if (!promoteId) return;
    const ev = events.find((e) => e.id === promoteId);
    if (!ev) return;
    setPromoting(true);
    const cleanTitle = ev.title.replace(/^\[Test Run\]\s*/i, "");
    const { error } = await supabase
      .from("events")
      .update({ title: cleanTitle, visibility: "public", requires_rsvp: false } as any)
      .eq("id", ev.id);
    if (error) {
      toast({ title: "Promotion failed", description: error.message, variant: "destructive" });
    } else {
      onEventsChange(events.map((e) => (e.id === ev.id ? { ...e, title: cleanTitle, visibility: "public" } : e)));
      toast({ title: "Promoted to live event", description: "Now public on iBloov. Review pricing in Edit Event." });
    }
    setPromoting(false);
    setPromoteId(null);
  };

  const convertToTestRun = async (ev: Event) => {
    const newTitle = `[Test Run] ${ev.title.replace(/^\[Test Run\]\s*/i, "")}`;
    const { error } = await supabase
      .from("events")
      .update({ title: newTitle, visibility: "unlisted", requires_rsvp: true } as any)
      .eq("id", ev.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      onEventsChange(events.map((e) => (e.id === ev.id ? { ...e, title: newTitle, visibility: "unlisted" } : e)));
      toast({ title: "Switched to Test Run", description: "Event is now unlisted — share the link to gauge interest." });
    }
  };

  const publishDraft = async (ev: Event) => {
    const { error } = await supabase.from("events").update({ status: "published" }).eq("id", ev.id);
    if (error) {
      toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    } else {
      onEventsChange(events.map((e) => (e.id === ev.id ? { ...e, status: "published" } : e)));
      toast({ title: "Draft published" });
    }
  };

  return (
    <>
      {/* Bucket tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { key: "all" as Bucket, label: "All" },
          { key: "draft" as Bucket, label: "Drafts" },
          { key: "test" as Bucket, label: "Test Runs" },
          { key: "published" as Bucket, label: "Live" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setBucket(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              bucket === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className="ml-1 opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {bucket === "all" ? "No events yet" : `No ${BUCKET_META[bucket as Exclude<Bucket,"all">]?.label.toLowerCase()} events`}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {bucket === "all"
              ? "Create your first event to get started."
              : bucket === "draft"
              ? "Saved drafts will appear here so you can pick up where you left off."
              : bucket === "test"
              ? "Use Test Run to validate demand before launching live."
              : "Once you publish, your live events will show up here."}
          </p>
          <Button className="rounded-xl" onClick={() => navigate("/create-event")}>
            <Plus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event, i) => {
            const b = bucketOf(event);
            const meta = BUCKET_META[b];
            const isTest = b === "test";
            const isDraft = b === "draft";
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="hidden sm:block h-16 w-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-foreground truncate">
                      {event.title.replace(/^\[Test Run\]\s*/i, "")}
                    </h3>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 border ${meta.tone}`}>
                      <meta.Icon className="h-3 w-3 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.venue || "Online"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isDraft ? (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg gap-1 hidden sm:inline-flex"
                      onClick={() => navigate(`/edit-event/${event.id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Resume
                    </Button>
                  ) : isTest ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg gap-1 hidden sm:inline-flex border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
                      onClick={() => setShareEvent(event)}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Copy Link
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate(`/events/${event.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-52">
                      {isDraft && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/edit-event/${event.id}`)} className="text-xs cursor-pointer">
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Resume editing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => publishDraft(event)} className="text-xs cursor-pointer">
                            <Rocket className="h-3.5 w-3.5 mr-2" /> Publish now
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {isTest && (
                        <>
                          <DropdownMenuItem onClick={() => setShareEvent(event)} className="text-xs cursor-pointer">
                            <Share2 className="h-3.5 w-3.5 mr-2" /> Copy / share link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPromoteId(event.id)} className="text-xs cursor-pointer">
                            <Rocket className="h-3.5 w-3.5 mr-2" /> Promote to live event
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {b === "published" && (
                        <>
                          <DropdownMenuItem onClick={() => convertToTestRun(event)} className="text-xs cursor-pointer">
                            <FlaskConical className="h-3.5 w-3.5 mr-2" /> Switch to Test Run
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)} className="text-xs cursor-pointer">
                        <Eye className="h-3.5 w-3.5 mr-2" /> View public page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/edit-event/${event.id}`)} className="text-xs cursor-pointer">
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/timeline`)} className="text-xs cursor-pointer">
                        <ListChecks className="h-3.5 w-3.5 mr-2" /> Vendor timeline
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard?tab=guests`)} className="text-xs cursor-pointer">
                        <Users className="h-3.5 w-3.5 mr-2" /> Guests & RSVPs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/checkin/${event.id}`)} className="text-xs cursor-pointer">
                        <ScanLine className="h-3.5 w-3.5 mr-2" /> Check-in scanner
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteId(event.id)} className="text-xs text-destructive cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event and all its ticket tiers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote test run -> live */}
      <AlertDialog open={!!promoteId} onOpenChange={(open) => !open && setPromoteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Promote Test Run to live event?</AlertDialogTitle>
            <AlertDialogDescription>
              This makes the event public on iBloov, removes the [Test Run] label, and disables RSVP-only mode. You can review ticket pricing in Edit Event afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={promoteToLive} disabled={promoting}>
              {promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4 mr-1.5" /> Promote to live</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share dialog */}
      <TestRunShareDialog open={!!shareEvent} onOpenChange={(o) => !o && setShareEvent(null)} event={shareEvent} />
    </>
  );
};

export default DashboardEventsList;
