import { useState, useEffect } from 'react';
import { Building, TrendingUp, Users, BarChart2 } from 'lucide-react';
import { fetchAccountOwners } from '../../../lib/api';
import type { AccountOwner } from '../../types/database';

export function SystemOverview() {
  const [accounts, setAccounts] = useState<AccountOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAccountOwners();
        if (isMounted) {
          setAccounts(data);
        }
      } catch (error) {
        // Silently handle session errors during logout
        if (error instanceof Error && error.message.includes('No active session')) {
          return;
        }
        if (isMounted) {
          console.error('Error loading system overview:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.status === 'active').length;
  const totalLeads = accounts.reduce((sum, a) => sum + (a.totalLeads || 0), 0);
  const totalWorkers = accounts.reduce((sum, a) => sum + (a.totalWorkers || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-600 mt-1">Platform-wide statistics and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Account Owners</p>
              <p className="text-2xl font-bold text-slate-900">{totalAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Accounts</p>
              <p className="text-2xl font-bold text-slate-900">{activeAccounts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Workers</p>
              <p className="text-2xl font-bold text-slate-900">{totalWorkers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Owners List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Account Performance</h2>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-slate-200">
          {accounts.map((account) => (
            <div key={account.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{account.company_name}</div>
                    <div className="text-sm text-slate-500">{account.full_name}</div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {account.status === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{account.totalWorkers || 0}</div>
                  <div className="text-xs text-slate-500">Workers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{account.totalLeads || 0}</div>
                  <div className="text-xs text-slate-500">Leads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {account.totalWorkers && account.totalWorkers > 0
                      ? Math.round((account.totalLeads || 0) / account.totalWorkers)
                      : 0}
                  </div>
                  <div className="text-xs text-slate-500">Avg/Worker</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Workers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Avg/Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{account.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{account.full_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{account.totalWorkers || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span>{account.totalLeads || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-slate-400" />
                      <span>
                        {account.totalWorkers && account.totalWorkers > 0
                          ? Math.round((account.totalLeads || 0) / account.totalWorkers)
                          : 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No account owners in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}