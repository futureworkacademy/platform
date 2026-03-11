import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
  className?: string;
  disabled?: boolean;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Enter your response...",
  minWords,
  maxWords,
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const plainText = editor.getText();
  const wordCount = countWords(plainText);
  const isUnderMinimum = minWords && wordCount < minWords;
  const isOverMaximum = maxWords && wordCount > maxWords;

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8", editor.isActive('bold') && "bg-muted")}
          disabled={disabled}
          aria-label="Bold"
          data-testid="button-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8", editor.isActive('italic') && "bg-muted")}
          disabled={disabled}
          aria-label="Italic"
          data-testid="button-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-muted")}
          disabled={disabled}
          aria-label="Bullet list"
          data-testid="button-bullet-list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-muted")}
          disabled={disabled}
          aria-label="Ordered list"
          data-testid="button-ordered-list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          className="h-8 w-8"
          aria-label="Undo"
          data-testid="button-undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          className="h-8 w-8"
          aria-label="Redo"
          data-testid="button-redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs">
        <div className={cn(
          "font-medium",
          isUnderMinimum && "text-amber-600",
          isOverMaximum && "text-destructive",
          !isUnderMinimum && !isOverMaximum && "text-muted-foreground"
        )}>
          {wordCount} words
          {minWords && (
            <span className="text-muted-foreground">
              {" "}(minimum: {minWords})
            </span>
          )}
          {maxWords && (
            <span className="text-muted-foreground">
              {" "}(maximum: {maxWords})
            </span>
          )}
        </div>
        {isUnderMinimum && (
          <span className="text-amber-600">
            {minWords - wordCount} more words needed
          </span>
        )}
        {isOverMaximum && (
          <span className="text-destructive">
            {wordCount - maxWords} words over limit
          </span>
        )}
      </div>
    </div>
  );
}
