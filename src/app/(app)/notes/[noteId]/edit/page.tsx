// src/app/(app)/notes/[noteId]/edit/page.tsx
import { NoteForm } from '@/components/notes/NoteForm';

interface EditNotePageProps {
  params: {
    noteId: string; // 'noteId' must match the folder name [noteId]
  };
}

export default function EditNotePage({ params }: EditNotePageProps) {
  const { noteId } = params;

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Edit Note</h1>
      <NoteForm noteId={noteId} />
    </div>
  );
}
