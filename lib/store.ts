import { Project, Task, DashboardStats } from '../types';
import { mockProjects, mockTasks, mockStats } from '../services/mockData';

const STORAGE_KEYS = {
  PROJECTS: 'pms_projects',
  TASKS: 'pms_tasks',
  STATS: 'pms_stats',
  CURRENT_USER: 'pms_current_user'
};

// Helper for browser check
const isClient = typeof window !== 'undefined';

export function initializeStore() {
  if (!isClient) return;

  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(mockTasks));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(mockStats));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
      id: 'usr_curr',
      name: 'Alex Mercer',
      email: 'a.mercer@proflow.in',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: 'Engineering Lead'
    }));
  }
}

export function getProjects(): Project[] {
  if (!isClient) return mockProjects;
  initializeStore();
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : mockProjects;
}

export function saveProjects(projects: Project[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  
  // Recalculate stats based on projects & tasks
  recalculateStats();
}

export function getTasks(): Task[] {
  if (!isClient) return mockTasks;
  initializeStore();
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : mockTasks;
}

export function saveTasks(tasks: Task[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  recalculateStats();
}



export function getStats(): DashboardStats {
  if (!isClient) return mockStats;
  initializeStore();
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  return data ? JSON.parse(data) : mockStats;
}

export function getCurrentUser() {
  if (!isClient) return null;
  initializeStore();
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function saveCurrentUser(user: any) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function recalculateStats() {
  if (!isClient) return;
  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  
  const inProgressProjects = projects.filter((p: Project) => p.status === 'In Progress' || p.status === 'At Risk' || p.status === 'On Track').length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'Done').length;
  const pendingTasks = tasks.filter((t: Task) => t.status !== 'Done').length;

  const stats: DashboardStats = {
    totalProjects: projects.length,
    inProgressProjects,
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks
  };
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}
