import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' })
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile')
      setProfile(res.data)
      setName(res.data.name)
    } catch (err) {
      toast.error('Failed to load profile')
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login')
    fetchProfile()
  }, [navigate])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setLoading(true)
    try {
      await api.put('/users/profile', { name: name.trim() })
      toast.success('✅ Profile updated successfully')
      setProfile(prev => ({ ...prev, name: name.trim() }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your account information</p>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Input
                type="text"
                value={profile.role}
                disabled
                className="bg-muted capitalize"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading || name.trim() === profile.name}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile