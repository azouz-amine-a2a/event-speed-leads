import { useState, useEffect } from 'react';
import { useEvent } from '../../context/EventContext';
import { Download, Filter, Calendar, Building, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAccountOwners, fetchLeads, fetchAllEvents } from '../../../lib/api';
import type { AccountOwner, Lead } from '../../types/database';

export function SuperAdminDataExport() {
  const { eventName: currentEventName, eventHistory } = useEvent();
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedAccountOwner, setSelectedAccountOwner] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [accounts, setAccounts] = useState<AccountOwner[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    currentEventLeads: 0,
    archivedLeads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [accountsData, eventsData] = await Promise.all([
          fetchAccountOwners(),
          fetchAllEvents(),
        ]);

        if (isMounted) {
          setAccounts(accountsData);
          setAllEvents(eventsData);

          // Calculate statistics
          const totalLeads = accountsData.reduce((sum, acc) => sum + (acc.totalLeads || 0), 0);
          const currentEvent = eventsData.find((e: any) => e.event_name === currentEventName);

          setStats({
            totalLeads,
            currentEventLeads: currentEvent?.leads_count || 0,
            archivedLeads: totalLeads - (currentEvent?.leads_count || 0),
          });
        }
      } catch (error) {
        // Silently handle session errors during logout
        if (error instanceof Error && error.message.includes('No active session')) {
          return;
        }
        if (isMounted) {
          console.error('Error loading data export page:', error);
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
  }, [currentEventName]);

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
      'Account Owner',
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
        lead.owner?.full_name || '',
        lead.event?.event_name || '',
        lead.event?.industry || '', // Industry from event - empty if not set
        lead.created_at || '',
      ].map(escapeCsvField).join(','));
    }

    return csvRows.join('\n');
  };

  const handleFilteredExport = async () => {
    setIsExporting(true);

    try {
      let accountOwnerId: string | undefined;
      let eventId: string | undefined;

      if (selectedAccountOwner !== 'all') {
        accountOwnerId = selectedAccountOwner;
      }

      if (selectedEvent !== 'all') {
        const event = allEvents.find((e) => e.event_name === selectedEvent);
        if (event) {
          eventId = event.id;
        }
      }

      const leadsData = await fetchLeads(accountOwnerId, eventId);

      // Create and download CSV file
      const csvContent = createCSV(leadsData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let filename = 'leads-export';
      if (selectedEvent !== 'all') {
        filename += `-${selectedEvent.replace(/\s+/g, '-').toLowerCase()}`;
      }
      if (selectedAccountOwner !== 'all') {
        const owner = accounts.find((o) => o.id === selectedAccountOwner);
        if (owner) {
          filename += `-${owner.company_name.replace(/\s+/g, '-').toLowerCase()}`;
        }
      }
      filename += `-${new Date().toISOString().split('T')[0]}.csv`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      let description = 'Filtered data exported successfully';
      if (selectedEvent !== 'all' && selectedAccountOwner !== 'all') {
        const owner = accounts.find((o) => o.id === selectedAccountOwner);
        description = `Data from ${owner?.company_name} at "${selectedEvent}" exported`;
      } else if (selectedAccountOwner !== 'all') {
        const owner = accounts.find((o) => o.id === selectedAccountOwner);
        description = `Data from ${owner?.company_name} exported`;
      } else if (selectedEvent !== 'all') {
        description = `Data from "${selectedEvent}" exported`;
      }

      toast.success('Export successful!', { description });
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentEvent = async () => {
    setIsExporting(true);

    try {
      const currentEvent = allEvents.find((e) => e.event_name === currentEventName);
      
      const leadsData = await fetchLeads(undefined, currentEvent?.id);

      const csvContent = createCSV(leadsData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentEventName.replace(/\s+/g, '-').toLowerCase()}-${
        new Date().toISOString().split('T')[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Current event data exported!', {
        description: `"${currentEventName}" leads downloaded as CSV.`,
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export current event data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);

    try {
      const leadsData = await fetchLeads();

      const csvContent = createCSV(leadsData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Complete export successful!', {
        description: `All leads from ${allEvents.length} event(s) downloaded as CSV.`,
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export all data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportByEvent = async (event: any) => {
    setIsExporting(true);

    try {
      const leadsData = await fetchLeads(undefined, event.id);

      const csvContent = createCSV(leadsData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.event_name.replace(/\s+/g, '-').toLowerCase()}-${
        new Date().toISOString().split('T')[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Event data exported!', {
        description: `"${event.event_name}" leads downloaded as CSV.`,
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export event data');
    } finally {
      setIsExporting(false);
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Data Export</h1>
        <p className="text-slate-600 mt-1">
          Export lead data with advanced filtering options
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileDown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Leads (All Time)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Current Event</p>
              <p className="text-lg font-bold text-slate-900 truncate">{currentEventName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Account Owners</p>
              <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Export Current Event */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Export Current Event
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Download all leads from the currently active event: <strong>{currentEventName}</strong>
              </p>
              <button
                onClick={handleExportCurrentEvent}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Current Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Export All Data */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileDown className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Export Complete Database
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Download all leads from all events and all account owners
              </p>
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 text-[#0F172A] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0F172A]"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export All Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filtering */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Filter className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Advanced Filtering</h2>
            <p className="text-sm text-slate-600">
              Apply filters to export specific data segments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Event Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {allEvents.map((event) => (
                <option key={event.id} value={event.event_name}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Owner Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Account Owner
            </label>
            <select
              value={selectedAccountOwner}
              onChange={(e) => setSelectedAccountOwner(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Account Owners</option>
              {accounts.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.company_name} ({owner.full_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleFilteredExport}
          disabled={isExporting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export Filtered Data
            </>
          )}
        </button>
      </div>

      {/* Event-wise Export Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Event-wise Export</h2>
            <p className="text-sm text-slate-600">
              Export leads for each event individually
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allEvents.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {event.event_name}
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Download all leads from this event
                  </p>
                  <button
                    onClick={() => handleExportByEvent(event)}
                    disabled={isExporting}
                    className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 text-[#0F172A] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0F172A]"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Export
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}