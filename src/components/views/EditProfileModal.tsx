'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { getAvatarUrl } from '@/helpers/avatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    headline: string;
    avatarUrl: string;
  };
  onSave: (data: { name: string; headline: string; avatarFile?: File }) => Promise<void> | void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [headline, setHeadline] = useState(user.headline);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle camera button click
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ name, headline, avatarFile });
    setLoading(false);
  };

  // Gunakan preview jika ada, jika tidak pakai avatar user
  const avatarSrc = avatarPreview || getAvatarUrl(user.avatarUrl);

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl shadow-xl px-8 py-8 w-[451px] max-w-[95vw] flex flex-col items-center">
        {/* Header: Title + Close */}
        <div className="w-full flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-left">Edit Profile</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer"
            disabled={loading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4L20 20M20 4L4 20" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        <div className="relative mb-6">
          {!imgLoaded && (
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse absolute" />
          )}
          <Image
            src={avatarSrc}
            alt="Avatar"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
            onLoadingComplete={() => setImgLoaded(true)}
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
          <button
            type="button"
            className="absolute bottom-[-5px] right-[-2px] bg-blue-500 rounded-full p-1 flex items-center justify-center"
            onClick={handleCameraClick}
            aria-label="Change profile picture"
            disabled={loading}
          >
            <Image
              src="/camera-icon.svg"
              alt="Change avatar"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={loading}
          />
        </div>
        
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full h-12 px-4 py-2 border rounded-lg outline-none border-gray-300"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your Name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Profile Headline</label>
            <input
              type="text"
              className="w-full h-12 px-4 py-2 border rounded-lg outline-none border-gray-300"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="Frontend Developer"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0093DD] text-white py-3 rounded-full font-semibold text-base hover:bg-blue-500 transition mt-4 flex items-center justify-center"
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}