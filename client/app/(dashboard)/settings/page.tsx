'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, useToast } from '@/components/ui';

import { Loader2, Save, CheckCircle2, User, Mail, Phone, MessageCircle } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState({
    username: '',
    email: '',
    whatsapp: '',
    telegramUsername: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch('/me');
        setUser({
          username: data.username || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          telegramUsername: data.telegramUsername || '',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load user profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/me', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      setSaved(true);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <Card className="border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-border/50 bg-muted/5">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            User Profile
          </CardTitle>
          <CardDescription>Update your contact information and public identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    placeholder="Your username"
                    className="pl-9 bg-background border-border focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="your@email.com"
                    className="pl-9 bg-background border-border focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-foreground font-medium">
                  WhatsApp Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    value={user.whatsapp}
                    onChange={(e) => setUser({ ...user, whatsapp: e.target.value })}
                    placeholder="+1234567890"
                    className="pl-9 bg-background border-border focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-foreground font-medium">
                  Telegram Username
                </Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telegram"
                    value={user.telegramUsername}
                    onChange={(e) => setUser({ ...user, telegramUsername: e.target.value })}
                    placeholder="username"
                    className="pl-9 bg-background border-border focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your Telegram username without the @ symbol
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/50 pt-6 bg-muted/5">
          <Button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="rounded-full px-8 shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:opacity-90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border/50 shadow-sm bg-muted/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive alerts and summaries. (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Telegram Alerts</p>
              <p className="text-xs text-muted-foreground">Get instant trade execution notifications.</p>
            </div>
            <div className="w-11 h-6 bg-muted rounded-full relative cursor-not-allowed opacity-50">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Daily Summaries</p>
              <p className="text-xs text-muted-foreground">Receive daily performance reports.</p>
            </div>
            <div className="w-11 h-6 bg-muted rounded-full relative cursor-not-allowed opacity-50">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Get important updates via email.</p>
            </div>
            <div className="w-11 h-6 bg-muted rounded-full relative cursor-not-allowed opacity-50">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}