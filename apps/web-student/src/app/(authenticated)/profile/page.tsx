'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Avatar, Switch, Separator, Badge } from '@edutech/ui';
import { Mail, Settings, Shield, LogOut, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '@edutech/shared-components';
import { usersService } from '@edutech/api-client';
import { useNotifications } from '@/hooks/useNotifications';

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
  
  // Load user profile on mount
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
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
                    disabled={!isEditing}
                  />
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
                defaultChecked 
                onChange={(checked) => {
                  // TODO: Implement notification preferences update
                  console.log('Email notifications:', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Assignment Reminders</div>
                <div className="text-sm text-muted-foreground">Get notified before due dates</div>
              </div>
              <Switch 
                defaultChecked 
                onChange={(checked) => {
                  // TODO: Implement notification preferences update
                  console.log('Assignment reminders:', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Live Class Alerts</div>
                <div className="text-sm text-muted-foreground">Be notified when classes start</div>
              </div>
              <Switch 
                defaultChecked 
                onChange={(checked) => {
                  // TODO: Implement notification preferences update
                  console.log('Live class alerts:', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-muted-foreground">Receive course recommendations</div>
              </div>
              <Switch 
                defaultChecked 
                onChange={(checked) => {
                  // TODO: Implement notification preferences update
                  console.log('Marketing emails:', checked);
                }}
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
            <Button variant="outline" className="w-full justify-start gap-2">
              <Mail className="h-4 w-4" />
              Change Password
              {/* TODO: Connect to actual change password functionality */}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" />
              Two-Factor Authentication
              <Badge variant="secondary" className="ml-auto">
                {/* TODO: Check actual 2FA status */}
                Disabled
              </Badge>
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