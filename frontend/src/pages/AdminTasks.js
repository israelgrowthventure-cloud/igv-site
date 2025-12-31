import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, Calendar, User, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminTasks = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, done
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to_email: '',
    due_date: '',
    priority: 'B'
  });

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/crm/tasks${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load tasks');
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/crm/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null
        })
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        assigned_to_email: '',
        due_date: '',
        priority: 'B'
      });
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_completed: !isCompleted })
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      toast.success(isCompleted ? 'Task marked as open' : 'Task completed!');
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://igv-cms-backend.onrender.com'}/api/crm/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      toast.success('Task deleted');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    return {
      'A': 'text-red-600',
      'B': 'text-yellow-600',
      'C': 'text-green-600'
    }[priority] || 'text-gray-600';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg ${filter === 'open' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-lg ${filter === 'done' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Done
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`bg-white rounded-lg shadow p-4 ${task.is_completed ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(task._id, task.is_completed)}
                className="mt-1"
              >
                {task.is_completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      Priority {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {task.assigned_to_email && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assigned_to_email}
                    </span>
                  )}
                  
                  {task.due_date && (
                    <span className={`flex items-center gap-1 ${isOverdue(task.due_date) && !task.is_completed ? 'text-red-600 font-semibold' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue(task.due_date) && !task.is_completed && ' (OVERDUE)'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tasks {filter !== 'all' ? `(${filter})` : ''}</p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to (email)
                </label>
                <input
                  type="email"
                  value={newTask.assigned_to_email}
                  onChange={(e) => setNewTask({...newTask, assigned_to_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A (High)</option>
                    <option value="B">B (Medium)</option>
                    <option value="C">C (Low)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
