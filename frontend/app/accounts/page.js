'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/context/ProtectedRoute';
import { useAuth } from '@/context/useAuth';
import { accountAPI } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Profile', href: '/profile/verification' },
];

const profileItems = [
  { label: 'Documents', href: '/profile/documents' },
  { label: 'Verification', href: '/profile/verification' },
  { label: 'Bank Info', href: '/profile/verification' },
];

const filters = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'demo', label: 'Demo' },
];

const formatMoney = (value) => (
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
);

const getAccountType = (account) => account.account_type || account.accountType || 'demo';

const getAccountTitle = (account) => (
  getAccountType(account) === 'live' ? 'CLASSIC' : 'Demo'
);

const getAccountAlias = (account, index) => {
  if (account.name && !account.name.toLowerCase().includes('novafxm')) {
    return account.name;
  }

  return getAccountType(account) === 'live'
    ? `Live account ${index + 1}`
    : `Demo account ${index + 1}`;
};

const AccountBadge = ({ type }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
    type === 'live' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
  }`}>
    <span className={`h-2 w-2 rounded-full ${type === 'live' ? 'bg-red-500' : 'bg-blue-700'}`} />
    {type === 'live' ? 'Live' : 'Demo'}
  </span>
);

function AccountCard({ account, index }) {
  const type = getAccountType(account);
  const isLive = type === 'live';

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-950">{getAccountTitle(account)}</h3>
        <div className="flex items-center gap-2">
          <AccountBadge type={type} />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Refresh account"
          >
            R
          </button>
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        <div className="text-sm">
          <div className="text-blue-300">ID : #{account.id || account.account_number || '-'}</div>
          <div className="mt-1 text-slate-900">Alias : {getAccountAlias(account, index)}</div>
        </div>

        <div className="border-t border-blue-100 pt-5">
          <p className="text-sm text-slate-700">Balance</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-slate-950">
            {formatMoney(account.balance).split('.')[0]}
            <span className="text-slate-300">.{formatMoney(account.balance).split('.')[1]}</span>
            <span className="ml-2 text-sm font-semibold text-slate-900">USD</span>
          </p>
        </div>

        <div className="grid grid-cols-3 border-t border-blue-100 pt-5 text-sm">
          <div>
            <p className="text-xs text-slate-500">Bonus</p>
            <p className="mt-2 font-semibold text-slate-900">-</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Leverage</p>
            <p className="mt-2 font-semibold text-slate-900">{account.leverage || 200}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Type</p>
            <p className="mt-2 font-semibold text-slate-900">Hedging</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {isLive && (
            <button
              type="button"
              className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              Deposit
            </button>
          )}
          <Link
            href="/platform"
            className={`rounded-lg border border-blue-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-blue-50 ${
              isLive ? '' : 'col-span-2'
            }`}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function AccountsContent() {
  const { user, token, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [creatingType, setCreatingType] = useState('');
  const [error, setError] = useState('');

  const loadAccounts = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    const result = await accountAPI.getTradingAccounts(token);

    if (result?.error) {
      setError(result.error);
    } else {
      setAccounts(result || []);
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const counts = useMemo(() => ({
    all: accounts.length,
    live: accounts.filter((account) => getAccountType(account) === 'live').length,
    demo: accounts.filter((account) => getAccountType(account) === 'demo').length,
  }), [accounts]);

  const visibleAccounts = useMemo(() => (
    filter === 'all'
      ? accounts
      : accounts.filter((account) => getAccountType(account) === filter)
  ), [accounts, filter]);

  const createAccount = async (accountType) => {
    setCreatingType(accountType);
    setError('');
    const result = await accountAPI.createTradingAccount(token, accountType);

    if (result?.error) {
      setError(result.error);
    } else {
      setAccounts((prev) => [result, ...prev]);
      setFilter(accountType);
    }

    setCreatingType('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
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
            const active = item.label === 'Accounts';
            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-3 font-medium ${
                    active
                      ? 'border border-slate-900 bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </Link>
                {item.label === 'Profile' && (
                  <div className="ml-4 mt-2 space-y-1 border-l border-blue-900 pl-3">
                    {profileItems.map((profileItem) => (
                      <Link
                        key={profileItem.label}
                        href={profileItem.href}
                        className="block rounded px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                      >
                        {profileItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="ml-60 min-h-screen">
        <header className="flex h-16 items-center justify-end gap-4 px-6">
          <Link
            href="/platform"
            className="rounded-lg border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-blue-50"
          >
            Platform
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
            {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-36 text-right">
            <div className="text-sm font-bold">{user?.username || 'User Demo'}</div>
            <div className="max-w-40 truncate text-xs text-slate-500">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </header>

        <div className="mx-auto max-w-7xl space-y-10 px-8 py-8">
          <section className="rounded-lg border border-blue-100 bg-white px-8 py-7">
            <h1 className="text-xl font-semibold text-slate-950">Create New Account</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => createAccount('live')}
                disabled={Boolean(creatingType)}
                className="rounded-lg bg-blue-900 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {creatingType === 'live' ? 'Creating...' : '+ Create Live Account'}
              </button>
              <button
                onClick={() => createAccount('demo')}
                disabled={Boolean(creatingType)}
                className="rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:opacity-60"
              >
                {creatingType === 'demo' ? 'Creating...' : '+ Create Demo Account'}
              </button>
            </div>
          </section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section>
            <p className="text-sm font-medium text-slate-700">Filter by Account Type</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {filters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg border px-6 py-2 text-sm font-medium ${
                    filter === item.value
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-blue-100 bg-white text-slate-600 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                  <span className="ml-3 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    {counts[item.value]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">All Accounts</h2>
            {loading ? (
              <div className="mt-5 rounded-lg border border-blue-100 bg-white p-8 text-center text-slate-500">
                Loading accounts...
              </div>
            ) : visibleAccounts.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-blue-200 bg-white p-8 text-center text-slate-500">
                No {filter === 'all' ? '' : filter} accounts found.
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                {visibleAccounts.map((account, index) => (
                  <AccountCard key={account.id} account={account} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <AccountsContent />
    </ProtectedRoute>
  );
}
