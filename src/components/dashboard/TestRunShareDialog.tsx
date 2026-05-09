import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, MessageCircle, Mail, Check, FlaskConical, CalendarDays, MapPin } from "lucide-react";

interface TestRunShareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: {
    id: string;
    title: string;
    date: string;
    venue: string;
    image_url: string | null;
  } | null;
}

const TestRunShareDialog = ({ open, onOpenChange, event }: TestRunShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  if (!event) return null;

  const cleanTitle = event.title.replace(/^\[Test Run\]\s*/i, "");
  const shareUrl = `${window.location.origin}/events/${event.id}`;
  const shareText = `Help me test this event idea on iBloov: "${cleanTitle}". Tap RSVP if you'd come — your vote shapes the real launch.`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Paste it anywhere to share." });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: cleanTitle, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Test run: ${cleanTitle}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-600" /> Share your Test Run
          </DialogTitle>
          <DialogDescription>
            Send the link to friends and your audience. Only people with the link see this event.
          </DialogDescription>
        </DialogHeader>

        {/* Share card preview */}
        <div className="rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-amber-500/10 via-background to-primary/5">
          <div className="h-32 bg-secondary relative">
            {event.image_url ? (
              <img src={event.image_url} alt={cleanTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              <FlaskConical className="h-3 w-3" /> TEST RUN
            </div>
          </div>
          <div className="p-3">
            <p className="font-extrabold text-sm leading-tight mb-1">{cleanTitle}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.venue || "Online"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="rounded-xl bg-secondary text-xs" onClick={(e) => (e.currentTarget as HTMLInputElement).select()} />
          <Button onClick={copyLink} className="rounded-xl shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="rounded-xl" onClick={nativeShare}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contents">
            <Button variant="outline" className="rounded-xl w-full">
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
          </a>
          <a href={mailtoUrl} className="contents">
            <Button variant="outline" className="rounded-xl w-full">
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestRunShareDialog;
