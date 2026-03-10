import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { getUserRole } from '../lib/auth'
import { ShoppingCart, X, User } from 'lucide-react'
import api from '../services/api'
import Logo from './Logo'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = getUserRole()
  const [pendingCount, setPendingCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const addNotification = (message, type = 'success') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Expose addNotification globally so other components can use it
  useEffect(() => {
    window.addNotification = addNotification
    return () => {
      delete window.addNotification
    }
  }, [])

  useEffect(() => {
    const fetchPendingBookings = async () => {
      if (!token) return
      
      try {
        const res = await api.get('/bookings')
        const pendingBookings = res.data.filter(booking => booking.status === 'pending')
        setPendingCount(pendingBookings.length)
      } catch (err) {
        console.error('Failed to fetch pending bookings:', err)
      }
    }

    fetchPendingBookings()
  }, [token])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Logo />
              Travel Naja
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/cars" className="text-foreground hover:text-primary transition">
                Cars
              </Link>
              {token && role === 'staff' && (
                <Link to="/staff" className="text-foreground hover:text-primary transition">
                  Staff
                </Link>
              )}
              {token ? (
                <>
                  <Link to="/bookings" className="text-foreground hover:text-primary transition relative">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      My Bookings
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <Link to="/profile" className="text-foreground hover:text-primary transition">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </div>
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="h-9 px-3 text-sm inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground text-foreground transition-colors">
                    Login
                  </Link>
                  <Button size="sm">
                    <Link to="/register" className="text-primary-foreground">
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notification System */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-2 ${
              notification.type === 'success'
                ? 'bg-green-500 text-white border-green-600'
                : notification.type === 'error'
                ? 'bg-red-500 text-white border-red-600'
                : 'bg-blue-500 text-white border-blue-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Navbar
