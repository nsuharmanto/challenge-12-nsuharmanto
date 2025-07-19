'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as Label from '@radix-ui/react-label';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';
import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { DoubleStrike } from '@/extensions/DoubleStrike';
import { getAvatarUrl } from '@/helpers/avatar';
import Footer from '@/components/layout/Footer';
import Loading from '@/app/loading';


function ToastMessage({ open, setOpen, title, description, variant = 'success' }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  title: string;
  description?: string;
  variant?: 'success' | 'error';
}) {
  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        className={`
          absolute left-1/2 top-0 -translate-x-1/2 mt-2
          z-50 min-w-[260px] max-w-xs rounded-lg shadow-lg px-5 py-4
          ${variant === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        `}
        style={{ pointerEvents: 'auto' }}
      >
        <Toast.Title className="font-bold text-base">{title}</Toast.Title>
        {description && <Toast.Description className="text-sm mt-1">{description}</Toast.Description>}
        </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

function EditPostHeader({
  toastOpen,
  setToastOpen,
  toastTitle,
  toastDesc,
  toastVariant,
}: {
  toastOpen: boolean;
  setToastOpen: (v: boolean) => void;
  toastTitle: string;
  toastDesc: string;
  toastVariant: 'success' | 'error';
}) {
  const [user, setUser] = useState<{ name: string; avatarUrl: string }>({ name: '', avatarUrl: '' });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser({
        name: parsed.name,
        avatarUrl: parsed.avatarUrl || '',
      });
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser({
            name: parsed.name,
            avatarUrl: parsed.avatarUrl || '',
          });
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <header className="fixed w-full left-0 top-0 flex items-center justify-between px-30 py-5 border-b border-neutral-300 bg-white z-30">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center" aria-label="Back to Home">
          <svg width="24" height="24" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span className="text-xl font-semibold text-neutral-900 ml-2">Edit Post</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={
              imgError
                ? '/default-profile.jpg'
                : getAvatarUrl(user.avatarUrl)
            }
            alt={user.name || 'User'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        <span className="text-base font-medium text-neutral-900">{user.name}</span>
      </div>
      
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <ToastMessage
          open={toastOpen}
          setOpen={setToastOpen}
          title={toastTitle}
          description={toastDesc}
          variant={toastVariant}
        />
      </div>
    </header>
  );
}

interface EditPostProps {
  postId: string;
}

export default function EditPost({ postId }: EditPostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastDesc, setToastDesc] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true); // Mulai loading
      const token = localStorage.getItem('token');
      const res = await fetch(`https://blogger-wph-api-production.up.railway.app/posts/${postId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || '');
        setInitialContent(data.content || '');
        setContent(data.content || '');
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setCoverPreview(data.imageUrl || null);
      }
      setLoading(false); 
    }
    fetchPost();
  }, [postId]);
  
  const editor = useEditor({
  extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] }),
      HorizontalRule,
      DoubleStrike,
    ],
    content: initialContent ?? '',
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[160px] outline-none bg-white px-0 py-0 text-[15px] font-normal',
      },
    },
    autofocus: false,
    immediatelyRender: false,
  });
  
  useEffect(() => {
    if (editor && initialContent !== null) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);
  
  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverImage(file || null);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content || content === '<p></p>' || content === '') newErrors.content = 'Content is required';
    if (!coverPreview) newErrors.coverImage = 'Cover image is required';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    tags.forEach(tag => formData.append('tags', tag));
    if (coverImage) {
      formData.append('image', coverImage);
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://blogger-wph-api-production.up.railway.app/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        let msg = 'Failed to update';
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        setToastTitle('Failed to update');
        setToastDesc(msg);
        setToastVariant('error');
        setToastOpen(true);
        return;
      }

      setToastTitle('Post updated successfully!');
      setToastDesc('');
      setToastVariant('success');
      setToastOpen(true);

      const updatedRes = await fetch(`https://blogger-wph-api-production.up.railway.app/posts/${postId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setTitle(updatedData.title || '');
        setContent(updatedData.content || '');
        setTags(Array.isArray(updatedData.tags) ? updatedData.tags : []);
        setCoverPreview(updatedData.imageUrl || null);
      }
    } catch (err) {
      setToastTitle('Failed to update post');
      setToastDesc((err as Error).message);
      setToastVariant('error');
      setToastOpen(true);
    }
  };

  const getHeadingValue = () => {
    if (editor?.isActive('heading', { level: 1 })) return 'h1';
    if (editor?.isActive('heading', { level: 2 })) return 'h2';
    if (editor?.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const toggleFullscreen = () => setFullscreen(f => !f);

  const openLinkModal = () => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes('link').href || '');
    setLinkModalOpen(true);
  };

  const handleLinkSave = () => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkModalOpen(false);
  };

  if (loading) {
    return (
      <>
        <EditPostHeader
          toastOpen={toastOpen}
          setToastOpen={setToastOpen}
          toastTitle={toastTitle}
          toastDesc={toastDesc}
          toastVariant={toastVariant}
        />
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
          <Footer />
        </div>
       </>
    );
  }

  return (
    <>
      <EditPostHeader
        toastOpen={toastOpen}
        setToastOpen={setToastOpen}
        toastTitle={toastTitle}
        toastDesc={toastDesc}
        toastVariant={toastVariant}
      />
      <main className="w-full max-w-[734px] mx-auto mt-32 bg-white p-0 font-sans">
        <form className="flex flex-col gap-8 p-0" onSubmit={handleSubmit}>
          
          <div className="flex flex-col gap-2">
            <Label.Root htmlFor="title" className="block font-semibold text-[15px] mb-0">
              Title
            </Label.Root>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full border border-[#D1D5DB] rounded-[8px] px-4 py-3 text-[15px] font-normal focus:ring-0 focus:outline-none ${errors.title ? 'border-red-400' : ''}`}
              placeholder="Enter your title"
              style={{ boxSizing: 'border-box' }}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          
          <div className="flex flex-col gap-2">
            <Label.Root htmlFor="content" className="block font-semibold text-[15px] mb-0">
              Content
            </Label.Root>
            <div
              className={`border border-[#D1D5DB] rounded-[8px] overflow-hidden ${errors.content ? 'border-red-400' : ''} ${
                fullscreen
                  ? 'fixed inset-0 z-50 bg-white flex flex-col h-screen'
                  : ''
              }`}
              style={fullscreen ? { top: 0, left: 0, right: 0, bottom: 0 } : {}}
            >
              {initialContent !== null && editor && (
                <>
                  
                  <div className="flex items-center gap-1 border-b border-[#E5E7EB] px-4 py-2 bg-white z-20 sticky top-0">
                    
                    <select
                      className="border border-[#D1D5DB] rounded-[6px] px-3 py-1 text-[15px] mr-2 focus:outline-none cursor-pointer"
                      value={getHeadingValue()}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'paragraph') {
                          editor.chain().focus().setParagraph().run();
                        } else if (val === 'h1') {
                          editor.chain().focus().toggleHeading({ level: 1 }).run();
                        } else if (val === 'h2') {
                          editor.chain().focus().toggleHeading({ level: 2 }).run();
                        } else if (val === 'h3') {
                          editor.chain().focus().toggleHeading({ level: 3 }).run();
                        }
                      }}
                    >
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="paragraph">Paragraph</option>
                    </select>
                    
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer`}
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/boldbtn.svg" alt="Bold" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Double Strikethrough"
                      onClick={() => {
                        if (!editor) return;
                        (
                          editor.chain() as unknown as {
                            focus: () => { toggleDoubleStrike: () => { run: () => void } };
                          }
                        )
                          .focus()
                          .toggleDoubleStrike()
                          .run();
                      }}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/doublestrikebtn.svg" alt="Double Strikethrough" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/italicbtn.svg" alt="Italic" width={24} height={24} className="w-6 h-6" />
                    </button>
                    <span className="border-l mx-1 h-6 border-[#E5E7EB]" />
                    
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/bulletbtn.svg" alt="Bullet List" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Ordered List"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/orderedbtn.svg" alt="Ordered List" width={24} height={24} className="w-6 h-6" />
                    </button>
                    <span className="border-l mx-1 h-6 border-[#E5E7EB]" />
                    
                    <button
                      type="button"
                      title="Align Left"
                      onClick={() => editor.chain().focus().setTextAlign('left').run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/leftbtn.svg" alt="Align Left" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Align Center"
                      onClick={() => editor.chain().focus().setTextAlign('center').run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/centerbtn.svg" alt="Align Center" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => editor.chain().focus().setTextAlign('right').run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/rightbtn.svg" alt="Align Right" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Align Justify"
                      onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/justifybtn.svg" alt="Align Justify" width={24} height={24} className="w-6 h-6" />
                    </button>
                    <span className="border-l mx-1 h-6 border-[#E5E7EB]" />
                    
                    <Dialog.Root open={linkModalOpen} onOpenChange={setLinkModalOpen}>
                      <Dialog.Trigger asChild>
                        <button
                          type="button"
                          title="Link"
                          className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                          style={{ borderRadius: 0, boxSizing: 'border-box' }}
                          onClick={openLinkModal}
                        >
                          <Image src="/linkbtn.svg" alt="Link" width={24} height={24} className="w-6 h-6" />
                        </button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[350px]">
                          <Dialog.Title className="font-semibold text-lg mb-2">Insert/Edit Link</Dialog.Title>
                          <input
                            type="url"
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            placeholder="https://your-link.com"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-gray-500"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                              onClick={() => setLinkModalOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                              onClick={handleLinkSave}
                            >
                              Save
                            </button>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                    
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            title="Unlink"
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            disabled={!editor.isActive('link')}
                            className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                            style={{ borderRadius: 0, boxSizing: 'border-box' }}
                          >
                            <Image src="/unlinkbtn.svg" alt="Unlink" width={24} height={24} className="w-6 h-6" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side="top"
                          className="bg-black text-white px-2 py-1 rounded text-xs z-50"
                          sideOffset={4}
                        >
                          Remove Link
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                    
                    <button
                      type="button"
                      title="Image"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/imagebtn.svg" alt="Image" width={24} height={24} className="w-6 h-6" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={addImage}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      title="Horizontal Rule"
                      onClick={() => editor.chain().focus().setHorizontalRule().run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/hrulebtn.svg" alt="Horizontal Rule" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Strikethrough"
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/strikebtn.svg" alt="Strikethrough" width={24} height={24} className="w-6 h-6" />
                    </button>
                    
                    <button
                      type="button"
                      title="Fullscreen"
                      onClick={toggleFullscreen}
                      className="w-[28px] h-[28px] flex items-center justify-center p-0 hover:bg-gray-100 cursor-pointer"
                      style={{ borderRadius: 0, boxSizing: 'border-box' }}
                    >
                      <Image src="/fullscreenbtn.svg" alt="Fullscreen" width={24} height={24} className="w-6 h-6" />
                    </button>
                  </div>
                  <EditorContent
                    key={initialContent}
                    editor={editor}
                    className={`bg-white px-4 py-3 text-[15px] font-normal
                      [&_h1]:text-2xl [&_h1]:font-bold
                      [&_h2]:text-xl [&_h2]:font-semibold
                      [&_h3]:text-lg [&_h3]:font-semibold
                      [&_p]:text-base
                      [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6
                      ${fullscreen ? 'flex-1 overflow-auto scrollbar-hide' : 'min-h-[160px]'}
                    `}
                  />
                </>
              )}
            </div>
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label.Root htmlFor="cover-image" className="block font-semibold text-[15px] mb-0">
              Cover Image
            </Label.Root>
            <div className={`border-2 border-dashed border-[#D1D5DB] rounded-[8px] flex flex-col items-center justify-center py-8 ${errors.coverImage ? 'border-red-400' : ''}`}>
              {!coverPreview ? (
                <>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="cover-image" className="cursor-pointer text-blue-500 hover:underline flex flex-col items-center">
                    <Image src="/upload-icon.svg" alt="Upload" width={32} height={32} className="mb-2 text-gray-400" />
                    <span className="text-[15px] font-medium">
                      Click to upload <span className="text-gray-500 font-normal">or drag and drop</span>
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">PNG or JPG (max. 5MB).</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  {coverPreview && (
                    <Image
                      src={coverPreview}
                      alt="Cover Preview"
                      width={400}
                      height={200}
                      className="max-h-48 rounded-lg mb-2 object-contain"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 border border-neutral-300 rounded-[8px] hover:bg-neutral-300 text-sm cursor-pointer flex items-center gap-2"
                    >
                      <Image src="/uploadArrow-icon.svg" alt="Upload Arrow" width={18} height={18} className="inline-block" />
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1 border border-neutral-300 text-red-600 rounded-[8px] hover:bg-red-200 hover:border-red-200 text-sm cursor-pointer flex items-center gap-2"
                    >
                      <Image src="/delete-icon.svg" alt="Delete" width={18} height={18} className="inline-block" />
                      Delete Image
                    </button>
                  </div>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label.Root htmlFor="tags" className="block font-semibold text-[15px] mb-0">
              Tags
            </Label.Root>
            <div className={`flex flex-wrap gap-2 border border-[#D1D5DB] rounded-[8px] px-4 py-3 ${errors.tags ? 'border-red-400' : ''}`}>
              {tags.map(tag => (
                <span key={tag} className="border border-neutral-300 rounded-[8px] px-2 py-1 flex items-center gap-1 text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-red-500 cursor-pointer"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="tags"
                type="text"
                onKeyDown={handleTagInput}
                className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-[15px]"
                placeholder="Enter your tags"
              />
            </div>
            {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
          </div>

          <div className="flex justify-end mt-4 mb-12">
            <button
              type="submit"
              className="bg-[#0093DD] text-white font-semibold py-2 px-12 rounded-full hover:bg-blue-600 transition text-[16px] min-w-[265px] cursor-pointer"
              style={{ boxShadow: '0px 2px 8px 0px #0093DD1A' }}
            >
              Save
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}