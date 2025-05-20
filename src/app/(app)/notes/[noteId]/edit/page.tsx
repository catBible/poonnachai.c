
import { NoteForm } from '@/components/notes/NoteForm';

interface EditNotePageProps {
  params: {
    noteId: string;
  };
}

export default function EditNotePage({ params }: EditNotePageProps) {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Edit Note</h1>
      <NoteForm noteId={params.noteId} />
    </div>
  );
}
