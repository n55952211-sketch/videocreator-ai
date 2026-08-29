"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Play, FileText, Mic, Subtitles, Download, Save, Settings } from 'lucide-react'
import { API_URL } from '@/lib/auth'
import { useProjectStore } from '@/lib/store'

interface Project {
  id: string
  name: string
  description?: string
  template?: string
  status: string
  created_at: string
  updated_at: string
}

interface Script {
  id: string
  content: string
  status: string
  created_at: string
}

interface Voiceover {
  id: string
  voice_id: string
  status: string
  audio_url?: string
  duration?: number
  created_at: string
}

interface Caption {
  id: string
  text: string
  start_time: number
  end_time: number
  position: string
}

interface Export {
  id: string
  status: string
  format: string
  resolution: string
  video_url?: string
  created_at: string
}

type TabType = 'script' | 'voiceover' | 'captions' | 'export'

export default function ProjectEditor() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('script')
  const [loading, setLoading] = useState(true)
  const [script, setScript] = useState<Script | null>(null)
  const [voiceover, setVoiceover] = useState<Voiceover | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [exports, setExports] = useState<Export[]>([])
  const [scriptContent, setScriptContent] = useState('')
  const [generatingScript, setGeneratingScript] = useState(false)
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('nova')
  const [exportFormat, setExportFormat] = useState('mp4')
  const [exportResolution, setExportResolution] = useState('1080p')
  const [exporting, setExporting] = useState(false)

  const voices = [
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'onyx', name: 'Onyx (Male)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (Male)' },
    { id: 'alloy', name: 'Alloy (Male)' },
    { id: 'shimmer', name: 'Shimmer (Female)' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProject(response.data)
      await Promise.all([
        fetchScript(token),
        fetchVoiceover(token),
        fetchCaptions(token),
        fetchExports(token),
      ])
    } catch (error: any) {
      console.error('Failed to fetch project:', error)
      toast.error('Failed to load project')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchScript = async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/scripts/?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data && response.data.length > 0) {
        const latestScript = response.data[0]
        setScript(latestScript)
        setScriptContent(latestScript.content)
      }
    } catch (error) {
      console.error('Failed to fetch script:', error)
    }
  }

  const fetchVoiceover = async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/voiceover/?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data && response.data.length > 0) {
        setVoiceover(response.data[0])
      }
    } catch (error) {
      console.error('Failed to fetch voiceover:', error)
    }
  }

  const fetchCaptions = async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/captions/?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCaptions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch captions:', error)
    }
  }

  const fetchExports = async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/exports`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExports(response.data || [])
    } catch (error) {
      console.error('Failed to fetch exports:', error)
    }
  }

  const handleSaveScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Script cannot be empty')
      return
    }

    setGeneratingScript(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_URL}/api/scripts/`,
        {
          project_id: projectId,
          content: scriptContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setScript(response.data)
      toast.success('Script saved successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save script')
    } finally {
      setGeneratingScript(false)
    }
  }

  const handleGenerateVoiceover = async () => {
    if (!script) {
      toast.error('Please save a script first')
      return
    }

    setGeneratingVoiceover(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_URL}/api/voiceover/generate`,
        {
          project_id: projectId,
          script_id: script.id,
          voice_id: selectedVoice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVoiceover(response.data)
      toast.success('Voiceover generation started!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate voiceover')
    } finally {
      setGeneratingVoiceover(false)
    }
  }

  const handleExportVideo = async () => {
    if (!voiceover || voiceover.status !== 'completed') {
      toast.error('Please complete voiceover generation first')
      return
    }

    setExporting(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_URL}/api/projects/${projectId}/exports`,
        {
          format: exportFormat,
          resolution: exportResolution,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExports([...exports, response.data])
      toast.success('Video export started! Check back shortly.')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start export')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-dark-400">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-dark-400">Project not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-dark-400 hover:text-dark-50 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Projects</span>
            </Link>
            <h1 className="text-2xl font-bold text-center flex-1">{project.name}</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('script')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'script'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-400 hover:text-dark-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Script
            </button>
            <button
              onClick={() => setActiveTab('voiceover')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'voiceover'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-400 hover:text-dark-50'
              }`}
            >
              <Mic className="w-4 h-4 inline mr-2" />
              Voiceover
            </button>
            <button
              onClick={() => setActiveTab('captions')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'captions'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-400 hover:text-dark-50'
              }`}
            >
              <Subtitles className="w-4 h-4 inline mr-2" />
              Captions
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'export'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-400 hover:text-dark-50'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Script Tab */}
        {activeTab === 'script' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Script Editor</h2>
              <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Write your video script here..."
                  className="w-full h-80 bg-dark-800 border border-dark-700 rounded-lg p-4 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-brand-primary resize-none"
                />
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleSaveScript}
                    disabled={generatingScript}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {generatingScript ? 'Saving...' : 'Save Script'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voiceover Tab */}
        {activeTab === 'voiceover' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Voiceover Generation</h2>
              {!script ? (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-8 text-center">
                  <p className="text-dark-400 mb-4">Please save a script first</p>
                </div>
              ) : (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                    >
                      {voices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {voiceover && (
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                      <p className="text-sm text-dark-400 mb-2">Status: {voiceover.status}</p>
                      {voiceover.audio_url && (
                        <div>
                          <audio controls className="w-full mt-2">
                            <source src={voiceover.audio_url} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateVoiceover}
                    disabled={generatingVoiceover || (voiceover?.status === 'processing')}
                    className="w-full px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    {generatingVoiceover
                      ? 'Generating...'
                      : voiceover?.status === 'completed'
                      ? 'Regenerate Voiceover'
                      : 'Generate Voiceover'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Captions Tab */}
        {activeTab === 'captions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Auto-Generated Captions</h2>
              {!voiceover || voiceover.status !== 'completed' ? (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-8 text-center">
                  <p className="text-dark-400 mb-4">Complete voiceover generation first</p>
                </div>
              ) : captions.length === 0 ? (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-8 text-center">
                  <p className="text-dark-400 mb-4">No captions yet. They will be generated automatically.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {captions.map((caption) => (
                    <div key={caption.id} className="bg-dark-900 border border-dark-800 rounded-lg p-4">
                      <p className="text-sm text-dark-400 mb-1">
                        {caption.start_time.toFixed(2)}s - {caption.end_time.toFixed(2)}s
                      </p>
                      <p className="text-dark-50">{caption.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Export Video</h2>
              {!voiceover || voiceover.status !== 'completed' ? (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-8 text-center">
                  <p className="text-dark-400 mb-4">Complete all previous steps first</p>
                </div>
              ) : (
                <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                      >
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                        <option value="mov">MOV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Resolution</label>
                      <select
                        value={exportResolution}
                        onChange={(e) => setExportResolution(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-primary"
                      >
                        <option value="720p">720p</option>
                        <option value="1080p">1080p (HD)</option>
                        <option value="2160p">2160p (4K)</option>
                        <option value="vertical_short">Vertical (9:16)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleExportVideo}
                    disabled={exporting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'Export Video'}
                  </button>
                </div>
              )}

              {/* Export History */}
              {exports.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Export History</h3>
                  <div className="space-y-3">
                    {exports.map((exp) => (
                      <div key={exp.id} className="bg-dark-900 border border-dark-800 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{exp.format.toUpperCase()} - {exp.resolution}</p>
                          <p className="text-sm text-dark-400">{exp.status}</p>
                        </div>
                        {exp.video_url && (
                          <a
                            href={exp.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-brand-primary rounded-lg hover:shadow-lg transition text-sm font-medium"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
