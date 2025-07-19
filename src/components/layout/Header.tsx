'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAvatarUrl } from '@/helpers/avatar';

type Props = {
  searchQuery: string;
  onSearch?: (query: string) => void;
};

type User = {
  name: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  headline?: string;
};

const Header = ({ searchQuery, onSearch }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function syncUser() {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      else setUser(null);
    }
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);
  
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  const handleLogoClick = () => {
    setInputValue('');
    if (onSearch) onSearch('');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setInputValue(value);
    if (value === '' && onSearch) {
    onSearch('');
    }
  };
  
  const handleSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onSearch) onSearch(inputValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    router.push('/profile');
  };

  if (!isMounted) return null;

  return (
    <header className="w-full h-[80px] fixed top-0 left-0 z-50 flex items-center justify-between px-4 md:px-6 lg:px-30 py-4 border-b border-gray-200 bg-white">
      
      <Link
        href="/"
        aria-label="Go to homepage"
        onClick={handleLogoClick}
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <Image src="/logo-symbol.svg" alt="Logo" width={32} height={32} className="h-8 w-auto" />
          <span className="font-bold text-lg md:text-xl text-gray-900">Your Logo</span>
        </div>
      </Link>

      <div className="flex justify-center flex-1 max-w-[373px]">
        <form onSubmit={handleSearch} className="relative w-full h-[48px]">
          <button
            type="button"
            onClick={handleSearch}
            className="absolute inset-y-0 left-4 flex items-center text-gray-400"
            tabIndex={-1}
          >
            <svg
              style={{ cursor: 'pointer' }}
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M20 20l-3-3"
              />
            </svg>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search"
            className="w-full h-full pl-12 pr-4 rounded-[12px] border border-neutral-300 bg-white text-sm md:text-base text-neutral-950 outline-none"
          />
        </form>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/write-post"
              className="flex items-center gap-2 group text-[#0097E6] font-semibold text-base px-0"
              style={{ minWidth: 0 }}
            >
              <Image
                src="/Write Post Icon.svg"
                alt="Write Post"
                width={24}
                height={24}
                className="h-5 w-5"
              />
              <span className="text-[#0093DD] font-medium hover:underline hover:text-blue-500 transition text-sm md:text-base pb-0.5">
                Write Post
              </span>
            </Link>
            <span className="mx-4 h-8 w-[0.5px] bg-gray-300 block"></span>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition"
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={getAvatarUrl(user.avatarUrl || user.avatar)}
                  alt={user.name || 'User Avatar'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover h-10 w-10"
                  onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                />
                <span className="font-medium text-neutral-950">{user.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2">
                  <button
                    onClick={handleProfile}
                    className="flex items-center gap-2 px-4 py-2 w-full text-neutral-700  hover:text-neutral-950 transition"
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src="/profile-icon.svg"
                      alt="Profile"
                      width={18}
                      height={18}
                    />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 w-full text-neutral-700  hover:text-neutral-950 transition"
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src="/logout-icon.svg"
                      alt="Logout"
                      width={20}
                      height={20}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[#0093DD] font-medium hover:underline hover:text-blue-500 transition text-sm md:text-base"
            >
              Login
            </Link>
            <span className="mx-4 h-8 w-[0.5px] bg-gray-200 block"></span>
            <Link
              href="/register"
              className="hidden md:block bg-[#0097E6] text-white text-center w-[182px] h-[44px] py-2 rounded-full font-semibold hover:bg-blue-500 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;