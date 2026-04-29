import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import api from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

function PaymentSimulation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  })

  const state = location.state

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">No booking data found</p>
            <Button className="w-full" onClick={() => navigate('/cars')}>
              Back to Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { car, days, originalPrice, discountedPrice, promo_code, pickup_date, return_date, carId, bookingId, dropoff_fee } = state
  const hasDiscount = discountedPrice < originalPrice
  const isExistingBooking = !!bookingId
  const safeDropoffFee = dropoff_fee || 0

  const handlePayment = async () => {
    setIsLoading(true)

    // Simulate payment processing for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsSuccess(true)

    // After showing success for a moment, create or update the booking
    setTimeout(async () => {
      try {
        if (isExistingBooking) {
          // Pay for existing booking
          await api.put(`/bookings/${bookingId}/pay`)
          navigate('/bookings', {
            state: { message: '✅ Payment successful! Booking confirmed.' }
          })
          
          // Show navbar notification
          if (window.addNotification) {
            window.addNotification('✅ Payment successful! Booking confirmed.', 'success')
          }
          window.dispatchEvent(new Event('bookingUpdated'))
        } else {
          // This shouldn't happen with the new flow, but keeping for compatibility
          await api.post('/bookings', {
            car_id: carId,
            pickup_date,
            return_date,
            promo_code: promo_code || undefined
          })
          navigate('/bookings', {
            state: { message: '✅ Booking confirmed! Payment successful.' }
          })
          
          // Show navbar notification
          if (window.addNotification) {
            window.addNotification('✅ Booking confirmed! Payment successful.', 'success')
          }
          window.dispatchEvent(new Event('bookingUpdated'))
        }
      } catch (err) {
        navigate('/bookings', {
          state: { message: err.response?.data?.message || 'Payment failed' }
        })
      }
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">Booking confirmed. Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Payment & Booking Confirmation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-semibold text-lg">{car.brand} {car.model}</p>
                <p className="text-sm text-muted-foreground">{car.type.toUpperCase()} • {car.location}</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Date</span>
                  <span className="font-medium">{format(parseISO(pickup_date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Date</span>
                  <span className="font-medium">{format(parseISO(return_date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per day</span>
                  <span className="font-medium">฿{car.price_per_day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({days} days)</span>
                  <span className="font-medium">฿{originalPrice - safeDropoffFee}</span>
                </div>
                {safeDropoffFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drop-off Fee</span>
                    <span className="font-medium text-orange-600">+฿{safeDropoffFee}</span>
                  </div>
                )}
                {hasDiscount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promo_code}) -30%</span>
                      <span>-฿{originalPrice - discountedPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">฿{discountedPrice}</span>
                    </div>
                    <p className="text-xs text-green-600 text-center">✅ Promo code applied!</p>
                  </>
                )}
                {!hasDiscount && (
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">฿{originalPrice}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>💳 Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                <Input
                  placeholder="John Doe"
                  value={formData.cardHolder}
                  onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry (MM/YY)</label>
                  <Input
                    placeholder="12/25"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <Input
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    disabled={isLoading}
                    type="password"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePayment}
                  disabled={isLoading || !formData.cardNumber || !formData.cardHolder || !formData.expiry || !formData.cvv}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    '💳 Simulate Payment & Confirm Booking'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/cars')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>

              <div className="pt-4 text-xs text-muted-foreground border-t">
                <p>🔒 This is a simulation. No real payment will be processed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PaymentSimulation
