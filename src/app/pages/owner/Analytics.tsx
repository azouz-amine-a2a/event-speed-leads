import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { fetchWorkers, fetchLeads, fetchCurrentEvent } from '../../../lib/api';
import type { Worker } from '../../types/database';

export function Analytics() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get current event first
      const event = await fetchCurrentEvent();

      // Fetch workers with lead counts filtered by current event
      const workersData = await fetchWorkers(user!.id, event?.id);
      setWorkers(workersData);

      // Fetch leads for chart data
      const leadsData = await fetchLeads(user!.id, event?.id);

      // Group leads by date for chart
      const leadsByDate = leadsData.reduce((acc: any, lead) => {
        const date = new Date(lead.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartDataArray = Object.entries(leadsByDate).map(([date, count]) => ({
        date,
        leads: count,
      }));

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('analytics.title') || 'Analytics & Insights'}
        </h1>
        <p className="text-slate-600 mt-1">
          {t('analytics.subtitle') || 'Track performance and trends'}
        </p>
      </div>

      {/* Leads Over Time Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t('analytics.leadsOverTime') || 'Leads Collected Over Time'}
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t('analytics.noData') || 'No data available yet. Start collecting leads!'}
            </p>
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {t('analytics.topPerformers') || 'Top Performing Staff'}
        </h2>

        {workers.length > 0 ? (
          <div className="space-y-4">
            {workers
              .sort((a, b) => (b.leadsCollected || 0) - (a.leadsCollected || 0))
              .slice(0, 5)
              .map((worker, index) => (
                <div key={worker.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-slate-400'
                          : index === 2
                          ? 'bg-orange-600'
                          : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{worker.full_name}</div>
                      <div className="text-sm text-slate-500">
                        {worker.status === 'active'
                          ? t('analytics.active') || 'Active'
                          : t('analytics.disabled') || 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{worker.leadsCollected || 0}</div>
                    <div className="text-xs text-slate-500">
                      {t('analytics.leadsCollected') || 'leads'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t('analytics.noWorkers') || 'No workers yet. Add workers to see performance.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
