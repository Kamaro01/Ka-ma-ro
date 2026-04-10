'use client';

import Link from 'next/link';

export default function CustomerAuthenticationInteractive() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ka-ma-ro</h1>
          <p className="text-gray-600 mt-2">
            Simple customer access using the working sign-in and sign-up flow
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-white border border-blue-200 text-blue-700 text-center py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/password-reset-portal"
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">Demo customer login</p>
          <p>Email: customer@kamaro.com</p>
          <p>Password: customer123</p>
        </div>
      </div>
    </div>
  );
}
