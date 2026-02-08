import { useState, useEffect } from 'react';
import { AccountOwner } from '../../types/database';
import { Plus, UserX, X, Building2, Users, TrendingUp, Trash2, AlertTriangle, Edit, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAccountOwners,
  createAccountOwner,
  updateAccountOwner,
  updateAccountOwnerStatus,
  deleteAccountOwner,
} from '../../../lib/api';

export function AccountOwnersManagement() {
  const [accounts, setAccounts] = useState<AccountOwner[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountOwner | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<AccountOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountOwnerName, setNewAccountOwnerName] = useState('');
  const [newAccountCompanyName, setNewAccountCompanyName] = useState('');

  // Form state for editing
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadAccounts = async () => {
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
          console.error('Error loading accounts:', error);
          toast.error('Failed to load account owners');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadAccounts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields before submitting
    if (!newAccountEmail || !newAccountPassword || !newAccountOwnerName || !newAccountCompanyName) {
      toast.error('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAccountEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (newAccountPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAccountOwner({
        email: newAccountEmail,
        password: newAccountPassword,
        fullName: newAccountOwnerName,
        companyName: newAccountCompanyName,
      });

      toast.success('Account owner created successfully!');
      setIsAddModalOpen(false);
      setNewAccountEmail('');
      setNewAccountPassword('');
      setNewAccountOwnerName('');
      setNewAccountCompanyName('');
      await loadAccounts();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account owner';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAccount) return;

    // Validate email format if changed
    if (editEmail && editEmail !== editingAccount.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Validate password length if provided
    if (editPassword && editPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        accountOwnerId: editingAccount.id,
      };

      // Only include fields that have changed
      if (editEmail && editEmail !== editingAccount.email) {
        updateData.email = editEmail;
      }
      if (editPassword) {
        updateData.password = editPassword;
      }
      if (editOwnerName && editOwnerName !== editingAccount.full_name) {
        updateData.fullName = editOwnerName;
      }
      if (editCompanyName && editCompanyName !== editingAccount.company_name) {
        updateData.companyName = editCompanyName;
      }

      await updateAccountOwner(updateData);

      toast.success('Account owner updated successfully!');
      setIsEditModalOpen(false);
      setEditingAccount(null);
      setEditEmail('');
      setEditPassword('');
      setEditOwnerName('');
      setEditCompanyName('');
      await loadAccounts();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update account owner';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (account: AccountOwner) => {
    setEditingAccount(account);
    setEditEmail(account.email || '');
    setEditPassword('');
    setEditOwnerName(account.full_name || '');
    setEditCompanyName(account.company_name);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (accountId: string, currentStatus: 'active' | 'disabled') => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

    try {
      await updateAccountOwnerStatus(accountId, newStatus);
      toast.success(
        newStatus === 'disabled' ? 'Account disabled' : 'Account enabled'
      );
      await loadAccounts();
    } catch (error) {
      console.error('Error updating account status:', error);
      toast.error('Failed to update account status');
    }
  };

  const handleDeleteAccount = async (account: AccountOwner) => {
    try {
      await deleteAccountOwner(account.id);
      toast.success(`Account owner "${account.company_name}" permanently deleted`);
      setDeleteConfirmAccount(null);
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account owner');
    }
  };

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Owners Management</h1>
          <p className="text-slate-600 mt-1">Manage all account owners and their organizations</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 text-[#0F172A] px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Account Owner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Account Owners</p>
              <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Accounts</p>
              <p className="text-2xl font-bold text-slate-900">
                {accounts.filter((a) => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">
                {accounts.reduce((sum, a) => sum + (a.totalLeads || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Owner Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Workers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {account.company_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {account.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {account.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{account.totalWorkers || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{account.totalLeads || 0}</span>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(account)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(account.id, account.status!)}
                        className={`${
                          account.status === 'active'
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        } p-1`}
                        title={account.status === 'active' ? 'Disable' : 'Enable'}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmAccount(account)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {accounts.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No account owners yet. Add your first account owner!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-sm p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {account.company_name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {account.full_name}
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  account.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {account.status === 'active' ? 'Active' : 'Disabled'}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{account.email}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 font-medium">{account.totalWorkers || 0}</span>
                <span className="text-slate-500">Workers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 font-medium">{account.totalLeads || 0}</span>
                <span className="text-slate-500">Leads</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => openEditModal(account)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleStatus(account.id, account.status!)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  account.status === 'active'
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                <UserX className="w-4 h-4" />
                {account.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => setDeleteConfirmAccount(account)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No account owners yet. Add your first account owner!</p>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New Account Owner</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newAccountCompanyName}
                  onChange={(e) => setNewAccountCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  value={newAccountOwnerName}
                  onChange={(e) => setNewAccountOwnerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors duration-200"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Account Owner</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAccount(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingAccount.company_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingAccount.full_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingAccount.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Leave fields empty to keep current values. Only changed fields will be updated.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingAccount(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors duration-200"
                >
                  {isSubmitting ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Confirm Deletion</h2>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-2">
                You are about to permanently delete:
              </p>
              <p className="font-semibold text-red-900">
                {deleteConfirmAccount.company_name}
              </p>
              <p className="text-sm text-red-700 mt-3">
                This will also delete:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                <li>{deleteConfirmAccount.totalWorkers || 0} staff workers</li>
                <li>{deleteConfirmAccount.totalLeads || 0} leads</li>
                <li>All associated data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmAccount(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAccount(deleteConfirmAccount)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}