import { useState, useEffect } from 'react';
import { Users, TrendingUp, UserCheck } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchLeads, fetchStatistics, fetchCurrentEvent } from '../../../lib/api';
import type { Lead } from '../../types/database';

export function OwnerOverview() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ totalLeads: 0, totalWorkers: 0 });
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

      // Fetch current event
      const event = await fetchCurrentEvent();
      setCurrentEvent(event);

      // Fetch leads for current event and account owner
      const leadsData = await fetchLeads(
        user!.id,
        event?.id
      );
      setLeads(leadsData);

      // Fetch statistics
      const statsData = await fetchStatistics(user!.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentEventLeads = leads;
  const totalLeads = currentEventLeads.length;
  const totalWorkers = stats.totalWorkers;
  const recentLeads = currentEventLeads.slice(0, 5);

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">{t('overview.title') || 'Dashboard Overview'}</h1>
        <p className="text-[#6B7280] mt-1">
          {t('overview.subtitle') || 'Track your lead collection progress'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#5CE1E6]/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#5CE1E6]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">{t('overview.totalLeads') || 'Total Leads'}</p>
              <p className="text-2xl font-bold text-[#0F172A]">{totalLeads}</p>
              {currentEvent && (
                <p className="text-xs text-[#6B7280] mt-1">
                  {t('overview.currentEvent') || 'Current Event'}: {currentEvent.event_name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#5CE1E6]/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-[#5CE1E6]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">{t('overview.activeWorkers') || 'Active Workers'}</p>
              <p className="text-2xl font-bold text-[#0F172A]">{totalWorkers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#5CE1E6]/10 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-[#5CE1E6]" />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">{t('overview.avgPerWorker') || 'Avg. per Worker'}</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {totalWorkers > 0 ? Math.round(totalLeads / totalWorkers) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-[#5CE1E6]/20">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {t('overview.recentLeads') || 'Recent Leads'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#EAFBFC]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  {t('overview.contact') || 'Contact'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  {t('overview.company') || 'Company'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                  {t('overview.zone') || 'Zone'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  {t('overview.collectedBy') || 'Collected By'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                  {t('overview.date') || 'Date'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5CE1E6]/20">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#EAFBFC]">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#0F172A]">{lead.full_name}</div>
                    <div className="text-sm text-[#6B7280]">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0F172A] hidden md:table-cell">
                    {lead.company}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0F172A] hidden lg:table-cell">
                    {lead.geographic_zone}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0F172A]">
                    {lead.collector?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280] hidden md:table-cell">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentLeads.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-[#6B7280]/30 mx-auto mb-4" />
              <p className="text-[#6B7280]">
                {t('overview.noLeads') || 'No leads collected yet for this event.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}