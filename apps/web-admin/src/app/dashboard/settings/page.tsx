'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Switch, Separator, Textarea } from '@edutech/ui';
import { Settings, Bell, Shield, Users, Database, Save, Plus, Trash2 } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

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
  const { data: flatSettings, isLoading, error, updateSettings, isUpdating } = useAdminSettings();
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <Input
                    value={settings.platform.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, name: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    rows={3}
                    value={settings.platform.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, description: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={settings.platform.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, contactEmail: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, supportEmail: e.target.value } }))}
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Methods</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, email: e.target.checked } }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, push: e.target.checked } }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, sms: e.target.checked } }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Frequency</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['immediate', 'daily', 'weekly'].map((frequency) => (
                        <button
                          key={frequency}
                          onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, frequency: frequency as any } }))}
                          className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                            settings.notifications.frequency === frequency
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Require 2FA for all users
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Adds an extra layer of security to user accounts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, twoFactorAuth: e.target.checked } }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Session Timeout</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) || 30 } }))}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password Policy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Minimum password length
                        </span>
                        <Input
                          type="number"
                          value={settings.security.passwordPolicy.minLength}
                          onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, minLength: parseInt(e.target.value) || 8 } } }))}
                        />
                        <span className="w-24" />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Require uppercase letters
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireUppercase}
                          onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireUppercase: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Require numbers
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireNumbers: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Require special characters
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordPolicy: { ...prev.security.passwordPolicy, requireSpecialChars: e.target.checked } } }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Registration Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allow user registration
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.users.allowRegistration}
                        onChange={(e) => setSettings(prev => ({ ...prev, users: { ...prev.users, allowRegistration: e.target.checked } }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Require admin approval
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.users.requireApproval}
                        onChange={(e) => setSettings(prev => ({ ...prev, users: { ...prev.users, requireApproval: e.target.checked } }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Default User Role</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['student', 'instructor', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSettings(prev => ({ ...prev, users: { ...prev.users, defaultRole: role as any } }))}
                          className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors capitalize ${
                            settings.users.defaultRole === role
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
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
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup Configuration</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Database Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">2.4 GB</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tables</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">48</p>
                    </div>
                  </div>
                </div>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
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