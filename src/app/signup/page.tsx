import { SignupForm } from '@/components/auth/signup-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function SignupPage() {
    const bgImage = PlaceHolderImages.find(img => img.id === 'auth-background');
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="hidden bg-muted lg:block">
      {bgImage && (
             <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                data-ai-hint={bgImage.imageHint}
                width="1920"
                height="1080"
                className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
        )}
      </div>
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to create your NewsFlash account
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
