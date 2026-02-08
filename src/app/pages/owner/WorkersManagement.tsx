import { useState, useEffect } from 'react';
import { Worker } from '../../types/database';
import { Plus, Edit2, UserX, X, Users, Trash2, KeyRound, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchWorkers, createStaffWorker, updateWorkerStatus, updateWorker, deleteWorker } from '../../../lib/api';

export function WorkersManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');

  // Form state for editing
  const [editWorkerName, setEditWorkerName] = useState('');
  const [editWorkerEmail, setEditWorkerEmail] = useState('');
  const [editWorkerPassword, setEditWorkerPassword] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadWorkers();
    }
  }, [user?.id]);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWorkers(user!.id);
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error(t('workers.errorLoading') || 'Failed to load workers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createStaffWorker({
        email: newWorkerEmail,
        password: newWorkerPassword,
        fullName: newWorkerName,
      });

      toast.success(t('workers.workerAdded') || 'Staff worker added successfully!');
      setIsAddModalOpen(false);
      setNewWorkerName('');
      setNewWorkerEmail('');
      setNewWorkerPassword('');
      await loadWorkers();
    } catch (error: any) {
      console.error('Error creating worker:', error);
      toast.error(error.message || t('workers.errorAdding') || 'Failed to add worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setIsSubmitting(true);

    try {
      const updateData: any = { workerId: selectedWorker.id };
      
      if (editWorkerName && editWorkerName !== selectedWorker.full_name) {
        updateData.fullName = editWorkerName;
      }
      
      if (editWorkerEmail) {
        updateData.email = editWorkerEmail;
      }
      
      if (editWorkerPassword) {
        updateData.password = editWorkerPassword;
      }

      await updateWorker(updateData);
      toast.success(t('workers.workerUpdated') || 'Worker updated successfully!');
      setIsEditModalOpen(false);
      setSelectedWorker(null);
      setEditWorkerName('');
      setEditWorkerEmail('');
      setEditWorkerPassword('');
      await loadWorkers();
    } catch (error: any) {
      console.error('Error updating worker:', error);
      toast.error(error.message || t('workers.errorUpdating') || 'Failed to update worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (workerId: string, currentStatus: 'active' | 'disabled') => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

    try {
      await updateWorkerStatus(workerId, newStatus);
      toast.success(
        newStatus === 'disabled'
          ? t('workers.workerDisabled') || 'Worker disabled'
          : t('workers.workerEnabled') || 'Worker enabled'
      );
      await loadWorkers();
    } catch (error) {
      console.error('Error updating worker status:', error);
      toast.error(t('workers.errorUpdating') || 'Failed to update worker status');
    }
  };

  const handleDeleteWorker = async () => {
    if (!selectedWorker) return;

    setIsSubmitting(true);

    try {
      await deleteWorker(selectedWorker.id);
      toast.success(t('workers.workerDeleted') || 'Worker deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedWorker(null);
      await loadWorkers();
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      toast.error(error.message || t('workers.errorDeleting') || 'Failed to delete worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditWorkerName(worker.full_name);
    setEditWorkerEmail('');
    setEditWorkerPassword('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CE1E6] mx-auto"></div>
          <p className="mt-4 text-[#6B7280]">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {t('workers.title') || 'Workers Management'}
          </h1>
          <p className="text-[#6B7280] mt-1">
            {t('workers.subtitle') || 'Manage your event staff and their access'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 text-[#0F172A] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t('workers.addWorker') || 'Add Worker'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#5CE1E6]/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-[#5CE1E6]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">{t('workers.totalWorkers') || 'Total Workers'}</p>
              <p className="text-2xl font-bold text-[#0F172A]">{workers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{t('workers.activeWorkers') || 'Active Workers'}</p>
              <p className="text-2xl font-bold text-slate-900">
                {workers.filter((w) => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{t('workers.disabledWorkers') || 'Disabled Workers'}</p>
              <p className="text-2xl font-bold text-slate-900">
                {workers.filter((w) => w.status === 'disabled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {workers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{worker.full_name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {worker.leadsCollected || 0} {t('workers.leadsCollected') || 'leads collected'}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  worker.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {worker.status === 'active'
                  ? t('workers.active') || 'Active'
                  : t('workers.disabled') || 'Disabled'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openEditModal(worker)}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-[#5CE1E6] text-[#5CE1E6] rounded-lg hover:bg-[#5CE1E6]/10 transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t('workers.edit') || 'Edit'}</span>
              </button>

              <button
                onClick={() => handleToggleStatus(worker.id, worker.status)}
                className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors duration-200 ${
                  worker.status === 'active'
                    ? 'border-orange-300 text-orange-600 hover:bg-orange-50'
                    : 'border-green-300 text-green-600 hover:bg-green-50'
                }`}
              >
                {worker.status === 'active' ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('workers.disable') || 'Disable'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('workers.enable') || 'Enable'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openDeleteModal(worker)}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t('workers.deleteAction') || 'Delete'}</span>
              </button>
            </div>
          </div>
        ))}

        {workers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t('workers.noWorkers') || 'No workers yet. Add your first worker!'}</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('workers.name') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('workers.leadsCollected') || 'Leads Collected'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('workers.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('workers.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{worker.full_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {worker.leadsCollected || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        worker.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {worker.status === 'active'
                        ? t('workers.active') || 'Active'
                        : t('workers.disabled') || 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(worker)}
                        className="text-[#5CE1E6] hover:text-[#5CE1E6]/80 flex items-center gap-1 text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>{t('workers.edit') || 'Edit'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(worker.id, worker.status)}
                        className={`${
                          worker.status === 'active'
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        } flex items-center gap-1 text-sm font-medium`}
                      >
                        {worker.status === 'active' ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>{t('workers.disable') || 'Disable'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('workers.enable') || 'Enable'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openDeleteModal(worker)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{t('workers.deleteAction') || 'Delete'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {workers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t('workers.noWorkers') || 'No workers yet. Add your first worker!'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Worker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {t('workers.addWorker') || 'Add New Worker'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.fullName') || 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.email') || 'Email'} *
                </label>
                <input
                  type="email"
                  value={newWorkerEmail}
                  onChange={(e) => setNewWorkerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.password') || 'Password'} *
                </label>
                <input
                  type="password"
                  value={newWorkerPassword}
                  onChange={(e) => setNewWorkerPassword(e.target.value)}
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
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors duration-200"
                >
                  {isSubmitting
                    ? t('common.adding') || 'Adding...'
                    : t('workers.addWorker') || 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {isEditModalOpen && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {t('workers.editWorker') || 'Edit Worker'}
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedWorker(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.fullName') || 'Full Name'}
                </label>
                <input
                  type="text"
                  value={editWorkerName}
                  onChange={(e) => setEditWorkerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={selectedWorker.full_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.email') || 'Email'} ({t('common.optional') || 'Optional'})
                </label>
                <input
                  type="email"
                  value={editWorkerEmail}
                  onChange={(e) => setEditWorkerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="new-email@example.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('workers.emailChangeNote') || 'Leave blank to keep current email'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('workers.newPassword') || 'New Password'} ({t('common.optional') || 'Optional'})
                </label>
                <input
                  type="password"
                  value={editWorkerPassword}
                  onChange={(e) => setEditWorkerPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('workers.passwordChangeNote') || 'Leave blank to keep current password'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedWorker(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors duration-200"
                >
                  {isSubmitting
                    ? t('common.saving') || 'Saving...'
                    : t('workers.saveChanges') || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {t('workers.deleteWorker') || 'Delete Worker'}
              </h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedWorker(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {t('workers.deleteWarning') || 'This action cannot be undone'}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {t('workers.deleteMessage') || 'Are you sure you want to delete'} <strong>{selectedWorker.full_name}</strong>?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedWorker(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleDeleteWorker}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors duration-200"
              >
                {isSubmitting
                  ? t('common.deleting') || 'Deleting...'
                  : t('workers.confirmDelete') || 'Delete Worker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}