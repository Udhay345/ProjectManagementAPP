'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../../../hooks/useStore';
import Link from 'next/link';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id: projectId } = use(params);
  
  const { 
    projects, 
    tasks, 
    updateProject, 
    deleteProject, 
    addTask, 
    updateTask,
    loading 
  } = useStore();

  // Project Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBrief, setEditBrief] = useState('');
  const [editStatus, setEditStatus] = useState<any>('In Progress');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Task Creation Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-sm select-none">
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The project might have been deleted or the URL is invalid.</p>
        <Link href="/projects" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:underline">
          Go back to projects
        </Link>
      </div>
    );
  }

  // Get tasks belonging to this project
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'Done');
  const pendingTasks = projectTasks.filter(t => t.status !== 'Done');

  // Trigger editing values
  const startEdit = () => {
    setEditName(project.name);
    setEditDescription(project.description);
    setEditBrief(project.brief || '');
    setEditStatus(project.status);
    setEditStartDate(project.startDate);
    setEditEndDate(project.endDate);
    setIsEditing(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.id, {
      name: editName,
      description: editDescription,
      brief: editBrief,
      status: editStatus,
      startDate: editStartDate,
      endDate: editEndDate
    });
    setIsEditing(false);
  };

  const handleDeleteProject = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProject(project.id);
      router.push('/projects');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      projectId: project.id,
      title: taskTitle,
      description: taskDesc,
      status: 'To Do',
      priority: taskPriority,
      dueDate: taskDueDate || 'Oct 24, 2023',
      labels: ['Feature'],
      subtasks: []
    });

    // Reset
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskDueDate('');
    setTaskModalOpen(false);
  };

  const toggleTaskStatus = (task: any) => {
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done';
    updateTask(task.id, { status: nextStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'On Track': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'At Risk': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Completed': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="text-left space-y-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {project.startDate} - {project.endDate}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleDeleteProject}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Info Blocks: Progress & Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress block */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Progress</h3>
          <div className="space-y-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{project.progress || 0}%</span>
            <span className="text-xs text-slate-500 font-medium block">completed</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-50">
            <span>{projectTasks.length} Tasks</span>
            <span className="text-blue-600">On Track</span>
          </div>
        </div>

        {/* Project Brief block */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm md:col-span-2 space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Brief</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {project.brief || 'No brief description written yet. Click "Edit" to write a project summary.'}
          </p>
        </div>

      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tasks</h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
              {projectTasks.length}
            </span>
          </div>
          
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          {projectTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No tasks found. Click &quot;New Task&quot; to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8FAFC]/55 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6 w-12 text-center">Status</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 w-32">Status</th>
                    <th className="py-3 px-4 w-32">Priority</th>
                    <th className="py-3 px-4 w-36">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {projectTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 group transition-all">
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={task.status === 'Done'}
                          onChange={() => toggleTaskStatus(task)}
                          className="w-4.5 h-4.5 border border-slate-300 rounded focus:ring-blue-500 text-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        <Link href={`/tasks/${task.id}`} className="hover:text-blue-600 transition-all block">
                          {task.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${
                          task.status === 'Done' 
                            ? 'bg-slate-50 text-slate-400 border-slate-200' 
                            : task.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-md ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-semibold">
                        {task.dueDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-base">Edit Project Details</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Brief</label>
                <textarea
                  value={editBrief}
                  rows={4}
                  onChange={(e) => setEditBrief(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Start & End Dates</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="text"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-base">Add New Task</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design System Audit"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Add details, contexts, instructions, code examples..."
                  value={taskDesc}
                  rows={3}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="text"
                    placeholder="Oct 24, 2023"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="w-1/2 py-2 px-4 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
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
}
