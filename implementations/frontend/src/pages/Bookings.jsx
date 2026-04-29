import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'

function Bookings() {
  const [bookings, setBookings] = useState([])
  const [cancelingId, setCancelingId] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const navigate = useNavigate()
  const location = useLocation()

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings')
      setBookings(res.data)
    } catch (err) {
      toast.error('Failed to load bookings')
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login')
    fetchBookings()
  }, [navigate])

  useEffect(() => {
    // Show success message from navigation state
    if (location.state?.message) {
      toast.success(location.state.message)
      // Clear the state to prevent showing again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const handleReturnBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to return this car? This will complete your booking.')) return

    try {
      await api.put(`/bookings/${bookingId}/return`)
      toast.success('Car returned successfully')
      window.dispatchEvent(new Event('bookingUpdated'))
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return car')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    setCancelingId(bookingId)
    try {
      await api.delete(`/bookings/${bookingId}`)
      toast.success('Booking cancelled successfully')
      window.dispatchEvent(new Event('bookingUpdated'))
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelingId(null)
    }
  }

  const handlePayNow = (booking) => {
    // Navigate to payment page with booking details
    navigate('/payment', {
      state: {
        bookingId: booking.id,
        carId: booking.car_id,
        pickup_date: booking.pickup_date,
        return_date: booking.return_date,
        car: {
          brand: booking.brand,
          model: booking.model,
          type: booking.type,
          location: booking.location,
          price_per_day: (booking.total_price - (booking.dropoff_fee || 0)) / Math.ceil((new Date(booking.return_date) - new Date(booking.pickup_date)) / (1000 * 60 * 60 * 24))
        },
        days: Math.ceil((new Date(booking.return_date) - new Date(booking.pickup_date)) / (1000 * 60 * 60 * 24)),
        originalPrice: booking.total_price,
        discountedPrice: booking.total_price,
        dropoff_fee: booking.dropoff_fee || 0,
        promo_code: null
      }
    })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews', {
        booking_id: selectedBooking.id,
        car_id: selectedBooking.car_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      toast.success('Review submitted successfully')
      setReviewModalOpen(false)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground mb-8">View and manage your car rental reservations</p>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You haven't made any bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.brand} {b.model}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-muted-foreground text-xs">Pick-up: <span className="text-foreground">{b.pickup_location || b.location}</span></div>
                          <div className="text-muted-foreground text-xs">Drop-off: <span className="text-foreground">{b.dropoff_location || b.location}</span></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-muted-foreground text-xs">From: <span className="text-foreground">{b.pickup_date?.split('T')[0]}</span></div>
                          <div className="text-muted-foreground text-xs">To: <span className="text-foreground">{b.return_date?.split('T')[0]}</span></div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">฿{b.total_price}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 
                          b.status === 'completed' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {b.status === 'completed' && !b.has_review && (
                          <button
                            className="mr-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors"
                            onClick={() => {
                              setSelectedBooking(b)
                              setReviewForm({ rating: 5, comment: '' })
                              setReviewModalOpen(true)
                            }}
                          >
                            ⭐ Leave Review
                          </button>
                        )}
                        {b.status === 'completed' && b.has_review === 1 && (
                          <span className="text-sm text-muted-foreground mr-2">Reviewed ✓</span>
                        )}
                        {b.status === 'pending' && (
                          <button
                            className="mr-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors"
                            onClick={() => handlePayNow(b)}
                          >
                            💳 Pay Now
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            className="mr-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors"
                            onClick={() => handleReturnBooking(b.id)}
                          >
                            🚗 Return Car
                          </button>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancelingId === b.id}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            {cancelingId === b.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Review {selectedBooking?.brand} {selectedBooking?.model}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating (1-5 stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Comment</label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="How was the car and service?"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value.slice(0, 500) })}
                      maxLength={500}
                      rows={4}
                    />
                    <p className={`text-xs mt-1 text-right ${reviewForm.comment.length >= 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {reviewForm.comment.length}/500
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Review</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings
