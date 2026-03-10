import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog'

function Dashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, availableCars: 0 })
  const [error, setError] = useState('')
  const [resetting, setResetting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/staff/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
  }, [])

  const handleResetDatabase = async () => {
    setResetting(true)
    try {
      await api.delete('/staff/reset')
      setError('')
      // Refresh stats after reset
      const res = await api.get('/staff/dashboard')
      setStats(res.data)
      alert('Database reset successfully!')
    } catch {
      setError('Failed to reset database')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Staff Dashboard</h1>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.totalBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">฿{stats.totalRevenue}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Available Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats.availableCars}</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => navigate('/staff/cars')}
              className="w-full"
              variant="outline"
            >
              🚗 Manage Cars
            </Button>
            <Button
              onClick={() => navigate('/staff/reports')}
              className="w-full"
              variant="outline"
            >
              📊 View Reports
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={resetting} className="w-full">
                  🔄 {resetting ? 'Resetting...' : 'Reset Database'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all bookings and reset car availability. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetDatabase} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Reset Database
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
