import React, { useState } from 'react';
import { DollarSign, Calendar, TrendingUp, Loader2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const PipelineTab = ({ data, onRefresh, t }) => {
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const stages = [
    'INITIAL_INTEREST',
    'INFO_REQUESTED',
    'FIRST_CALL_SCHEDULED',
    'PITCH_DELIVERED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'VERBAL_COMMITMENT',
    'WON'
  ];

  const handleStageChange = async (oppId, newStage) => {
    try {
      setLoadingAction(true);
      await api.put(`/api/crm/pipeline/opportunities/${oppId}`, { stage: newStage });
      toast.success(t('admin.crm.pipeline.stage_updated'));
      await onRefresh();
      setSelectedOpp(null);
    } catch (error) {
      toast.error(t('admin.crm.errors.stage_failed'));
    } finally {
      setLoadingAction(false);
    }
  };

  const stageNames = {
    INITIAL_INTEREST: t('admin.crm.pipeline.stages.initial_interest'),
    INFO_REQUESTED: t('admin.crm.pipeline.stages.info_requested'),
    FIRST_CALL_SCHEDULED: t('admin.crm.pipeline.stages.first_call'),
    PITCH_DELIVERED: t('admin.crm.pipeline.stages.pitch_delivered'),
    PROPOSAL_SENT: t('admin.crm.pipeline.stages.proposal_sent'),
    NEGOTIATION: t('admin.crm.pipeline.stages.negotiation'),
    VERBAL_COMMITMENT: t('admin.crm.pipeline.stages.verbal_commitment'),
    WON: t('admin.crm.pipeline.stages.won')
  };

  // Use default empty data instead of showing spinner
  const pipelineData = data || { stages: {}, summary: {} };

  return (
    <div className="space-y-4">
      {!selectedOpp ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-sm text-gray-600">{t('admin.crm.pipeline.total_opps')}</p>
              <p className="text-2xl font-bold mt-1">{pipelineData.summary?.total_opportunities || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-sm text-gray-600">{t('admin.crm.pipeline.total_value')}</p>
              <p className="text-2xl font-bold mt-1">${(pipelineData.summary?.total_value || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-sm text-gray-600">{t('admin.crm.pipeline.avg_deal')}</p>
              <p className="text-2xl font-bold mt-1">${(pipelineData.summary?.average_deal_size || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-sm text-gray-600">{t('admin.crm.pipeline.close_rate')}</p>
              <p className="text-2xl font-bold mt-1">{pipelineData.summary?.win_rate || 0}%</p>
            </div>
          </div>

          <div className="space-y-6">
            {stages.map(stage => {
              const opps = pipelineData.stages?.[stage] || [];
              const stageValue = opps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
              return (
                <div key={stage} className="bg-white rounded-lg shadow border">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{stageNames[stage]}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{opps.length} {t('admin.crm.pipeline.opportunities')}</span>
                        <span className="font-semibold text-green-600">${stageValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {opps.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">{t('admin.crm.common.no_data')}</p>
                    ) : (
                      <div className="space-y-2">
                        {opps.map(opp => (
                          <div key={opp.opportunity_id} onClick={() => setSelectedOpp(opp)} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{opp.title}</h4>
                                <p className="text-sm text-gray-600">{opp.company_name || opp.contact_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">${(opp.estimated_value || 0).toLocaleString()}</p>
                                {opp.expected_close_date && (
                                  <p className="text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {new Date(opp.expected_close_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedOpp.title}</h2>
              <p className="text-gray-600">{selectedOpp.company_name || selectedOpp.contact_name}</p>
            </div>
            <button onClick={() => setSelectedOpp(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">{t('admin.crm.pipeline.current_stage')}</label>
              <select value={selectedOpp.stage} onChange={(e) => handleStageChange(selectedOpp.opportunity_id, e.target.value)} disabled={loadingAction} className="w-full mt-1 px-3 py-2 border rounded-lg">
                {stages.map(s => <option key={s} value={s}>{stageNames[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">{t('admin.crm.pipeline.estimated_value')}</label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-xl font-bold">{(selectedOpp.estimated_value || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {selectedOpp.description && (
            <div className="mt-6">
              <label className="text-sm text-gray-600">{t('admin.crm.pipeline.description')}</label>
              <p className="mt-2 p-4 bg-gray-50 rounded-lg">{selectedOpp.description}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">{t('admin.crm.pipeline.stage_history')}</h3>
            <div className="space-y-2">
              {selectedOpp.stage_history?.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{stageNames[entry.stage]}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.changed_at).toLocaleString()} • {entry.changed_by}</p>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-sm">{t('admin.crm.common.no_history')}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineTab;
