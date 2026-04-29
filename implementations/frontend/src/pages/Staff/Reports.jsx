import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Card, CardContent } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

function Reports() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/staff/reports/reservations')
      .then(res => setRows(res.data))
      .catch(() => setError('Failed to load reports'))
  }, [])

  const totalRevenue = rows.reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0)
  const confirmed = rows.filter(r => r.status === 'confirmed').length
  const pending = rows.filter(r => r.status === 'pending').length
  const cancelled = rows.filter(r => r.status === 'cancelled').length
  const completed = rows.filter(r => r.status === 'completed').length

  const handlePrint = () => window.print()

  const handleReturnCar = async (bookingId) => {
    if (!window.confirm('Mark this car as returned and complete the booking?')) return
    try {
      await api.put(`/staff/return/${bookingId}`)
      toast.success('Car returned successfully')
      // Refresh list
      const res = await api.get('/staff/reports/reservations')
      setRows(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return car')
    }
  }

  return (
    <>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-header { display: block !important; }
          .print-stats { border: 1px solid #ccc !important; background: #f9f9f9 !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000 !important; padding: 8px; font-size: 12px; color: black !important; }
          th { background: #eee !important; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex justify-between items-center mb-6 no-print">
            <h1 className="text-4xl font-bold">Reservation Reports</h1>
            <button
              onClick={handlePrint}
              style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              🖨️ Print Report
            </button>
          </div>

          {/* Print Header (hidden on screen) */}
          <div className="print-header" style={{ display: 'none', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Travel Naja — Reservation Report</h1>
            <p style={{ color: '#555' }}>Generated: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style={{ color: '#555' }}>Total Reservations: {rows.length}</p>
          </div>

          {error && <p className="text-destructive mb-4">{error}</p>}

          {/* Stats Summary */}
          <div className="print-stats grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 rounded-lg bg-muted">
            <div className="text-center">
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">฿{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Return</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="no-print">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.user_name}</TableCell>
                      <TableCell>{r.user_email}</TableCell>
                      <TableCell>{r.brand} {r.model}</TableCell>
                      <TableCell>{r.pickup_date?.split('T')[0]}</TableCell>
                      <TableCell>{r.return_date?.split('T')[0]}</TableCell>
                      <TableCell className="font-semibold">฿{parseFloat(r.total_price).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          r.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                          r.status === 'completed' ? 'bg-purple-500/10 text-purple-500' :
                          r.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="no-print">
                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => handleReturnCar(r.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Return Car
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}

export default Reports