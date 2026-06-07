'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea } from '@edutech/ui';
import { Settings, Bell, Shield, Users, Database, Save, Plus, Trash2, AlertCircle, RefreshCw, HardDrive, Table, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useDatabaseStats } from '@/hooks/useDatabaseStats';

// Helper function to unflatten the flat key-value pairs from the API into our nested structure
function unflattenSettings(flat: Record<string, string>) {
  return {
    platform: {
      name: flat['platform.name'] ?? 'EduTech Platform',
      description: flat['platform.description'] ?? 'Modern online learning platform for students and instructors',
      logo: flat['platform.logo'] ?? '/logo.png',
      contactEmail: flat['platform.contactEmail'] ?? 'support@edutech.com',
      supportEmail: flat['platform.supportEmail'] ?? 'help@edutech.com',
    },
    notifications: {
      email: flat['notifications.email'] === 'true',
      push: flat['notifications.push'] === 'true',
      sms: flat['notifications.sms'] === 'true',
      frequency: (flat['notifications.frequency'] as 'immediate' | 'daily' | 'weekly') ?? 'daily',
    },
    security: {
      twoFactorAuth: flat['security.twoFactorAuth'] === 'true',
      sessionTimeout: parseInt(flat['security.sessionTimeout']) || 30,
      passwordPolicy: {
        minLength: parseInt(flat['security.passwordPolicy.minLength']) || 8,
        requireUppercase: flat['security.passwordPolicy.requireUppercase'] === 'true',
        requireNumbers: flat['security.passwordPolicy.requireNumbers'] === 'true',
        requireSpecialChars: flat['security.passwordPolicy.requireSpecialChars'] === 'true',
      },
    },
    users: {
      allowRegistration: flat['users.allowRegistration'] === 'true',
      requireApproval: flat['users.requireApproval'] === 'true',
      defaultRole: (flat['users.defaultRole'] as 'student' | 'instructor' | 'admin') ?? 'student',
    },
  };
}

// Helper function to flatten our nested structure into flat key-value pairs (as strings) for the API
function flattenSettingsForUpdate(settings: any): Record<string, string> {
  return {
    'platform.name': settings.platform.name,
    'platform.description': settings.platform.description,
    'platform.logo': settings.platform.logo,
    'platform.contactEmail': settings.platform.contactEmail,
    'platform.supportEmail': settings.platform.supportEmail,
    'notifications.email': String(settings.notifications.email),
    'notifications.push': String(settings.notifications.push),
    'notifications.sms': String(settings.notifications.sms),
    'notifications.frequency': settings.notifications.frequency,
    'security.twoFactorAuth': String(settings.security.twoFactorAuth),
    'security.sessionTimeout': String(settings.security.sessionTimeout),
    'security.passwordPolicy.minLength': String(settings.security.passwordPolicy.minLength),
    'security.passwordPolicy.requireUppercase': String(settings.security.passwordPolicy.requireUppercase),
    'security.passwordPolicy.requireNumbers': String(settings.security.passwordPolicy.requireNumbers),
    'security.passwordPolicy.requireSpecialChars': String(settings.security.passwordPolicy.requireSpecialChars),
    'users.allowRegistration': String(settings.users.allowRegistration),
    'users.requireApproval': String(settings.users.requireApproval),
    'users.defaultRole': settings.users.defaultRole,
  };
}

