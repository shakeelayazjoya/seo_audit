'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Extension } from '@tiptap/core';
import { EditorContent, type Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  RemoveFormatting,
  Save,
  Send,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface BlogFormInitialData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string | null;
  categories?: string[];
  tags?: string[];
  metaDescription?: string | null;
  status?: string;
}

const LINE_HEIGHT_OPTIONS = [
  { label: 'Default', value: 'normal' },
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
  { label: '4.0', value: '4' },
  { label: '5.0', value: '5' },
];

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['heading', 'paragraph'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types as string[],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: { lineHeight?: string | null }) => {
              if (!attributes.lineHeight || attributes.lineHeight === 'normal') return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }: { commands: { updateAttributes: (type: string, attrs: Record<string, unknown>) => boolean } }) => {
          return (this.options.types as string[]).some((type) =>
            commands.updateAttributes(type, { lineHeight }),
          );
        },
    } as Record<string, unknown>;
  },
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ToolbarButton({
  editor,
  label,
  icon,
  onClick,
  active,
  disabled,
}: {
  editor: Editor;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      disabled={disabled || !editor.isEditable}
      aria-label={label}
      title={label}
      className="size-8"
    >
      {icon}
    </Button>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-orange-600 underline underline-offset-4',
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'my-6 rounded-xl border object-cover',
          loading: 'lazy',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Write the full article here. Use headings, lists, quotes, links, images, and developer-friendly formatting...',
      }),
      Typography,
      LineHeight,
      Highlight.configure({ multicolor: false }),
      TaskList.configure({
        HTMLAttributes: { class: 'not-prose my-4 space-y-2' },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: 'flex gap-2' },
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[360px] rounded-b-xl border-x border-b bg-background px-5 py-4 outline-none prose-headings:font-semibold prose-a:text-orange-600 dark:prose-invert',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border bg-muted/20 text-sm text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', previousUrl ?? 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const setImage = () => {
    const url = window.prompt('Paste image URL');
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim(), alt: 'Blog image' }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border bg-muted/30 p-2">
        <ToolbarButton editor={editor} label="Heading 1" icon={<Heading1 className="size-4" />} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarButton editor={editor} label="Heading 2" icon={<Heading2 className="size-4" />} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton editor={editor} label="Heading 3" icon={<Heading3 className="size-4" />} active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton editor={editor} label="Bold" icon={<Bold className="size-4" />} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton editor={editor} label="Italic" icon={<Italic className="size-4" />} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton editor={editor} label="Underline" icon={<UnderlineIcon className="size-4" />} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton editor={editor} label="Highlight" icon={<Highlighter className="size-4" />} active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
        <ToolbarButton editor={editor} label="Inline code" icon={<Code2 className="size-4" />} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton editor={editor} label="Bullet list" icon={<List className="size-4" />} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton editor={editor} label="Numbered list" icon={<ListOrdered className="size-4" />} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton editor={editor} label="Task list" icon={<ListChecks className="size-4" />} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarButton editor={editor} label="Quote" icon={<Quote className="size-4" />} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton editor={editor} label="Align left" icon={<AlignLeft className="size-4" />} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarButton editor={editor} label="Align center" icon={<AlignCenter className="size-4" />} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarButton editor={editor} label="Align right" icon={<AlignRight className="size-4" />} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton editor={editor} label="Add link" icon={<LinkIcon className="size-4" />} active={editor.isActive('link')} onClick={setLink} />
        <ToolbarButton editor={editor} label="Remove link" icon={<Unlink className="size-4" />} disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()} />
        <ToolbarButton editor={editor} label="Insert image URL" icon={<ImagePlus className="size-4" />} onClick={setImage} />
        <span className="mx-1 h-6 w-px bg-border" />
        <select
          title="Line height"
          className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
          value={(
            editor.getAttributes('heading').lineHeight ||
            editor.getAttributes('paragraph').lineHeight ||
            'normal'
          ) as string}
          onChange={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor.chain().focus() as any).setLineHeight(e.target.value).run();
          }}
        >
          {LINE_HEIGHT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ToolbarButton editor={editor} label="Clear formatting" icon={<RemoveFormatting className="size-4" />} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
        <ToolbarButton editor={editor} label="Undo" icon={<Undo2 className="size-4" />} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton editor={editor} label="Redo" icon={<Redo2 className="size-4" />} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} />
      <div className="rounded-b-xl border-x border-b bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        Supports SEO-friendly HTML, links, headings, images, quotes, code, task lists, and typography cleanup.
      </div>
    </div>
  );
}

