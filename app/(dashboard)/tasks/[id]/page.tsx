'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  Tag, 
  User, 
  ExternalLink,
  ChevronDown,
  Paperclip,
  Smile
} from 'lucide-react';
import { useStore } from '../../../../hooks/useStore';
import Link from 'next/link';
import Avatar from '../../../../components/Avatar';

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const { id: taskId } = use(params);

  const { 
    tasks, 
    projects, 
    updateTask, 
    addComment,
    loading 
  } = useStore();

  const [commentText, setCommentText] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-sm select-none">
        <h2 className="text-lg font-bold text-slate-900">Task Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The task might have been deleted or the URL is invalid.</p>
        <button onClick={() => router.back()} className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const project = projects.find(p => p.id === task.projectId);

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(task.id, commentText);
    setCommentText('');
  };

  const handleMarkComplete = () => {
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done';
    updateTask(task.id, { status: nextStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Main Grid: Info on left (Span 2), Properties panel on right (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left main area (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 border border-blue-100 rounded-md">
                {task.status}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {task.id}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {task.title}
            </h1>

            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm active:scale-[0.98] transition-all ${
                task.status === 'Done'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{task.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete'}</span>
            </button>
          </div>

          {/* Context / Description */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Context & Details</h3>
            <div className="text-xs text-slate-600 leading-relaxed space-y-4 font-medium whitespace-pre-line">
              {task.description}
            </div>
          </div>

          {/* Subtasks (Implementation Steps) */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Implementation Steps</h3>
            
            {task.subtasks.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No subtasks defined.</p>
            ) : (
              <div className="space-y-2.5">
                {task.subtasks.map(sub => (
                  <label 
                    key={sub.id} 
                    className="flex items-center gap-3 p-3 border border-slate-50 hover:bg-slate-50/50 rounded-lg cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4.5 h-4.5 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold ${
                      sub.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}>
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Activity</h3>
              <span className="text-[10px] text-slate-400 font-semibold">{task.comments.length} comments</span>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-4">
              <Avatar
                memberId="usr_curr"
                name="Me"
                size="md"
                className="ring-2 ring-slate-50"
              />
              <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-all bg-slate-50/20">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 resize-none font-medium"
                />
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button type="button" className="p-1 hover:bg-slate-50 hover:text-slate-600 rounded transition-all">
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-50 hover:text-slate-600 rounded transition-all">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-[0.98]"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 bg-slate-50/50 border border-slate-100/50 rounded-xl text-xs">
                  <Avatar
                    memberId={comment.userId}
                    name={comment.userName}
                    size="md"
                    className="ring-2 ring-slate-100"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span className="text-slate-800 font-bold">{comment.userName}</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right side panel properties (Span 1) */}
        <div className="space-y-6">
          
          {/* Properties Block */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-50">Properties</h3>
            
            <div className="space-y-4 text-xs font-medium">
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="text-slate-800 font-semibold">{task.status}</span>
              </div>

              {/* Priority */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Priority</span>
                <span className={`px-2 py-0.5 border rounded-md text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Due Date</span>
                <span className="text-slate-800 font-semibold">{task.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Project Context Block */}
          {project && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-50">Project Context</h3>
              
              <div className="flex gap-3 items-center">
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                  {project.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">{project.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{project.description}</span>
                </div>
              </div>

              <Link 
                href={`/projects/${project.id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all"
              >
                <span>View Project Board</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
