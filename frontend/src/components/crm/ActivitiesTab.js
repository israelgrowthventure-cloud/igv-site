/**
 * ActivitiesTab - Timeline des activités CRM
 * Design system: HubSpot/Salesforce Lightning
 * Affiche notes, emails, appels, réunions
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Mail, Phone, MessageSquare, 
  Calendar, User, Clock, ChevronRight, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const ActivitiesTab = ({ t }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Types d'activités avec icônes et couleurs
  const activityTypes = {
    note: { 
      label: 'Note', 
      icon: MessageSquare, 
      color: 'bg-gray-100 text-gray-800',
      iconColor: 'text-gray-600'
    },
    email: { 
      label: 'Email', 
      icon: Mail, 
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600'
    },
    call: { 
      label: 'Appel', 
      icon: Phone, 
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600'
    },
    meeting: { 
      label: 'Réunion', 
      icon: Calendar, 
      color: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-600'
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Endpoint à implémenter côté backend
      const data = await api.get('/api/crm/activities', {
        params: { type: typeFilter !== 'all' ? typeFilter : undefined }
      });
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Fallback: montrer des activités de demo
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper par date
  const groupByDate = (activities) => {
    const groups = {};
    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      const dateKey = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupByDate(filteredActivities);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activités</h2>
            <p className="text-sm text-gray-600 mt-1">
              Timeline complète des interactions
            </p>
          </div>
          
          <button
            onClick={() => toast.info('Fonctionnalité à venir')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            Nouvelle activité
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les types</option>
            {Object.entries(activityTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucune activité trouvée</p>
            <p className="text-sm text-gray-500">
              Les activités apparaîtront ici au fur et à mesure
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date} className="mb-8">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-300"></div>
                  <span className="text-sm font-medium text-gray-600">{date}</span>
                  <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                {/* Activities list */}
                <div className="space-y-3">
                  {activities.map(activity => {
                    const typeInfo = activityTypes[activity.type] || activityTypes.note;
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div
                        key={activity._id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${typeInfo.iconColor}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{activity.subject}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>

                            {/* Meta */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{activity.user_email || 'Système'}</span>
                              </div>
                              
                              {activity.lead_id && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <span>Lead #{activity.lead_id.slice(0, 8)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesTab;
