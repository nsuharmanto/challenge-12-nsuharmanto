import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Props = {
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void; 
};

export default function SearchBar({ defaultValue = '', placeholder = 'Search posts...', onSearch }: Props) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value.trim());
    } else {
      router.push(`/post/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onSearch && e.target.value === '') {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="border rounded-l px-4 py-2 w-full"
      />
      <button
        type="submit"
        className="bg-primary-400 text-white px-4 py-2 rounded-r"
      >
        Search
      </button>
    </form>
  );
}