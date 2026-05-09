import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Plus, Pencil, Trash2, Eye, CalendarDays, MapPin, MoreVertical, ListChecks, ScanLine, Users,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

type FilterStatus = "all" | "published" | "draft";

interface DashboardEventsListProps {
  events: Event[];
  loading: boolean;
  onEventsChange: (events: Event[]) => void;
}

const DashboardEventsList = ({ events, loading, onEventsChange }: DashboardEventsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  const counts = {
    all: events.length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
  };

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

  const toggleStatus = async (event: Event) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("events").update({ status: newStatus }).eq("id", event.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      onEventsChange(events.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)));
      toast({ title: `Event ${newStatus === "published" ? "published" : "unpublished"}` });
    }
  };

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "published", "draft"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span className="ml-1 opacity-70">({counts[s]})</span>
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
          <h3 className="text-lg font-bold text-foreground mb-1">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {filter === "all" ? "Create your first event to get started." : `No ${filter} events found.`}
          </p>
          {filter === "all" && (
            <Button className="rounded-xl" onClick={() => navigate("/create-event")}>
              <Plus className="h-4 w-4 mr-2" /> Create Event
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground truncate">{event.title}</h3>
                  <Badge
                    variant={event.status === "published" ? "default" : "secondary"}
                    className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                  >
                    {event.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.venue}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate(`/events/${event.id}`)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-44">
                    <DropdownMenuItem onClick={() => navigate(`/edit-event/${event.id}`)} className="text-xs cursor-pointer">
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/timeline`)} className="text-xs cursor-pointer">
                      <ListChecks className="h-3.5 w-3.5 mr-2" /> Vendor Timeline
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard?tab=guests`)} className="text-xs cursor-pointer">
                      <Users className="h-3.5 w-3.5 mr-2" /> Guests & RSVPs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/checkin/${event.id}`)} className="text-xs cursor-pointer">
                      <ScanLine className="h-3.5 w-3.5 mr-2" /> Check-in Scanner
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(event)} className="text-xs cursor-pointer">
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      {event.status === "published" ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(event.id)} className="text-xs text-destructive cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
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
    </>
  );
};

export default DashboardEventsList;
