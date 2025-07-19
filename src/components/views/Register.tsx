'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  // Mata tertutup default (password hidden)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  const validate = (fields = formData) => {
    const newErrors: typeof errors = { fullName: '', email: '', password: '', confirmPassword: '' };
    if (!fields.fullName.trim()) newErrors.fullName = 'Name is required.';
    if (!fields.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(fields.email)) newErrors.email = 'Invalid email address.';
    if (!fields.password) newErrors.password = 'Password is required.';
    else if (fields.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!fields.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required.';
    else if (fields.password !== fields.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name as keyof typeof touched]) {
      setErrors({ ...errors, ...validate({ ...formData, [name]: value }) });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, ...validate(formData) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    try {
      const response = await fetch(
        'https://blogger-wph-api-production.up.railway.app/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName, 
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful!');
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
        setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });
        setTouched({ fullName: false, email: false, password: false, confirmPassword: false });
        router.push('/login'); 
      } else {
        setSuccess('');
        setApiError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setSuccess('');
      setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative bg-white rounded-xl shadow-md px-8 py-10"
        style={{ width: 400, maxWidth: '95vw' }}
      >
        <button
          aria-label="Close and go to homepage"
          onClick={() => router.push('/')}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center"
          style={{ lineHeight: 1 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 6L14 14M14 6L6 14" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold mb-8 text-left">Sign Up</h1>
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
        {apiError && <p className="text-red-500 mb-4 text-center">{apiError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4 flex flex-col items-center">
            <label htmlFor="fullName" className="block text-sm font-semibold mb-1 w-full">
              Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-[352px] max-w-full px-4 py-2 border rounded-lg outline-none ${
                touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
              required
              style={{ height: '48px' }}
            />
            {touched.fullName && errors.fullName && (
              <p className="text-xs text-red-500 mt-1 w-full">{errors.fullName}</p>
            )}
          </div>
          
          <div className="mb-4 flex flex-col items-center">
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
              className={`w-[352px] max-w-full px-4 py-2 border rounded-lg outline-none ${
                touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              required
              style={{ height: '48px' }}
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500 mt-1 w-full">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4 relative flex flex-col items-center">
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
              className={`w-[352px] max-w-full px-4 py-2 border rounded-lg outline-none pr-10 ${
                touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              required
              style={{ height: '48px' }}
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
                  d={
                    showPassword
                      ? 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11-4a4 4 0 100 8 4 4 0 000-8z'
                      : 'M12 5C7 5 2.73 8.11 1 12c.74 1.61 1.97 3.03 3.54 4.11M17 17.94C15.41 18.6 13.74 19 12 19c-5 0-9-4-9-7s4-7 9-7c2.74 0 5.22 1.12 7.06 2.94M1 1l22 22'
                  }
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
          
          <div className="mb-6 relative flex flex-col items-center">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1 w-full">
              Confirm Password
            </label>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-[352px] max-w-full px-4 py-2 border rounded-lg outline-none pr-10 ${
                touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your confirm password"
              required
              style={{ height: '48px' }}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 text-gray-500 cursor-pointer"
              style={{ top: 38 }}
              onClick={() => setShowConfirm((v) => !v)}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d={
                    showConfirm
                      ? 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11-4a4 4 0 100 8 4 4 0 000-8z'
                      : 'M12 5C7 5 2.73 8.11 1 12c.74 1.61 1.97 3.03 3.54 4.11M17 17.94C15.41 18.6 13.74 19 12 19c-5 0-9-4-9-7s4-7 9-7c2.74 0 5.22 1.12 7.06 2.94M1 1l22 22'
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 w-full">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#0093DD] text-white py-2 rounded-full font-semibold text-base hover:bg-blue-500 transition cursor-pointer"
            style={{ height: '48px' }}
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}