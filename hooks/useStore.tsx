'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, Task, DashboardStats, Comment } from '../types';
import { apiClient } from '../lib/api';

interface StoreContextType {
  projects: Project[];
  tasks: Task[];

  stats: DashboardStats | null;
  currentUser: any;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProject: (project: Omit<Project, 'id' | 'progress' | 'tasks'>) => Promise<any>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'comments' | 'projectName'>) => Promise<any>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addComment: (taskId: string, commentText: string) => Promise<void>;

  updateCurrentUser: (updates: Partial<any>) => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('pms_current_user');
    if (!userStr) {
      setCurrentUser(null);
      setProjects([]);
      setTasks([]);

      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      const [projRes, taskRes, statsRes] = await Promise.all([
        apiClient.get('/projects'),
        apiClient.get('/tasks'),
        apiClient.get('/dashboard')
      ]);

      let fetchedTasks = [];
      let fetchedProjects = [];

      if (taskRes.data?.success) {
        fetchedTasks = taskRes.data.data;
        setTasks(fetchedTasks);
      }

      if (projRes.data?.success) {
        fetchedProjects = projRes.data.data.map((p: any) => {
          // Calculate dynamic progress
          const pTasks = fetchedTasks.filter((t: any) => String(t.projectId) === String(p.id));
          const completedCount = pTasks.filter((t: any) => String(t.status).toLowerCase() === 'done').length;
          const progress = pTasks.length > 0 ? Math.round((completedCount / pTasks.length) * 100) : 0;
          return {
            ...p,
            progress
          };
        });
        setProjects(fetchedProjects);
      }
      
      if (statsRes.data?.success) setStats(statsRes.data.data);

    } catch (err) {
      console.error('Failed to fetch data from API:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'progress' | 'tasks'>) => {
    try {
      const response = await apiClient.post('/projects', {
        name: project.name,
        description: project.description,
        brief: project.brief,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate
      });
      if (response.data?.success) {
        await refresh();
        return response.data.data;
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  }, [refresh]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const payload: any = { ...updates };

      await apiClient.put(`/projects/${id}`, payload);
      await refresh();
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  }, [refresh]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      await refresh();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }, [refresh]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'comments' | 'projectName'>) => {
    try {
      const response = await apiClient.post('/tasks', {
        projectId: String(task.projectId),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        labels: task.labels || [],
        subtasks: task.subtasks || []
      });
      if (response.data?.success) {
        await refresh();
        return response.data.data;
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }, [refresh]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const payload: any = { ...updates };

      await apiClient.put(`/tasks/${id}`, payload);
      await refresh();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }, [refresh]);

  const addComment = useCallback(async (taskId: string, commentText: string) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const comment: Comment = {
      id: `c_${Date.now()}`,
      userId: String(currentUser.id),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: commentText,
      timestamp: 'Just now'
    };

    try {
      await apiClient.put(`/tasks/${taskId}`, {
        comments: [...(task.comments || []), comment]
      });
      await refresh();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }, [currentUser, tasks, refresh]);

  const updateCurrentUser = useCallback(async (updates: Partial<any>) => {
    if (!currentUser || typeof window === 'undefined') return;
    const updated = { ...currentUser, ...updates };
    localStorage.setItem('pms_current_user', JSON.stringify(updated));
    setCurrentUser(updated);
  }, [currentUser]);

  return (
    <StoreContext.Provider value={{
      projects,
      tasks,

      stats,
      currentUser,
      loading,
      searchQuery,
      setSearchQuery,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      addComment,

      updateCurrentUser,
      refresh
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
