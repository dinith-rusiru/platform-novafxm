'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/context/ProtectedRoute';
import { useAuth } from '@/context/useAuth';
import { accountAPI } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/', icon: 'home' },
  { label: 'Accounts', href: '/accounts', icon: 'list' },
  { label: 'Profile', href: '/profile/verification', icon: 'user' },
];

const profileItems = [
  { label: 'Documents', href: '/profile/documents', icon: 'file' },
  { label: 'Verification', href: '/profile/verification', icon: 'fingerprint' },
  { label: 'Bank Info', href: '/profile/verification', icon: 'card' },
];

const Icon = ({ name, className = 'h-4 w-4' }) => {
  const commonProps = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };

  const paths = {
    home: <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" />,
    list: <path d="M4 6h16M4 12h16M4 18h16" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />,
    file: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h5M10 17h7" />,
    fingerprint: <path d="M6 12a6 6 0 0 1 12 0M9 18c.5-1.7.7-3.7.7-6a2.3 2.3 0 0 1 4.6 0c0 1.1-.1 2.5-.3 4M12 21c.9-2.7 1.4-5.7 1.4-9M5 16c.3-1.1.4-2.5.4-4a6.6 6.6 0 0 1 .5-2.5M18.6 15.5c.1-1.3.2-2.5.2-3.5a6.8 6.8 0 0 0-.4-2.3" />,
    card: <path d="M4 6h16v12H4zM4 10h16M7 15h4" />,
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const getStatusClass = (status) => ({
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
}[status] || 'bg-slate-100 text-slate-600');

function PortalSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-60 border-r border-slate-200 bg-white">
      <div className="px-5 py-6">
        <Image
          src="/novafxm-logo.jpeg"
          alt="NovaFXM Global Forex Trading"
          width={170}
          height={52}
          priority
        />
      </div>

      <nav className="space-y-3 px-4 text-sm">
        {navItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded px-3 py-3 font-semibold ${
                item.label === 'Profile'
                  ? 'text-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
            {item.label === 'Profile' && (
              <div className="ml-4 mt-2 space-y-1 border-l border-blue-900 pl-3">
                {profileItems.map((profileItem) => (
                  <Link
                    key={profileItem.label}
                    href={profileItem.href}
                    className={`flex items-center gap-3 rounded px-3 py-2 font-semibold ${
                      profileItem.label === 'Documents'
                        ? 'border border-slate-900 bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon name={profileItem.icon} />
                    {profileItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function TopBar() {
  const { user } = useAuth();
  const initial = (user?.username || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-end gap-4 px-6">
      <Link
        href="/platform"
        className="rounded-lg border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-blue-50"
      >
        Platform
      </Link>
      <div className="min-w-40 rounded-full bg-white px-4 py-1 text-right shadow-sm">
        <div className="text-sm font-bold">{user?.username || 'User Demo'}</div>
        <div className="max-w-36 truncate text-[10px] text-slate-500">{user?.email}</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
        {initial}
      </div>
    </header>
  );
}

function DocumentsContent() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    const result = await accountAPI.getDocuments(token);

    if (result?.error) {
      setError(result.error);
    } else {
      setDocuments(result || []);
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalSidebar />
      <main className="ml-60 min-h-screen">
        <TopBar />
        <div className="px-7 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Document Upload History</h1>
            <button
              onClick={loadDocuments}
              className="rounded-lg border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">Date Created</th>
                  <th className="px-4 py-3">Date Processed</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-5 text-slate-500">Loading documents...</td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-5 text-slate-500">No Data Found</td>
                  </tr>
                ) : documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-4 py-3 font-semibold">#{document.id}</td>
                    <td className="px-4 py-3">{document.document_type}</td>
                    <td className="px-4 py-3">{formatDate(document.created_at)}</td>
                    <td className="px-4 py-3">{formatDate(document.processed_at)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">{document.file_name || document.link}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(document.status)}`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{document.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
