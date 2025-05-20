
import { NoteForm } from '@/components/notes/NoteForm';

export default function CreateNotePage() {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Create New Note</h1>
      <NoteForm />
    </div>
  );
}
