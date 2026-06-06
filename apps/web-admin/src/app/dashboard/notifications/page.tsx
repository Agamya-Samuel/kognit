'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Switch, Separator, Badge } from '@edutech/ui';
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
    await updateConfig(settings as Record<string, unknown>);
    setSaved(true);
  };

  const toggleAllChannel = (channel: Channel, value: boolean) => {
    const updated = { ...settings };
    for (const cat of Object.keys(CATEGORY_LABELS) as Category[]) {
      updated[getConfigKey(channel, cat)] = value;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                  {channelInfo.map(({ key, label, icon: Icon }) => (
                    <th key={key} className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
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
                    <tr key={category} className={idx < 3 ? 'border-b' : ''}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <CatIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{catInfo.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{catInfo.description}</p>
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

          <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t">
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
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  settings.emailFrequency === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    settings.emailFrequency === opt.value ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {settings.emailFrequency === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    settings.emailFrequency === opt.value ? 'text-primary' : 'text-gray-900 dark:text-white'
                  }`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
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
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  settings.smsFrequency === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <div className="mt-0.5">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    settings.smsFrequency === opt.value ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {settings.smsFrequency === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    settings.smsFrequency === opt.value ? 'text-primary' : 'text-gray-900 dark:text-white'
                  }`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
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
                <div key={key} className="rounded-lg border p-4 text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {enabledCount}<span className="text-sm font-normal text-muted-foreground">/{totalCount}</span>
                  </p>
                  <Badge variant={enabledCount === totalCount ? 'default' : 'secondary'} className="mt-2">
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
