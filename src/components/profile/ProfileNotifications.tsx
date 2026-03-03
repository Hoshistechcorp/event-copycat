import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone, Calendar, CreditCard, Megaphone, Info } from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const ProfileNotifications = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: "email_ticket", label: "Ticket Confirmations", description: "Receive email when you purchase a ticket", icon: CreditCard, enabled: true },
    { id: "email_event_reminder", label: "Event Reminders", description: "Get reminded 24h before events you're attending", icon: Calendar, enabled: true },
    { id: "email_promotions", label: "Promotions & Offers", description: "Receive special deals and featured events", icon: Megaphone, enabled: false },
    { id: "email_sales", label: "Ticket Sales (Hosts)", description: "Get notified when someone buys a ticket to your event", icon: CreditCard, enabled: true },
    { id: "email_withdrawal", label: "Withdrawal Updates", description: "Notifications about withdrawal status changes", icon: CreditCard, enabled: true },
    { id: "push_enabled", label: "Push Notifications", description: "Receive push notifications in your browser", icon: Smartphone, enabled: false },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold">Notification Preferences</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Choose how you want to be notified</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <setting.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor={setting.id} className="text-sm font-medium text-foreground cursor-pointer">
                  {setting.label}
                </Label>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            <Switch
              id={setting.id}
              checked={setting.enabled}
              onCheckedChange={() => toggleSetting(setting.id)}
            />
          </div>
        ))}
        <div className="flex items-center gap-2 pt-3 px-3">
          <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Notification preferences are saved automatically
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileNotifications;
