
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, Mail, KeyRound, LogIn, UserCog } from 'lucide-react';

// Schema now only requires a non-empty string for usernameOrEmail.
// Specific email format validation will happen in the onSubmit handler.
const signInSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Username or Email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const DEFAULT_EMAIL_DOMAIN = "example.com"; // Consistent with SignUpForm

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setLoading(true);
    let emailToLogin = data.usernameOrEmail;

    if (!emailToLogin.includes('@')) {
      emailToLogin = `${emailToLogin}@${DEFAULT_EMAIL_DOMAIN}`;
    }

    // Validate if the constructed string is a valid email
    const emailValidation = z.string().email().safeParse(emailToLogin);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email Format",
        description: `"${emailToLogin}" is not a valid email address.`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailToLogin, data.password);
      toast({ title: "Signed in successfully!" });
      // Redirect is handled by AuthLayout/HomePage
    } catch (error: any) {
      let errorMessage = error.message || "An unknown error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Invalid username/email or password. Please try again."
      }
      toast({
        title: "Sign-in failed",
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

  const handleAdminLogin = async () => {
    setLoading(true);
    const adminUsername = 'admin'; // Use username here
    const adminEmail = `${adminUsername}@${DEFAULT_EMAIL_DOMAIN}`;
    const adminPassword = 'p123456';
    
    toast({
      title: "Dev Admin Login",
      description: `Attempting to sign in as ${adminEmail}. Ensure this user exists in your Firebase project with the password '${adminPassword}'.`,
      duration: 7000,
    });

    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      toast({ title: "Signed in as Admin successfully!" });
    } catch (error: any) {
      toast({
        title: "Admin Sign-in failed",
        description: `${error.message || "Could not sign in as admin."} Please ensure the user ${adminEmail} with password '${adminPassword}' is created in Firebase Authentication.`,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="usernameOrEmail">Username or Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="usernameOrEmail" 
            type="text" 
            placeholder="your_username or your@email.com" 
            {...register("usernameOrEmail")} 
            className="pl-10" 
          />
        </div>
        {errors.usernameOrEmail && <p className="text-sm text-destructive">{errors.usernameOrEmail.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
         <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} className="pl-10" />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || googleLoading}>
        {loading && !googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" /> }
        Sign In
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
        onClick={handleAdminLogin}
        disabled={loading || googleLoading}
      >
        {loading && !googleLoading && !googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCog className="mr-2 h-4 w-4" />}
        Login as Admin (dev)
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>}
        Sign in with Google
      </Button>
       <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-accent hover:text-accent/90 underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

    