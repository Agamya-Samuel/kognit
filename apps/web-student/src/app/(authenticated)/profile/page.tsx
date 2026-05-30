'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, 
  Button, Input, Label, Avatar, Switch, Separator, Badge
} from '@edutech/ui';
import { Settings, Shield, LogOut, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '@edutech/shared-components';
import { usersService } from '@edutech/api-client';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationsService } from '@edutech/api-client';
import { authService } from '@edutech/api-client';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { user, logout, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    institution: '',
  });
  const [error, setError] = useState<string | null>(null);
  useNotifications({ isRead: false });
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    liveClassAlerts: true,
    marketingEmails: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isLoadingTwoFactor, setIsLoadingTwoFactor] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadNotificationPreferences();
      loadTwoFactorStatus();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      const profile = await usersService.getProfile();
      setFormData({
        name: profile.name,
        email: profile.email,
        grade: profile.grade || '',
        institution: profile.institution || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await notificationsService.getPreferences();
      setNotificationPreferences({
        emailNotifications: prefs.emailNotifications ?? true,
        assignmentReminders: prefs.assignmentReminders ?? true,
        liveClassAlerts: prefs.liveClassAlerts ?? true,
        marketingEmails: prefs.marketingEmails ?? true,
      });
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      setIsLoadingTwoFactor(true);
      setIsTwoFactorEnabled(false);
    } catch (err) {
      console.error('Failed to load 2FA status:', err);
      setIsTwoFactorEnabled(false);
    } finally {
      setIsLoadingTwoFactor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersService.updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile');
      console.error('Profile save error:', err);
    }
  };

  const handleNotificationPreferenceChange = async (prefKey: keyof typeof notificationPreferences, checked: boolean) => {
    try {
      setIsSavingPreferences(true);
      await notificationsService.updatePreferences({
        [prefKey]: checked,
      });
      setNotificationPreferences(prev => ({
        ...prev,
        [prefKey]: checked,
      }));
    } catch (err) {
      console.error(`Failed to update ${prefKey}:`, err);
      setNotificationPreferences(prev => ({
        ...prev,
        [prefKey]: !checked,
      }));
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      setIsLoadingTwoFactor(true);
      if (isTwoFactorEnabled) {
        await authService.disableTwoFactor('');
        setIsTwoFactorEnabled(false);
      } else {
        await authService.enableTwoFactor();
        setIsTwoFactorEnabled(true);
      }
    } catch (err) {
      console.error('Failed to toggle 2FA:', err);
      alert('Failed to update 2FA settings. Please try again.');
    } finally {
      setIsLoadingTwoFactor(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-pulse rounded-full bg-muted h-12 w-12"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/50 border border-destructive text-destructive rounded-lg px-6 py-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-destructive hover:text-destructive/80 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
    
  return (
<div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20" src={user.avatarUrl} fallback={formData.name} />
              <div className="flex-1">
                <CardTitle>{formData.name}</CardTitle>
                <CardDescription>
                  Student
                  {!user.isVerified && (
                    <Badge variant="destructive" className="ml-2">Email not verified</Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!user.isVerified && (
                  <Button variant="outline" size="sm" onClick={() => router.push('/verify-email')}>
                    Verify Email
                  </Button>
                )}
                <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing || user.onboardingCompleted}
                  />
                  {user.onboardingCompleted && (
                    <p className="text-xs text-muted-foreground">Name cannot be changed after onboarding</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Year</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., 12th, 2nd Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    disabled={!isEditing}
                    placeholder="School or college name"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive updates via email</div>
              </div>
              <Switch 
                checked={notificationPreferences.emailNotifications}
                onCheckedChange={(checked) => handleNotificationPreferenceChange('emailNotifications', checked as boolean)}
                disabled={isSavingPreferences}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Assignment Reminders</div>
                <div className="text-sm text-muted-foreground">Get notified before due dates</div>
              </div>
              <Switch 
                checked={notificationPreferences.assignmentReminders}
                onCheckedChange={(checked) => handleNotificationPreferenceChange('assignmentReminders', checked as boolean)}
                disabled={isSavingPreferences}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Live Class Alerts</div>
                <div className="text-sm text-muted-foreground">Be notified when classes start</div>
              </div>
              <Switch 
                checked={notificationPreferences.liveClassAlerts}
                onCheckedChange={(checked) => handleNotificationPreferenceChange('liveClassAlerts', checked as boolean)}
                disabled={isSavingPreferences}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-muted-foreground">Receive course recommendations</div>
              </div>
              <Switch 
                checked={notificationPreferences.marketingEmails}
                onCheckedChange={(checked) => handleNotificationPreferenceChange('marketingEmails', checked as boolean)}
                disabled={isSavingPreferences}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleToggleTwoFactor}>
              <Shield className="h-4 w-4" />
              Two-Factor Authentication
              <Badge 
                variant={isTwoFactorEnabled ? 'success' : 'secondary'} 
                className="ml-auto"
              >
                {isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {isLoadingTwoFactor && (
                <span className="ml-2 animate-spin h-4 w-4" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}