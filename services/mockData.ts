import { Project, Task, DashboardStats } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the corporate marketing website to improve conversion and brand representation.',
    brief: 'We are redesigning our website from the ground up to reflect our new brand guidelines. Key results include a 25% increase in lead signups, load time reduction under 1.5s, and a fully accessible responsive interface.',
    status: 'In Progress',
    startDate: 'Oct 12, 2023',
    endDate: 'Jan 15, 2024',
    progress: 68,
    tasks: []
  },
  {
    id: 'proj_2',
    name: 'Mobile App MVP',
    description: 'Build and launch the initial version of our iOS and Android client portal application.',
    brief: 'The mobile app MVP will allow clients to track project statuses, view invoices, and communicate with representatives directly. The focus is on usability, core functional value, and light/dark theme aesthetics.',
    status: 'On Track',
    startDate: 'Nov 01, 2023',
    endDate: 'Feb 28, 2024',
    progress: 82,
    tasks: []
  },
  {
    id: 'proj_3',
    name: 'Q3 Marketing Campaign',
    description: 'Strategy, design, and execution of multi-channel outreach and advertising campaigns.',
    brief: 'Our Q3 outreach aims to drive enterprise leads via target search ads, social promotions, and email newsletters. Deliverables include ad copy, asset design templates, and performance reporting integrations.',
    status: 'At Risk',
    startDate: 'Aug 15, 2023',
    endDate: 'Nov 30, 2023',
    progress: 35,
    tasks: []
  }
];

export const mockTasks: Task[] = [
  {
    id: 'TSK-1021',
    projectId: 'proj_1',
    projectName: 'Website Redesign',
    title: 'Review final homepage wireframes',
    description: 'Conduct design critique and capture feedback on the interactive wireframes and layout structures.\nFocus areas:\n- Desktop vs. mobile layout spacing\n- CTA buttons visual weight\n- Hero section typography hierarchy',
    status: 'In Progress',
    priority: 'High',
    dueDate: 'Today',
    labels: ['Design', 'Feedback'],
    subtasks: [
      { id: 'sub_1', title: 'Schedule review meeting', completed: true },
      { id: 'sub_2', title: 'Compile feedback from designers', completed: false },
      { id: 'sub_3', title: 'Update Figma mockups with feedback', completed: false }
    ],
    comments: [
      {
        id: 'com_1',
        userId: 'mem_4',
        userName: 'David Kim',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        text: 'Let\'s keep the header menu options minimal. Clean navigation is crucial.',
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: 'TSK-2015',
    projectId: 'proj_2',
    projectName: 'Mobile App MVP',
    title: 'Approve API endpoint documentation',
    description: 'Ensure Swagger documentation is complete for authentication, user profiles, and notifications endpoints.',
    status: 'To Do',
    priority: 'Medium',
    dueDate: 'Tomorrow',
    labels: ['Backend', 'Documentation'],
    subtasks: [
      { id: 'sub_4', title: 'Validate request payload schemas', completed: true },
      { id: 'sub_5', title: 'Verify rate limiting response headers', completed: false }
    ],
    comments: []
  },
  {
    id: 'TSK-3042',
    projectId: 'proj_3',
    projectName: 'Q3 Marketing Campaign',
    title: 'Draft copy for social media ads',
    description: 'Create engaging headline and body copy variants for LinkedIn and Twitter advertising campaigns.',
    status: 'To Do',
    priority: 'Low',
    dueDate: 'Oct 12, 2023',
    labels: ['Marketing', 'Copywriting'],
    subtasks: [],
    comments: []
  }
];

export const mockStats: DashboardStats = {
  totalProjects: 24,
  inProgressProjects: 12,
  totalTasks: 156,
  completedTasks: 98,
  pendingTasks: 58
};
