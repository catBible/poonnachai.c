
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { addNote, updateNote, getNote } from '@/lib/firebase/firestore';
import type { Note, NoteData } from '@/types/note';
import { generateNoteTags } from '@/ai/flows/generate-note-tags';
import { Loader2, Save, Wand2, Tag, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const noteSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title too long" }),
  content: z.string().min(1, { message: "Content cannot be empty" }),
  tags: z.array(z.string()).optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  noteId?: string; // For editing existing note
}

export function NoteForm({ noteId }: NoteFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const isLoading = isSubmitting || isGeneratingTags || isPending;


  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  const noteContent = watch('content');

  useEffect(() => {
    if (noteId) {
      startTransition(async () => {
        const existingNote = await getNote(noteId);
        if (existingNote && existingNote.userId === user?.uid) {
          reset({
            title: existingNote.title,
            content: existingNote.content,
            tags: existingNote.tags || [],
          });
          setCurrentTags(existingNote.tags || []);
        } else if (existingNote) {
          toast({ title: "Error", description: "You don't have permission to edit this note.", variant: "destructive" });
          router.push('/dashboard');
        } else {
          toast({ title: "Error", description: "Note not found.", variant: "destructive" });
          router.push('/dashboard');
        }
      });
    }
  }, [noteId, user, reset, toast, router]);

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !currentTags.includes(tagInput.trim())) {
      const newTags = [...currentTags, tagInput.trim()];
      setCurrentTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(newTags);
    setValue('tags', newTags);
  };

  const handleGenerateTags = async () => {
    if (!noteContent || noteContent.trim().length < 20) {
      toast({ title: "Content too short", description: "Please write at least 20 characters to generate tags.", variant: "default" });
      return;
    }
    setIsGeneratingTags(true);
    try {
      const result = await generateNoteTags({ noteContent });
      if (result.tags && result.tags.length > 0) {
        const uniqueNewTags = result.tags.filter(tag => !currentTags.includes(tag));
        const updatedTags = [...currentTags, ...uniqueNewTags];
        setCurrentTags(updatedTags);
        setValue('tags', updatedTags);
        toast({ title: "Tags generated!", description: `${result.tags.length} tags were suggested.` });
      } else {
        toast({ title: "No tags generated", description: "AI couldn't suggest tags for this content." });
      }
    } catch (error) {
      console.error("Error generating tags:", error);
      toast({ title: "Tag generation failed", description: "Could not generate tags at this time.", variant: "destructive" });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const onSubmit: SubmitHandler<NoteFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be signed in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const noteData: NoteData = {
      userId: user.uid,
      title: data.title,
      content: data.content,
      tags: currentTags,
    };

    try {
      if (noteId) {
        await updateNote(noteId, noteData);
        toast({ title: "Note updated successfully!" });
      } else {
        await addNote(user.uid, noteData);
        toast({ title: "Note created successfully!" });
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: noteId ? "Failed to update note" : "Failed to create note",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg">Title</Label>
        <Input id="title" placeholder="My Awesome Note Title" {...register("title")} className="text-lg p-3" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-lg">Content</Label>
        <Textarea
          id="content"
          placeholder="Start writing your note here..."
          {...register("content")}
          className="min-h-[300px] text-base p-3"
          rows={15}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-grow space-y-2">
            <Label htmlFor="tags" className="text-lg flex items-center">
              <Tag className="mr-2 h-5 w-5 text-accent"/> Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag (e.g., work, personal)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                className="flex-grow"
              />
              <Button type="button" variant="outline" onClick={handleAddTag} disabled={isLoading}>Add Tag</Button>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGenerateTags}
            disabled={isLoading || !noteContent || noteContent.trim().length < 20}
            variant="outline"
            className="w-full sm:w-auto text-accent border-accent hover:bg-accent/10"
          >
            {isGeneratingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate with AI
          </Button>
        </div>
        {currentTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md min-h-[40px]">
            {currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-sm py-1 px-2 bg-secondary text-secondary-foreground">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {noteId ? 'Save Changes' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}
