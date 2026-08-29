"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Play, Settings, LogOut, Menu, X } from 'lucide-react'
import { API_URL, logout } from '@/lib/auth'
import { useProjectStore } from '@/lib/store'

export default function Dashboard() {
  const router = useRouter()
  const { projects, setProjects } = useProjectStore()
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/api/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setProjects(response.data)
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_URL}/api/projects/`,
        {
          name: newProjectName,
          description: '',
          template: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setProjects([...projects, response.data])
      setNewProjectName('')
      setShowNewProjectModal(false)
      toast.success('Project created!')
      router.push(`/dashboard/project/${response.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top Navigation */}
      <nav className="bg-dark-900 border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl">VideoCreator AI</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-dark-400 hover:text-dark-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-dark-800">
              <button
                onClick={() => {
                  setShowNewProjectModal(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left py-2 px-2 hover:text-brand-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left py-2 px-2 hover:text-brand-primary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Projects</h1>
          <p className="text-dark-400">Create and manage your video projects</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-dark-400">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No projects yet</h2>
            <p className="text-dark-400 mb-8">Create your first project to get started</p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-semibold hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
              >
                <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden hover:border-brand-primary/50 transition h-full cursor-pointer group">
                  <div className="aspect-video bg-dark-800 flex items-center justify-center group-hover:bg-dark-700 transition">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-12 h-12 text-dark-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <p className="text-sm text-dark-400 truncate">
                      {project.description || 'No description'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-dark-800 rounded-full text-dark-400">
                        {project.status}
                      </span>
                      <span className="text-xs text-dark-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Video"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 px-4 py-2 border border-dark-700 rounded-lg hover:bg-dark-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
