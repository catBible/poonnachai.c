
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { getNotes, deleteNote } from '@/lib/firebase/firestore';
import type { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/notes/NoteCard';
import { PlusCircle, Loader2, FileText, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userNotes = await getNotes(user.uid);
      setNotes(userNotes);
    } catch (error) {
      console.error("Error fetching notes: ", error);
      toast({ title: "Error", description: "Could not fetch notes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      toast({ title: "Note deleted", description: "Your note has been successfully deleted." });
    } catch (error) {
      console.error("Error deleting note: ", error);
      toast({ title: "Error", description: "Could not delete note.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-foreground">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Notes</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Link href="/notes/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Note
          </Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-card p-8">
          <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No notes yet!</h2>
          <p className="text-muted-foreground mb-6">
            It looks like you haven&apos;t created any notes. Get started by creating your first one.
          </p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/notes/create">
              <FileText className="mr-2 h-5 w-5" /> Create First Note
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </div>
      )}
    </div>
  );
}
