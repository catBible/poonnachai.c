
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthCard } from '@/components/auth/AuthCard';

export default function SignUpPage() {
  return (
    <AuthCard title="Create Account" description="Join Poonnachai.c Notes today!">
      <SignUpForm />
    </AuthCard>
  );
}
