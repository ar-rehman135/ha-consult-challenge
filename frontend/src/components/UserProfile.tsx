'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'premium':
        return 'Premium User';
      case 'user':
        return 'Regular User';
      default:
        return role;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-3 py-2 hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.email}</span>
        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user?.role)}`}>
          {getRoleDisplayName(user?.role)}
        </span>
      </button>

      {showProfile && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.email}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 text-gray-900">{getRoleDisplayName(user?.role)}</span>
              </div>
            </div>

            {user?.role === 'premium' && (
              <div className="mb-4 p-3 bg-purple-50 rounded-md">
                <h4 className="text-sm font-semibold text-purple-800 mb-1">Premium Features</h4>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Advanced analytics</li>
                  <li>• Risk-adjusted returns</li>
                  <li>• Portfolio optimization</li>
                  <li>• Custom strategy builder</li>
                </ul>
              </div>
            )}

            {user?.role === 'admin' && (
              <div className="mb-4 p-3 bg-red-50 rounded-md">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Admin Features</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• User management</li>
                  <li>• System analytics</li>
                  <li>• All premium features</li>
                </ul>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={()=> router.push('https://buy.stripe.com/test_00w9AT6Wk5CVdqu2rj2oE00')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm mb-2"
              >
                Subscribe
              </button>
              <button
                onClick={onLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showProfile && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}