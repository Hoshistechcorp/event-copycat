import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateAssignment } from "@/hooks/useEventAssignments";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assignment: {
    id: string;
    scheduled_at: string | null;
    duration_minutes: number;
    notes: string | null;
  } | null;
  vendorName?: string;
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AssignmentEditDialog = ({ open, onOpenChange, assignment, vendorName }: Props) => {
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const update = useUpdateAssignment();

  useEffect(() => {
    if (assignment) {
      setScheduledAt(toLocalInput(assignment.scheduled_at));
      setDuration(assignment.duration_minutes ?? 60);
      setNotes(assignment.notes ?? "");
    }
  }, [assignment]);

  if (!assignment) return null;

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        id: assignment.id,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        duration_minutes: Number(duration) || 60,
        notes: notes || null,
      });
      toast({ title: "Timeline updated" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit slot</DialogTitle>
          <DialogDescription>{vendorName ?? "Vendor"} — schedule, duration, and notes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Scheduled time</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Setup details, briefing, equipment..." maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentEditDialog;
