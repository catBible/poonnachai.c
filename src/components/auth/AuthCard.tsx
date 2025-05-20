
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotebookPen } from 'lucide-react';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md shadow-2xl bg-card border-border">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
            <NotebookPen className="h-12 w-12 text-accent" />
        </div>
        <CardTitle className="text-3xl font-bold text-foreground">{title}</CardTitle>
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
