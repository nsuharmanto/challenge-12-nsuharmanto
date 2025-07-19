'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = (fields = formData) => {
    const newErrors = { email: '', password: '' };
    if (!fields.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(fields.email)) newErrors.email = 'Invalid email address.';
    if (!fields.password) newErrors.password = 'Password is required.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name as keyof typeof touched]) {
      setErrors({ ...errors, ...validate({ ...formData, [name]: value }) });
    }
    setApiError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, ...validate(formData) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    setTouched({ email: true, password: true });

    if (validationErrors.email || validationErrors.password) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://blogger-wph-api-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);

        // Fetch user by email setelah login
        let user = null;
        try {
          const email = formData.email;
          const userRes = await fetch(`https://blogger-wph-api-production.up.railway.app/users/by-email/${encodeURIComponent(email)}`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (userRes.ok) {
            user = await userRes.json();
            console.log('USER BY EMAIL RESPONSE:', user);
          }
        } catch (err) {
          console.error('User fetch error:', err);
        }

        if (user && user.name) {
          localStorage.setItem('user', JSON.stringify({
            name: user.name,
            avatar: user.avatarUrl,
            avatarUrl: user.avatarUrl,
            email: user.email,
            headline: user.headline,
          }));
          window.dispatchEvent(new Event('storage'));
        } else {
          localStorage.removeItem('user');
        }

        router.push('/');
      } else {
        setApiError(data.message || 'Login failed.');
      }
    } catch (error: unknown) {
      console.error(error);
      setApiError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative bg-white rounded-xl shadow-md px-6 pt-6 pb-6 flex flex-col items-center"
        style={{
          width: 360,
          minHeight: 454,
          maxWidth: '95vw',
        }}
      >
        
        <div className="flex items-center justify-between w-full mb-8">
          <h1 className="text-2xl font-bold text-left">Sign In</h1>
          <button
            aria-label="Close and go to homepage"
            onClick={() => router.push('/')}
            className="z-10 p-1.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center"
            style={{ lineHeight: 1 }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 20 20"
              fill="none"
              className="w-7 h-7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 6L14 14M14 6L6 14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col items-center">
          <div className="mb-4 flex flex-col items-center w-full" style={{ minHeight: 108 }}>
            <label htmlFor="email" className="block text-sm font-semibold mb-1 w-full">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-[316px] max-w-full px-4 py-2 border rounded-lg outline-none ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
              style={{ height: 48 }}
              autoComplete="username"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500 mt-1 w-full">{errors.email}</p>
            )}
          </div>
          <div className="mb-6 relative flex flex-col items-center w-full" style={{ minHeight: 108 }}>
            <label htmlFor="password" className="block text-sm font-semibold mb-1 w-full">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-[316px] max-w-full px-4 py-2 border rounded-lg outline-none pr-10 ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your password"
              style={{ height: 48 }}
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 text-gray-500 cursor-pointer"
              style={{ top: 38 }}
              onClick={() => setShowPassword((v) => !v)}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d={showPassword
                    ? "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11-4a4 4 0 100 8 4 4 0 000-8z"
                    : "M12 5C7 5 2.73 8.11 1 12c.74 1.61 1.97 3.03 3.54 4.11M17 17.94C15.41 18.6 13.74 19 12 19c-5 0-9-4-9-7s4-7 9-7c2.74 0 5.22 1.12 7.06 2.94M1 1l22 22"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {touched.password && errors.password && (
              <p className="text-xs text-red-500 mt-1 w-full">{errors.password}</p>
            )}
          </div>
          {apiError && (
            <p className="text-xs text-red-500 mb-4 text-center">{apiError}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#0093DD] text-white py-2 rounded-full font-semibold text-base hover:bg-blue-500 transition cursor-pointer ${isLoading ? 'opacity-50 cursor-default' : ''}`}
            style={{ height: 48, width: 316 }}
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6 text-sm w-full">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}