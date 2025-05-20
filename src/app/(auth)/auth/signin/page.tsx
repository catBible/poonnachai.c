
import { SignInForm } from '@/components/auth/SignInForm';
import { AuthCard } from '@/components/auth/AuthCard';

export default function SignInPage() {
  return (
    <AuthCard title="Welcome Back!" description="Sign in to access your notes.">
      <SignInForm />
    </AuthCard>
  );
}
