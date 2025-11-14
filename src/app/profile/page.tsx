'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { updateUserPreferences } from '@/lib/firestore';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { UserProfile } from '@/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, isUserLoading } = useRequireAuth();
  const firestore = useFirestore();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

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

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const lastLogin = user?.metadata.lastSignInTime 
    ? format(new Date(user.metadata.lastSignInTime), "PPpp")
    : 'N/A';

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 font-headline">Profile</h1>
      {userProfile && user ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>My Information</CardTitle>
              <CardDescription>View and manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{userProfile.username}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{userProfile.email}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p>{lastLogin}</p>
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
        </>
      ) : (
        <div className="text-center text-muted-foreground mt-12">
            <p>Could not load your profile.</p>
        </div>
      )}
    </div>
  );
}
