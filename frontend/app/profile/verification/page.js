'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
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
    wallet: <path d="M4 7h15a2 2 0 0 1 2 2v9H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14v2M17 13h.01" />,
    money: <path d="M12 3v18M17 7.5c-.8-1-2.4-1.5-4-1.5-2.2 0-4 1-4 2.7 0 3.8 8 1.6 8 5.4 0 1.7-1.8 2.9-4.1 2.9-1.9 0-3.5-.7-4.4-1.9" />,
    list: <path d="M4 6h16M4 12h16M4 18h16" />,
    copy: <path d="M8 8h10v12H8zM6 16H4V4h12v2" />,
    clock: <path d="M12 8v5l3 2M21 12a9 9 0 1 1-3-6.7" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />,
    network: <path d="M8 18v-6M12 18V6M16 18v-9M5 21h14" />,
    file: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h5M10 17h7" />,
    fingerprint: <path d="M6 12a6 6 0 0 1 12 0M9 18c.5-1.7.7-3.7.7-6a2.3 2.3 0 0 1 4.6 0c0 1.1-.1 2.5-.3 4M12 21c.9-2.7 1.4-5.7 1.4-9M5 16c.3-1.1.4-2.5.4-4a6.6 6.6 0 0 1 .5-2.5M18.6 15.5c.1-1.3.2-2.5.2-3.5a6.8 6.8 0 0 0-.4-2.3" />,
    card: <path d="M4 6h16v12H4zM4 10h16M7 15h4" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 19a2 2 0 0 0 4 0" />,
    uploadFile: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 16h4M10 13h7" />,
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
};

function PortalSidebar({ activeSubItem }) {
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
        {navItems.map((item) => {
          const active = item.label === 'Profile';
          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-3 font-semibold ${
                  active
                    ? 'text-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>

              {item.label === 'Profile' && (
                <div className="ml-4 mt-2 space-y-1 border-l border-blue-900 pl-3">
                  {profileItems.map((profileItem) => {
                    const selected = profileItem.label === activeSubItem;
                    return (
                      <Link
                        key={profileItem.label}
                        href={profileItem.href}
                        className={`flex items-center gap-3 rounded px-3 py-2 font-semibold ${
                          selected
                            ? 'border border-slate-900 bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <Icon name={profileItem.icon} />
                        {profileItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function TopBar() {
  const { user } = useAuth();
  const initial = (user?.username || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-end gap-4 px-6">
      <div className="text-xl text-amber-500">*</div>
      <Link
        href="/platform"
        className="rounded-lg border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-blue-50"
      >
        Platform
      </Link>
      <div className="relative">
        <Icon name="bell" className="h-5 w-5 text-slate-600" />
        <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">2</span>
      </div>
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

function VerificationStep({ status, title, children, active, complete, tag }) {
  return (
    <div className="grid grid-cols-[34px_1fr] gap-4">
      <div className="relative flex justify-center">
        <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
          complete
            ? 'border-blue-900 bg-blue-900 text-white'
            : active
              ? 'border-blue-900 bg-white text-blue-900'
              : 'border-slate-300 bg-white text-slate-300'
        }`}>
          {complete ? 'OK' : '*'}
        </div>
        {status !== 'last' && <div className="absolute top-8 h-20 w-px bg-emerald-300" />}
      </div>

      <div className={`rounded-lg border px-5 py-4 ${
        active
          ? 'border-blue-900 bg-slate-50 shadow-sm'
          : complete
            ? 'border-emerald-100 bg-emerald-50'
            : 'border-blue-100 bg-slate-50'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-bold uppercase ${complete ? 'text-emerald-600' : 'text-blue-900'}`}>
              {title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{children}</p>
          </div>
          {tag && (
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase text-emerald-600">
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationOverview({ onNext }) {
  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Verification Center</h1>
      <p className="mt-1 text-sm text-slate-600">Complete verification to unlock all features</p>

      <section className="mt-7 rounded-lg border border-blue-100 p-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <VerificationStep complete title="Unverified" tag="You are here">
              You&apos;ve registered! Upload your documents to complete verification and unlock more features.
            </VerificationStep>
            <VerificationStep active title="Verified">
              After verification, you&apos;ll gain access to enhanced features and more functionality.
            </VerificationStep>
            <VerificationStep status="last" title="CC-Verified">
              This is the final step before you gain full access to all our features!
            </VerificationStep>
          </div>

          <aside className="rounded-lg bg-slate-50 p-6">
            <h2 className="font-bold">Document Requirements:</h2>
            <p className="mt-1 text-sm text-slate-600">Documents required to complete this stage.</p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm font-semibold">
              <li>ID Proof</li>
              <li>Address Proof</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="mt-5 flex min-h-72 items-center justify-center rounded-lg border border-blue-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border-2 border-blue-900 text-blue-900">
            +
          </div>
          <h3 className="mt-5 font-semibold text-slate-700">No Features Available</h3>
          <p className="mt-2 text-slate-500">Get started by creating a new features.</p>
        </div>
      </section>

      <button
        type="button"
        onClick={onNext}
        className="mt-6 rounded-lg bg-blue-900 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
      >
        Next Steps -&gt;
      </button>
    </div>
  );
}

function UploadBox({ label, documentType }) {
  const { token } = useAuth();
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file || !token) return;

    setUploading(true);
    setMessage('');
    const result = await accountAPI.uploadDocument(token, {
      document_type: documentType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      link: file.name,
    });

    if (result?.error) {
      setMessage(result.error);
    } else {
      setFileName(file.name);
      setMessage('Uploaded for admin review');
    }

    setUploading(false);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="font-semibold">{label}</h2>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="m-6 flex min-h-64 w-[calc(100%-3rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-center text-slate-400 hover:border-blue-300 hover:bg-blue-50"
      >
        <Icon name="uploadFile" className="h-16 w-16 text-slate-400" />
        <span className="mt-4 text-sm">
          {uploading ? 'Uploading...' : fileName || 'Drop your file to upload or browse'}
        </span>
        {message && (
          <span className={`mt-2 text-xs ${message.includes('review') ? 'text-emerald-600' : 'text-red-600'}`}>
            {message}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => uploadFile(event.target.files?.[0])}
      />
    </section>
  );
}

function UploadDocuments() {
  return (
    <div className="space-y-5">
      <UploadBox label="ID Proof" documentType="ID Proof" />
      <UploadBox label="Address Proof" documentType="Address Proof" />
    </div>
  );
}

function VerificationContent() {
  const searchParams = useSearchParams();
  const initialStep = searchParams.get('step') === 'upload' ? 'upload' : 'overview';
  const [step, setStep] = useState(initialStep);
  const activeSubItem = useMemo(() => (step === 'upload' ? 'Documents' : 'Verification'), [step]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalSidebar activeSubItem={activeSubItem} />
      <main className="ml-60 min-h-screen">
        <TopBar />
        <div className="px-7 py-8">
          {step === 'upload' ? (
            <UploadDocuments />
          ) : (
            <VerificationOverview onNext={() => setStep('upload')} />
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <ProtectedRoute>
      <VerificationContent />
    </ProtectedRoute>
  );
}
