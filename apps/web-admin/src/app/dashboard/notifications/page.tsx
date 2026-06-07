'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Switch, Badge } from '@edutech/ui';
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Save,
  Clock,
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  Megaphone,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationConfig } from '@/hooks/useNotificationConfig';

const CATEGORY_LABELS = {
  enrollments: { label: 'Enrollments', description: 'Course enrollment confirmations and updates', icon: BookOpen },
  submissions: { label: 'Submissions', description: 'Assignment submission notifications and grades', icon: ClipboardCheck },
  reminders: { label: 'Reminders', description: 'Live class reminders and due date alerts', icon: CalendarClock },
  marketing: { label: 'Marketing', description: 'Promotional emails and platform announcements', icon: Megaphone },
} as const;

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', description: 'Send as soon as the event occurs' },
  { value: 'daily', label: 'Daily Digest', description: 'Bundle into one daily summary email' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Bundle into one weekly summary email' },
] as const;

type Category = keyof typeof CATEGORY_LABELS;
type Channel = 'email' | 'push' | 'sms';

interface NotificationConfig {
  emailEnrollments: boolean;
  emailSubmissions: boolean;
  emailReminders: boolean;
  emailMarketing: boolean;
  pushEnrollments: boolean;
  pushSubmissions: boolean;
  pushReminders: boolean;
  pushMarketing: boolean;
  smsEnrollments: boolean;
  smsSubmissions: boolean;
  smsReminders: boolean;
  smsMarketing: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  smsFrequency: 'immediate' | 'daily' | 'weekly';
}

const DEFAULTS: NotificationConfig = {
  emailEnrollments: true,
  emailSubmissions: true,
  emailReminders: true,
  emailMarketing: false,
  pushEnrollments: true,
  pushSubmissions: true,
  pushReminders: true,
  pushMarketing: false,
  smsEnrollments: false,
  smsSubmissions: false,
  smsReminders: false,
  smsMarketing: false,
  emailFrequency: 'immediate',
  smsFrequency: 'immediate',
};

const CATEGORY_TO_FIELD: Record<Category, string> = {
  enrollments: 'Enrollments',
  submissions: 'Submissions',
  reminders: 'Reminders',
  marketing: 'Marketing',
};

function getConfigKey(channel: Channel, category: Category): keyof NotificationConfig {
  return `${channel}${CATEGORY_TO_FIELD[category]}` as keyof NotificationConfig;
}

export default function NotificationsPage() {
  const { config, isLoading, updateConfig, isUpdating } = useNotificationConfig();
  const [settings, setSettings] = useState<NotificationConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    useEffect(() => {
    if (config && !isLoading) {
        setSettings({
          emailEnrollments: config.emailEnrollments ?? DEFAULTS.emailEnrollments,
          emailSubmissions: config.emailSubmissions ?? DEFAULTS.emailSubmissions,
          emailReminders: config.emailReminders ?? DEFAULTS.emailReminders,
          emailMarketing: config.emailMarketing ?? DEFAULTS.emailMarketing,
          pushEnrollments: config.pushEnrollments ?? DEFAULTS.pushEnrollments,
          pushSubmissions: config.pushSubmissions ?? DEFAULTS.pushSubmissions,
          pushReminders: config.pushReminders ?? DEFAULTS.pushReminders,
          pushMarketing: config.pushMarketing ?? DEFAULTS.pushMarketing,
          smsEnrollments: config.smsEnrollments ?? DEFAULTS.smsEnrollments,
          smsSubmissions: config.smsSubmissions ?? DEFAULTS.smsSubmissions,
          smsReminders: config.smsReminders ?? DEFAULTS.smsReminders,
          smsMarketing: config.smsMarketing ?? DEFAULTS.smsMarketing,
          emailFrequency: config.emailFrequency ?? DEFAULTS.emailFrequency,
          smsFrequency: config.smsFrequency ?? DEFAULTS.smsFrequency,
        });
      }
  }, [config, isLoading]);
  }, [config, isLoading]);

  const toggleChannel = (channel: Channel, category: Category) => {
    const key = getConfigKey(channel, category);
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const setFrequency = (channel: 'email' | 'sms', value: 'immediate' | 'daily' | 'weekly') => {
    const key = `${channel}Frequency` as keyof NotificationConfig;
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await updateConfig(settings as unknown as Record<string, unknown>);
    setSaved(true);
  };

  const toggleAllChannel = (channel: Channel, value: boolean) => {
    const updated = { ...settings };
    for (const cat of Object.keys(CATEGORY_LABELS) as Category[]) {
      (updated as Record<string, unknown>)[getConfigKey(channel, cat) as string] = value;
    }
    setSettings(updated);
    setSaved(false);
  };

  const channelInfo: { key: Channel; label: string; icon: typeof Mail }[] = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'push', label: 'Push', icon: Monitor },
    { key: 'sms', label: 'SMS', icon: Smartphone },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure notification channels, categories, and delivery frequency
          </p>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isUpdating ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                  {channelInfo.map(({ key, label, icon: Icon }) => (
                    <th key={key} className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((category, idx) => {
                  const catInfo = CATEGORY_LABELS[category];
                  const CatIcon = catInfo.icon;
                  return (
                    <tr key={category} className={cn("transition-colors hover:bg-accent/50", idx < 3 ? 'border-b border-border' : '')}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <CatIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{catInfo.label}</p>
                            <p className="text-xs text-muted-foreground">{catInfo.description}</p>
                          </div>
                        </div>
                      </td>
                      {channelInfo.map(({ key }) => (
                        <td key={key} className="py-4 px-4 text-center">
                          <Switch
                            checked={settings[getConfigKey(key, category)] as boolean}
                            onCheckedChange={() => toggleChannel(key, category)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
            {channelInfo.map(({ key, label }) => {
              const allOn = (Object.keys(CATEGORY_LABELS) as Category[]).every(
                (cat) => settings[getConfigKey(key, cat)],
              );
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAllChannel(key, !allOn)}
                >
                  {allOn ? `Disable All ${label}` : `Enable All ${label}`}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency('email', opt.value)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                  settings.emailFrequency === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className="mt-0.5">
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                    settings.emailFrequency === opt.value ? 'border-primary' : 'border-muted-foreground/30'
                  )}>
                    {settings.emailFrequency === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    settings.emailFrequency === opt.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              SMS Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency('sms', opt.value)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                  settings.smsFrequency === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className="mt-0.5">
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                    settings.smsFrequency === opt.value ? 'border-primary' : 'border-muted-foreground/30'
                  )}>
                    {settings.smsFrequency === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    settings.smsFrequency === opt.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Channel Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {channelInfo.map(({ key, label, icon: Icon }) => {
              const enabledCount = (Object.keys(CATEGORY_LABELS) as Category[]).filter(
                (cat) => settings[getConfigKey(key, cat)],
              ).length;
              const totalCount = Object.keys(CATEGORY_LABELS).length;
              return (
                <div key={key} className="rounded-lg border border-border bg-card p-5 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {enabledCount}<span className="text-sm font-normal text-muted-foreground">/{totalCount}</span>
                  </p>
                  <Badge variant={enabledCount === totalCount ? 'default' : 'secondary'} className="mt-3">
                    {enabledCount === totalCount ? 'All Active' : `${totalCount - enabledCount} Off`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