export default function SettingsPage() {
  const { settings: flatSettings, isLoading, error, updateSettings, isUpdating } = useAdminSettings();
  const { stats: dbStats, isLoading: dbStatsLoading, error: dbStatsError, refetch: refetchDbStats } = useDatabaseStats();
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('platform');

  // Convert flat API settings to nested structure when data is received
  if (flatSettings && !settings) {
    setSettings(unflattenSettings(flatSettings));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Failed to load settings. Please try again.</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No settings data available.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await new Promise<void>((resolve) => {
        // Call the updateSettings mutation with the flattened settings
        updateSettings(flattenSettingsForUpdate(settings));
        resolve();
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    }
  };

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'database', label: 'Database', icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'platform':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Platform Name
                  </label>
                  <Input
                    value={settings.platform.name}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, platform: { ...prev.platform, name: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                    value={settings.platform.description}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, platform: { ...prev.platform, description: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={settings.platform.contactEmail}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, platform: { ...prev.platform, contactEmail: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, platform: { ...prev.platform, supportEmail: e.target.value } }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Notification Methods</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-foreground">Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, email: e.target.checked } }))}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-foreground">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, push: e.target.checked } }))}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-foreground">SMS Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, sms: e.target.checked } }))}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Email Frequency</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['immediate', 'daily', 'weekly'].map((frequency) => (
                        <button
                          key={frequency}
                          onClick={() => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, frequency: frequency as any } }))}
                          className={cn(
                            "p-3 rounded-lg border text-center text-sm font-medium transition-colors",
                            settings.notifications.frequency === frequency
                              ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                              : 'border-border bg-card text-foreground hover:bg-accent'
                          )}
                        >
                          {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Two-Factor Authentication</h3>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Require 2FA for all users
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adds an extra layer of security to user accounts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, twoFactorAuth: e.target.checked } }))}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                    />
                  </label>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Session Timeout</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) || 30 } }))}
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Password Policy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Minimum password length
                        </span>
                        <Input
                          type="number"
                          value={settings.security.passwordPolicy.minLength}
                          onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, minLength: parseInt(e.target.value) || 8 } } }))}
                        />
                        <span className="w-24" />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Require uppercase letters
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireUppercase}
                          onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireUppercase: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Require numbers
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireNumbers: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Require special characters
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireSpecialChars: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                        />
                      </label>
                    </div>
                  </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Registration Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-foreground">
                        Allow user registration
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.users.allowRegistration}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, users: { ...prev.users, allowRegistration: e.target.checked } }))}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-foreground">
                        Require admin approval
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.users.requireApproval}
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, users: { ...prev.users, requireApproval: e.target.checked } }))}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Default User Role</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['student', 'instructor', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSettings((prev: any) => ({ ...prev, users: { ...prev.users, defaultRole: role as any } }))}
                          className={cn(
                            "p-3 rounded-lg border text-center text-sm font-medium transition-colors capitalize",
                            settings.users.defaultRole === role
                              ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                              : 'border-border bg-card text-foreground hover:bg-accent'
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            {/* Backup Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Backup Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    Automatic backups are scheduled daily at 2:00 AM. Last backup: 2 hours ago
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                  <Button variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Old Backups
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Database Statistics */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Database Statistics
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchDbStats()}
                    disabled={dbStatsLoading}
                  >
                    <RefreshCw className={cn('h-4 w-4 mr-1', dbStatsLoading && 'animate-spin')} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dbStatsLoading && !dbStats && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                    <span className="text-sm">Loading database statistics…</span>
                  </div>
                )}

                {dbStatsError && (
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Failed to load database statistics. Make sure the API is reachable and try again.
                      </p>
                    </div>
                  </div>
                )}

                {dbStats && (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <HardDrive className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Database Size</span>
                        </div>
                        <p className="text-2xl font-semibold text-foreground">{dbStats.databaseSize.pretty}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Table className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Tables</span>
                        </div>
                        <p className="text-2xl font-semibold text-foreground">{dbStats.tableCount}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Server className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Connections</span>
                        </div>
                        <p className="text-2xl font-semibold text-foreground">
                          {dbStats.connectionPool.total}
                          <span className="text-sm font-normal text-muted-foreground"> / {dbStats.connectionPool.maxPool}</span>
                        </p>
                      </div>
                    </div>

                    {/* Connection pool breakdown */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Connection Pool</h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-3 divide-x divide-border text-center text-sm">
                          <div className="p-3">
                            <p className="text-xs text-muted-foreground">Active</p>
                            <p className="text-lg font-semibold text-green-600">{dbStats.connectionPool.active}</p>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-muted-foreground">Idle</p>
                            <p className="text-lg font-semibold text-amber-500">{dbStats.connectionPool.idle}</p>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-muted-foreground">Max Pool</p>
                            <p className="text-lg font-semibold text-foreground">{dbStats.connectionPool.maxPool}</p>
                          </div>
                        </div>
                        {/* Usage bar */}
                        <div className="px-3 pb-3">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                (dbStats.connectionPool.total / dbStats.connectionPool.maxPool) > 0.8
                                  ? 'bg-red-500'
                                  : (dbStats.connectionPool.total / dbStats.connectionPool.maxPool) > 0.5
                                  ? 'bg-amber-500'
                                  : 'bg-green-500',
                              )}
                              style={{ width: `${Math.min((dbStats.connectionPool.total / dbStats.connectionPool.maxPool) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {((dbStats.connectionPool.total / dbStats.connectionPool.maxPool) * 100).toFixed(1)}% capacity
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table list */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Table Details</h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/60 text-left">
                                <th className="px-4 py-2 font-medium text-muted-foreground">Table</th>
                                <th className="px-4 py-2 font-medium text-muted-foreground text-right">Rows</th>
                                <th className="px-4 py-2 font-medium text-muted-foreground text-right">Size</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {dbStats.tables.map((tbl) => (
                                <tr key={tbl.name} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-4 py-2 font-mono text-xs text-foreground">{tbl.name}</td>
                                  <td className="px-4 py-2 text-right text-foreground">{tbl.rowCount.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-right text-muted-foreground">{tbl.sizePretty}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors",
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
          
          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}