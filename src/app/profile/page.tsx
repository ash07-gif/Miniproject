'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/hooks/use-auth';
import { updateUserPreferences } from '@/lib/firestore';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function ProfilePage() {
  const { user, userProfile, loading } = useRequireAuth();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setPreferences(userProfile.preferences);
    }
  }, [userProfile]);

  const handlePreferenceChange = (category: string) => {
    setPreferences(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserPreferences(user.uid, preferences);
      toast({
        title: 'Success!',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save preferences.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 font-headline">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>My Information</CardTitle>
          <CardDescription>View and manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{userProfile.displayName}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{userProfile.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>News Preferences</CardTitle>
          <CardDescription>Select the categories you're interested in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={preferences.includes(category)}
                  onCheckedChange={() => handlePreferenceChange(category)}
                />
                <label
                  htmlFor={category}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="mt-6">
            {isSaving ? <LoadingSpinner /> : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
