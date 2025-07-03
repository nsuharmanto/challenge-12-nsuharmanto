import React from 'react';
import Image from 'next/image';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`bg-[#0093DD] hover:bg-[#0080C6] text-white font-semibold text-base rounded-full px-8 py-2 flex items-center gap-2 transition-colors duration-200 focus:outline-none ${className}`}
    >
      <Image
        src="/writepost-white.svg"
        alt="Write Post Icon"
        width={22}
        height={22}
        className="inline-block"
        style={{ display: 'inline-block' }}
        priority
      />
      {children}
    </button>
  );
}