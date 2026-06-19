export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  labels: string[];
  subtasks: SubTask[];
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'On Track' | 'At Risk' | 'Completed';
  startDate: string;
  endDate: string;
  progress: number;
  tasks: Task[];
  brief?: string;
}

export interface DashboardStats {
  totalProjects: number;
  inProgressProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}
