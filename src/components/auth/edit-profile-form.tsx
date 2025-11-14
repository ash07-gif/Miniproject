'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/firestore';
import { LoadingSpinner } from '../shared/loading-spinner';
import type { UserProfile } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';

const formSchema = z.object({
  username: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(1, { message: 'Please enter a valid age.' }).optional(),
});

interface EditProfileFormProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    userProfile: UserProfile;
    onProfileUpdate: () => void;
}

export function EditProfileForm({ isOpen, setIsOpen, userProfile, onProfileUpdate }: EditProfileFormProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: userProfile.username,
      age: userProfile.age,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userProfile) return;
    setIsLoading(true);

    try {
        const profileDataToUpdate: Partial<UserProfile> = {
          username: values.username,
          age: values.age || undefined
        };

        // Update Firestore profile
        updateUserProfile(userProfile.id, profileDataToUpdate);

        // Also update Firebase Auth display name if it has changed
        if (auth.currentUser && auth.currentUser.displayName !== values.username) {
            await updateProfile(auth.currentUser, { displayName: values.username });
        }

        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved.',
        });
        onProfileUpdate(); // Re-fetch profile data on parent
        setIsOpen(false);

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message,
        });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Your Age" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
