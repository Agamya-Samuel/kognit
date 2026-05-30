'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, 
  Button, Input, Label, Avatar, Switch, Separator, Badge,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from '@edutech/ui';
import { Mail, Settings, Shield, LogOut, Save, AlertTriangle, Trash2, Key } from 'lucide-react';
import { useAuth } from '@edutech/shared-components';
import { usersService } from '@edutech/api-client';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationsService } from '@edutech/api-client';
import { authService } from '@edutech/api-client';
import { z } from 'zod';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    institution: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({ isRead: false });
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    liveClassAlerts: true,
    marketingEmails: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  
  // 2FA state
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState<string>('');
  const [isLoadingTwoFactor, setIsLoadingTwoFactor] = useState(false);
  
  // Change password state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<boolean>(false);
  
  // Validation schema for change password
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Load user profile on mount
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadNotificationPreferences();
      loadTwoFactorStatus();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      // Keep default values
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      setIsLoadingTwoFactor(true);
      // Check if 2FA is enabled by trying to get QR code (will fail if not enabled)
      // In a real app, you might have a specific endpoint to check 2FA status
      // For now, we'll assume it's disabled by default and enable it if user wants
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
      setIsLoading(true);
      await usersService.updateProfile(formData);
      setIsEditing(false);
      // Optionally show success message
    } catch (err) {
      setError('Failed to save profile');
      console.error('Profile save error:', err);
    } finally {
      setIsLoading(false);
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
      // Revert the change on failure
      setNotificationPreferences(prev => ({
        ...prev,
        [prefKey]: !checked,
      }));
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleChangePasswordOpen = () => {
    // Reset form when opening
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setChangePasswordError(null);
    setChangePasswordSuccess(false);
    setIsChangePasswordOpen(true);
  };

  const handleChangePasswordClose = () => {
    setIsChangePasswordOpen(false);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = changePasswordSchema.safeParse(changePasswordForm);
    if (!result.success) {
      // Find the first error and set it
      const firstError = result.error.errors[0];
      setChangePasswordError(firstError.message);
      return;
    }
    
    try {
      setIsChangePasswordLoading(true);
      setChangePasswordError(null);
      setChangePasswordSuccess(false);
      
      await authService.changePassword(
        changePasswordForm.currentPassword,
        changePasswordForm.newPassword
      );
      
      // Success
      setChangePasswordSuccess(true);
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setIsChangePasswordOpen(false);
      }, 1500);
    } catch (err: any) {
      // Handle error response from API
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to change password';
      setChangePasswordError(errorMessage);
    } finally {
      setIsChangePasswordLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      setIsLoadingTwoFactor(true);
      if (isTwoFactorEnabled) {
        // Disable 2FA
        await authService.disableTwoFactor(''); // In real app, you'd need to verify with a token
        setIsTwoFactorEnabled(false);
      } else {
        // Enable 2FA
        const { secret, qrCode } = await authService.enableTwoFactor();
        setTwoFactorSecret(secret);
        setTwoFactorQrCode(qrCode);
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
   
  if (isLoading || !user) {
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
                onChange={(checked) => handleNotificationPreferenceChange('emailNotifications', checked)}
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
                onChange={(checked) => handleNotificationPreferenceChange('assignmentReminders', checked)}
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
                onChange={(checked) => handleNotificationPreferenceChange('liveClassAlerts', checked)}
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
                onChange={(checked) => handleNotificationPreferenceChange('marketingEmails', checked)}
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
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleChangePasswordOpen}>
              <Key className="h-4 w-4" />
              Change Password
            </Button>
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
      </div>
    );
  }

  // Change Password Dialog
  if (isChangePasswordOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Dialog>
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent className="w-full max-w-md sm:max-w-lg px-4 py-6 sm:p-6">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and a new password to update your account security.
              </DialogDescription>
            </DialogHeader>
            {changePasswordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700">
                Password changed successfully! You will be logged out and need to sign in again.
              </div>
            )}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => 
                    setChangePasswordForm({
                      ...changePasswordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  disabled={isChangePasswordLoading}
                  placeholder="Enter your current password"
                  required
                />
                {changePasswordError && !isChangePasswordLoading && (
                  <p className="mt-2 text-sm text-red-600">{changePasswordError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => 
                    setChangePasswordForm({
                      ...changePasswordForm,
                      newPassword: e.target.value,
                    })
                  }
                  disabled={isChangePasswordLoading}
                  placeholder="Enter new password (minimum 8 characters)"
                  required
                />
                {changePasswordError && !isChangePasswordLoading && (
                  <p className="mt-2 text-sm text-red-600">{changePasswordError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => 
                    setChangePasswordForm({
                      ...changePasswordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={isChangePasswordLoading}
                  placeholder="Confirm your new password"
                  required
                />
                {changePasswordError && !isChangePasswordLoading && (
                  <p className="mt-2 text-sm text-red-600">{changePasswordError}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleChangePasswordClose}
                  disabled={isChangePasswordLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isChangePasswordLoading}
                  className="ml-2"
                >
                  {isChangePasswordLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}