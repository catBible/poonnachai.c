
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, UserPlus, Mail, KeyRound, UserCircle } from 'lucide-react';

const signUpSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(20, {message: "Username must be 20 characters or less"}).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const DEFAULT_EMAIL_DOMAIN = "example.com";

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setLoading(true);
    const email = `${data.username}@${DEFAULT_EMAIL_DOMAIN}`;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
      await updateProfile(userCredential.user, { displayName: data.username });
      toast({ title: "Account created successfully!", description: `Your email is ${email}. Please sign in.` });
      // Redirect is handled by AuthLayout/HomePage after state change
    } catch (error: any) {
      let errorMessage = error.message || "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = `The username "${data.username}" (email: ${email}) is already taken. Please choose a different username.`;
      }
      toast({
        title: "Sign-up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in with Google successfully!" });
    } catch (error: any) {
      toast({
        title: "Google Sign-in failed",
        description: error.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="username" 
            type="text" 
            placeholder="Choose a username" 
            {...register("username")} 
            className="pl-10" 
          />
        </div>
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
        <p className="text-xs text-muted-foreground pl-1">Your email will be username@{DEFAULT_EMAIL_DOMAIN}</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} className="pl-10" />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} className="pl-10" />
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || googleLoading}>
        {loading && !googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
        Sign Up
      </Button>
       <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
         <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
        }
        Sign up with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-medium text-accent hover:text-accent/90 underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}

    