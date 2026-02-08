import { useState, useEffect } from 'react';
import { Download, FileDown, CheckCircle2 } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchWorkers, fetchLeads, fetchCurrentEvent } from '../../../lib/api';
import { toast } from 'sonner';
import type { Worker, Lead } from '../../types/database';

export function DataExport() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [workersData, event] = await Promise.all([
        fetchWorkers(user!.id),
        fetchCurrentEvent(),
      ]);
      setWorkers(workersData);
      setCurrentEvent(event);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('export.errorLoading') || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to escape CSV fields
  const escapeCsvField = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Helper function to create CSV from leads data
  const createCSV = (leads: Lead[]): string => {
    const headers = [
      'Full Name',
      'Company',
      'Email',
      'Phone',
      'Profile', // NEW: Professional role (Engineer, Manager, etc.)
      'Geographic Zone',
      'Client Manager',
      'Interest During Visit',
      'Comments',
      'Collected By',
      'Event',
      'Industry', // NEW: Industry from event
      'Created At',
    ];

    const csvRows = [headers.map(escapeCsvField).join(',')];

    for (const lead of leads) {
      csvRows.push([
        lead.full_name || '',
        lead.company || '',
        lead.email || '',
        lead.phone || '',
        lead.profile || '', // Profile field - empty if not set
        lead.geographic_zone || '',
        lead.client_manager || '',
        lead.interest_during_visit || '',
        lead.comments || '',
        lead.collector?.full_name || '',
        lead.event?.event_name || '',
        lead.event?.industry || '', // Industry from event - empty if not set
        lead.created_at || '',
      ].map(escapeCsvField).join(','));
    }

    return csvRows.join('\n');
  };

  const handleExportAll = async () => {
    setIsExporting(true);

    try {
      const leadsData = await fetchLeads(user!.id, currentEvent?.id);

      // Create and download CSV file
      const csvData = createCSV(leadsData);

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('export.allExported') || 'All leads exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(t('export.errorExporting') || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportByWorker = async () => {
    if (selectedWorker === 'all') {
      handleExportAll();
      return;
    }

    setIsExporting(true);

    try {
      const leadsData = await fetchLeads(user!.id, currentEvent?.id, selectedWorker);

      // Create and download CSV file
      const csvData = createCSV(leadsData);

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const worker = workers.find((w) => w.id === selectedWorker);
      a.download = `leads-${worker?.full_name.replace(/\s+/g, '-').toLowerCase()}-${
        new Date().toISOString().split('T')[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('export.workerExported') || 'Worker data exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(t('export.errorExporting') || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('export.title') || 'Data Export'}
        </h1>
        <p className="text-slate-600 mt-1">
          {t('export.subtitle') || 'Download your lead data in CSV format'}
        </p>
      </div>

      {/* Export All Leads */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileDown className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {t('export.exportAll') || 'Export All Leads'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {t('export.exportAllDesc') ||
                'Download all leads collected by your staff for the current event'}
            </p>
            {currentEvent && (
              <p className="text-sm text-slate-500 mb-4">
                {t('export.currentEvent') || 'Current Event'}: <strong>{currentEvent.event_name}</strong>
              </p>
            )}
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 text-[#0F172A] px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0F172A]"></div>
                  {t('export.exporting') || 'Exporting...'}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export.downloadAll') || 'Download All'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export by Worker */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {t('export.exportByWorker') || 'Export by Staff Worker'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {t('export.exportByWorkerDesc') ||
                'Filter and download leads collected by a specific staff member'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('export.selectWorker') || 'Select Worker'}
              </label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('export.allWorkers') || 'All Workers'}</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name} ({worker.leadsCollected || 0}{' '}
                    {t('export.leads') || 'leads'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportByWorker}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('export.exporting') || 'Exporting...'}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export.downloadFiltered') || 'Download Filtered Data'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>{t('export.note') || 'Note'}:</strong>{' '}
          {t('export.noteDesc') ||
            'CSV files include all lead details: contact information, company data, geographic zone, industry sector, and collection timestamps.'}
        </p>
      </div>
    </div>
  );
}