export function BlogForm({ initialData }: { initialData?: BlogFormInitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [categories, setCategories] = useState((initialData?.categories ?? []).join(', '));
  const [tags, setTags] = useState((initialData?.tags ?? []).join(', '));
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status === 'published' ? 'published' : 'draft');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.coverImageUrl ?? '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData?.id);
  const canSubmit = title.trim() && excerpt.trim() && content.trim().length >= 20;
  const metaCount = metaDescription.length;

  const imagePreview = useMemo(() => {
    if (!image) return previewUrl;
    return URL.createObjectURL(image);
  }, [image, previewUrl]);

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setImage(file);
    setError('');
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published' = status) => {
    setError('');
    setSuccess('');
    if (!canSubmit) {
      setError('Title, short description, and at least 20 characters of content are required.');
      return;
    }

    const formData = new FormData();
    formData.set('title', title);
    formData.set('slug', slug || slugify(title));
    formData.set('excerpt', excerpt);
    formData.set('content', content);
    formData.set('categories', categories);
    formData.set('tags', tags);
    formData.set('metaDescription', metaDescription);
    formData.set('status', submitStatus);
    if (image) formData.set('image', image);

    setLoading(true);
    try {
      const endpoint = isEditing ? `/api/admin/blogs/${initialData?.id}` : '/api/admin/blogs';
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save blog post.');

      setSuccess(isEditing ? 'Blog updated successfully.' : 'Blog added successfully.');
      setTimeout(() => router.push('/admin/blogs'), 700);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save blog post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Blog' : 'Add Blog'}</h2>
              <p className="text-sm text-muted-foreground">Create clean, SEO-ready blog content.</p>
            </div>
            <Badge variant={status === 'published' ? 'default' : 'secondary'}>
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Blog Title</Label>
              <Input
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  if (!slugTouched) setSlug(slugify(nextTitle));
                }}
                placeholder="Technical SEO checklist for 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="technical-seo-checklist"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Short Description</Label>
            <Textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="min-h-20" placeholder="A short blog summary for cards and previews." />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Rich Text Editor</Label>
              <Badge variant="secondary">Powered by Tiptap</Badge>
            </div>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Cover Image</h3>
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleImageFile(event.dataTransfer.files.item(0));
              }}
              className="mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center transition hover:border-primary"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Blog cover preview" className="h-44 w-full rounded-md object-cover" />
              ) : (
                <>
                  <ImagePlus className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Drag image here or click to upload</p>
                  <p className="text-xs text-muted-foreground">Uploaded to Cloudinary</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageFile(event.target.files?.item(0) ?? null)} />
            </label>
            {imagePreview && (
              <Button type="button" variant="ghost" size="sm" className="mt-2 gap-2" onClick={() => { setImage(null); setPreviewUrl(''); }}>
                <X className="size-4" />
                Remove preview
              </Button>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">SEO & Organization</h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <Input value={categories} onChange={(event) => setCategories(event.target.value)} placeholder="Technical SEO, Performance" />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="crawl, schema, speed" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Meta Description</Label>
                  <span className={`text-xs ${metaCount > 180 ? 'text-destructive' : 'text-muted-foreground'}`}>{metaCount}/180</span>
                </div>
                <Textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} className="min-h-24" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={loading || !canSubmit} onClick={() => handleSubmit('draft')} className="flex-1 gap-2">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Draft
                </Button>
                <Button type="button" disabled={loading || !canSubmit} onClick={() => handleSubmit('published')} className="flex-1 gap-2">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Publish
                </Button>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-3 shadow-lg backdrop-blur lg:left-80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            {!error && !success && <p className="text-sm text-muted-foreground">Required: title, description, and rich text content.</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/blogs')}>Cancel</Button>
            <Button type="button" variant="outline" disabled={loading || !canSubmit} onClick={() => handleSubmit('draft')} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Draft
            </Button>
            <Button type="button" disabled={loading || !canSubmit} onClick={() => handleSubmit('published')} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
