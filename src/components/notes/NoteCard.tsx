
"use client";

import type { Note } from '@/types/note';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FilePenLine, Trash2, Tag } from 'lucide-react';
import { formatDate } from '@/lib/firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const MAX_CONTENT_LENGTH = 100;
  const truncatedContent = note.content.length > MAX_CONTENT_LENGTH
    ? note.content.substring(0, MAX_CONTENT_LENGTH) + "..."
    : note.content;

  return (
    <Card className="flex flex-col h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl text-foreground break-words">{note.title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Last updated: {formatDate(note.updatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 break-words whitespace-pre-wrap">{truncatedContent}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Tag className="h-4 w-4 text-accent" />
            {note.tags.slice(0, 5).map(tag => (
              <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground text-xs">{tag}</Badge>
            ))}
            {note.tags.length > 5 && <Badge variant="outline" className="text-xs">+{note.tags.length - 5} more</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your note titled "{note.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
          <Link href={`/notes/${note.id}/edit`}>
            <FilePenLine className="h-4 w-4 mr-1" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
