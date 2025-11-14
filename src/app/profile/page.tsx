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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { LogOut, Edit } from 'lucide-react';
import { EditProfileForm } from '@/components/auth/edit-profile-form';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function ProfilePage() {
  const { user, isUserLoading } = useRequireAuth();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useDoc<UserProfile>(userProfileRef);

  const [preferences, setPreferences] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setPreferences(userProfile.preferences || []);
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
      updateUserPreferences(user.uid, preferences);
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

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // onProfileUpdate is no longer needed from the form, as useDoc handles updates.
  const handleProfileUpdate = () => {
    // The useDoc hook will automatically refresh the data.
    // We can keep this function for potential future logic if needed.
  };

  if (isUserLoading || isLoadingProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Profile</h1>
        <ThemeToggle />
      </div>
      {userProfile && user ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>My Information</CardTitle>
                  <CardDescription>View and manage your account details.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5">
                  <p className="font-semibold">{userProfile.username}</p>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                   {userProfile.age && <p className="text-sm text-muted-foreground">Age: {userProfile.age}</p>}
                </div>
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
                {isSaving ? <LoadingSpinner /> : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Button variant="destructive" onClick={handleLogout} className="mt-8 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>

          <EditProfileForm 
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />

        </>
      ) : (
        <div className="text-center text-muted-foreground mt-12">
            <p>Could not load your profile. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
