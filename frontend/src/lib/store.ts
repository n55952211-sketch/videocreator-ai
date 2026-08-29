import { create } from 'zustand'

interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_active: boolean
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}))

interface Project {
  id: string
  name: string
  description?: string
  template?: string
  status: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

interface ProjectStore {
  projects: Project[]
  selectedProject: Project | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  setSelectedProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  setSelectedProject: (project) => set({ selectedProject: project }),
}))
