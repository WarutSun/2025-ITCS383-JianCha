import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, isPast, addDays, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Calendar } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Badge } from '../components/ui/badge'
import { getDropoffFee, VALID_PROMO_CODES, PROMO_DISCOUNT_PERCENT, isValidPromoCode } from '../lib/pricing'

function Cars() {
  const [carsData, setCarsData] = useState([])
  const [form, setForm] = useState({ pickup_date: '', return_date: '', promo_code: '', dropoff_location: '' })
  const [selectedCar, setSelectedCar] = useState(null)
  const [message, setMessage] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [openPickup, setOpenPickup] = useState(false)
  const [openReturn, setOpenReturn] = useState(false)
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [currentCarReviews, setCurrentCarReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const navigate = useNavigate()

  // Filter and search states
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [filterPromotion, setFilterPromotion] = useState(false)
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    api.get('/cars').then(res => setCarsData(res.data))
  }, [])

  const calculateDays = (pickup, returnDate) => {
    if (!pickup || !returnDate) return 0
    const p = typeof pickup === 'string' ? parseISO(pickup) : pickup
    const r = typeof returnDate === 'string' ? parseISO(returnDate) : returnDate
    return differenceInDays(r, p)
  }

  const getDaysFromDates = () => calculateDays(form.pickup_date, form.return_date)

  const getDiscountedPrice = (originalPrice) => {
    if (!isValidPromoCode(form.promo_code)) {
      return originalPrice
    }
    return Math.round(originalPrice * (1 - PROMO_DISCOUNT_PERCENT / 100))
  }

  // Filter and search logic
  const filteredAndSortedCars = useMemo(() => {
    let result = carsData.filter(car => {
      // Search filter
      const searchLower = searchText.toLowerCase()
      const matchesSearch = 
        car.brand.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower)

      // Type filter
      const matchesType = filterType === 'all' || car.type === filterType

      // Location filter
      const matchesLocation = filterLocation === 'all' || car.location === filterLocation

      // Promotion filter
      const matchesPromotion = !filterPromotion || car.is_promotion == 1 || car.is_promotion === true

      return matchesSearch && matchesType && matchesLocation && matchesPromotion
    })

    // Sorting
    if (sortBy === 'low-to-high') {
      result = result.sort((a, b) => a.price_per_day - b.price_per_day)
    } else if (sortBy === 'high-to-low') {
      result = result.sort((a, b) => b.price_per_day - a.price_per_day)
    }

    return result
  }, [carsData, searchText, filterType, filterLocation, filterPromotion, sortBy])

  const handlePromoChange = (code) => {
    setForm({ ...form, promo_code: code })
    if (code === '') {
      setPromoMessage('')
      return
    }
    if (isValidPromoCode(code)) {
      setPromoMessage('✅ Promo applied! 30% discount')
    } else {
      setPromoMessage('❌ Invalid promo code')
    }
  }

  const handleBook = async (carId) => {
    if (!localStorage.getItem('token')) return navigate('/login')
    
    const days = getDaysFromDates()
    if (days > 30) {
      setMessage('Rental period cannot exceed 30 days. Please contact Admin for long-term rentals.')
      return
    }

    try {
      const response = await api.post('/bookings', {
        car_id: carId,
        pickup_date: form.pickup_date,
        return_date: form.return_date,
        promo_code: form.promo_code || undefined,
        dropoff_location: form.dropoff_location || undefined
      })
      
      toast.success('Booking initialized! Redirecting to payment...', {
        duration: 3000,
        icon: '💳'
      })
      
      // Show navbar notification
      if (window.addNotification) {
        window.addNotification('💳 Booking initialized!', 'success')
      }
      
      window.dispatchEvent(new Event('bookingUpdated'))
      
      const car = carsData.find(c => c.id === carId)
      const dropoffFee = (form.dropoff_location && form.dropoff_location.trim().toLowerCase() !== car.location.toLowerCase()) ? getDropoffFee(car.location, form.dropoff_location.trim()) : 0
      
      const originalPrice = (days * car.price_per_day) + dropoffFee
      const finalPrice = response.data.total_price
      
      navigate('/payment', {
        state: {
          bookingId: response.data.booking_id,
          carId: car.id,
          pickup_date: form.pickup_date,
          return_date: form.return_date,
          car: {
            brand: car.brand,
            model: car.model,
            type: car.type,
            location: car.location,
            price_per_day: car.price_per_day
          },
          days: days,
          originalPrice: originalPrice,
          discountedPrice: finalPrice,
          dropoff_fee: dropoffFee,
          promo_code: form.promo_code || null
        }
      })
      
      // Reset form and close modal
      setSelectedCar(null)
      setForm({ pickup_date: '', return_date: '', promo_code: '', dropoff_location: '' })
      setPromoMessage('')
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    }
  }

  const handleViewReviews = async (carId) => {
    setLoadingReviews(true)
    setReviewsModalOpen(true)
    try {
      const res = await api.get(`/reviews/car/${carId}`)
      setCurrentCarReviews(res.data)
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setLoadingReviews(false)
    }
  }

  // getDropoffFee is now imported from '../lib/pricing'

  // Get unique locations for filter dropdown
  const locations = ['all', ...new Set(carsData.map(car => car.location))]
  const allDropoffLocations = [...new Set([...carsData.map(car => car.location), 'Pattaya', 'Hua Hin'])]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Available Cars</h1>
        <span className="text-muted-foreground mb-8 block">Select a car and choose your rental dates</span>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
            {message}
          </div>
        )}

        {/* Filter and Search Bar */}
        <Card className="mb-8 p-6">
          <div className="space-y-4">
            {/* Row 1: Search and Type Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by brand or model..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2 flex-wrap">
                {['all', 'sedan', 'suv', 'van'].map(type => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="capitalize"
                  >
                    {type === 'all' ? 'All' : type.toUpperCase()}
                  </Button>
                ))}
                <Button
                  variant={filterPromotion ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPromotion(!filterPromotion)}
                  className="capitalize"
                >
                  🏷️ Promotion
                </Button>
              </div>
            </div>

            {/* Row 2: Location, Sort, and Count */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium block mb-1">Sort by Price</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="default">Default</option>
                  <option value="low-to-high">Low to High</option>
                  <option value="high-to-low">High to Low</option>
                </select>
              </div>

              <div className="text-sm font-medium">
                Showing {filteredAndSortedCars.length} car{filteredAndSortedCars.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carsData.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <span className="text-muted-foreground">Loading cars...</span>
            </div>
          ) : filteredAndSortedCars.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <span className="text-muted-foreground">No cars found matching your criteria</span>
            </div>
          ) : (
            filteredAndSortedCars.map(car => {
              const days = getDaysFromDates()
              const dropoffFee = (selectedCar === car.id && form.dropoff_location && form.dropoff_location.trim().toLowerCase() !== car.location.toLowerCase() && days > 0) ? getDropoffFee(car.location, form.dropoff_location.trim()) : 0
              const originalPrice = days > 0 ? (days * car.price_per_day) + dropoffFee : 0
              const discountedPrice = days > 0 ? (days * car.discounted_price) + dropoffFee : 0
              const hasDiscount = car.is_promotion && car.discounted_price < car.price_per_day

              return (
                <Card key={car.id} className={`overflow-hidden hover:border-primary transition ${car.is_promotion ? 'border-green-500 border-2' : ''}`}>
                  <div className="h-40 bg-muted flex items-center justify-center text-4xl">
                    🚗
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {car.brand} {car.model}
                        </CardTitle>
                        {car.review_count > 0 && (
                          <span className="text-sm text-yellow-600 font-medium">
                            ⭐ {car.avg_rating} ({car.review_count} review{car.review_count > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      {car.is_promotion && (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          🏷️ SALE
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <span className="block">Type: {car.type}</span>
                      <span className="block">Location: {car.location}</span>
                      <span className="block font-semibold text-primary">
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-muted-foreground">฿{car.price_per_day}</span>
                            <span className="text-green-600 font-bold ml-2">฿{car.discounted_price}/day</span>
                          </>
                        ) : (
                          <>฿{car.price_per_day}/day</>
                        )}
                      </span>
                    </div>

                    {selectedCar === car.id ? (
                      <div className="space-y-3 pt-2">
                        {/* Pickup Date Picker */}
                        <Popover open={openPickup} onOpenChange={setOpenPickup}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {form.pickup_date ? format(parseISO(form.pickup_date), 'dd MMM yyyy') : 'Pickup date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                            <div className="bg-white rounded-lg p-2 text-black">
                              <Calendar
                                mode="single"
                                selected={form.pickup_date ? parseISO(form.pickup_date) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setForm({ ...form, pickup_date: format(date, 'yyyy-MM-dd') })
                                    setOpenPickup(false)
                                  }
                                }}
                                disabledDates={(date) => isPast(date) && date.toDateString() !== new Date().toDateString()}
                                captionLayout="buttons"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Return Date Picker */}
                        <Popover open={openReturn} onOpenChange={setOpenReturn}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {form.return_date ? format(parseISO(form.return_date), 'dd MMM yyyy') : 'Return date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                            <div className="bg-white rounded-lg p-2 text-black">
                              <Calendar
                                mode="single"
                                selected={form.return_date ? parseISO(form.return_date) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setForm({ ...form, return_date: format(date, 'yyyy-MM-dd') })
                                    setOpenReturn(false)
                                  }
                                }}
                                disabledDates={(date) => {
                                  const minDate = form.pickup_date ? addDays(parseISO(form.pickup_date), 1) : new Date()
                                  return isPast(date) || date < minDate
                                }}
                                captionLayout="buttons"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Display Days and Warning */}
                        {days > 0 && (
                          <div className="text-sm p-2 bg-muted rounded">
                            <span className="font-semibold">{days} day{days !== 1 ? 's' : ''}</span>
                            {days > 30 && (
                              <div className="mt-2 p-2 bg-destructive/10 border border-destructive text-destructive rounded text-xs">
                                ⚠️ Rental period cannot exceed 30 days
                              </div>
                            )}
                          </div>
                        )}

                        {/* Promo Code Input */}
                        <div className="space-y-1">
                          <Input
                            type="text"
                            placeholder="Enter promo code"
                            value={form.promo_code}
                            onChange={e => handlePromoChange(e.target.value)}
                            className="uppercase"
                          />
                          {promoMessage && (
                            <span className={`text-xs block ${promoMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                              {promoMessage}
                            </span>
                          )}
                        </div>

                        {/* Drop-off Location Input */}
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Drop-off Location</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={form.dropoff_location || car.location}
                            onChange={e => setForm({ ...form, dropoff_location: e.target.value })}
                          >
                            <option value={car.location}>{car.location} (Same as pick-up)</option>
                            {allDropoffLocations.filter(l => l !== car.location).map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                          {form.dropoff_location && form.dropoff_location.trim().toLowerCase() !== car.location.toLowerCase() && (
                            <span className="text-xs text-orange-600 block font-medium">
                              +฿{getDropoffFee(car.location, form.dropoff_location.trim())} drop-off fee will be applied
                            </span>
                          )}
                        </div>

                        {/* Price Preview */}
                        {days > 0 && (
                          <div className="text-sm p-2 bg-muted rounded">
                            <span className="block text-muted-foreground">
                              Total: {hasDiscount ? (
                                <>
                                  <span className="line-through">฿{originalPrice}</span>
                                  <span className="text-green-600 font-bold ml-2">฿{discountedPrice}</span>
                                </>
                              ) : (
                                <>฿{originalPrice}</>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Booking Button */}
                        <Button 
                          className="w-full" 
                          onClick={() => handleBook(car.id)}
                          disabled={days <= 0 || days > 30}
                        >
                          {days > 30 ? 'Exceeds 30 day limit' : 'Add to Cart'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedCar(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Button className="flex-1" onClick={() => setSelectedCar(car.id)}>
                          Book Now
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => handleViewReviews(car.id)}>
                          Reviews
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Reviews Modal */}
        {reviewsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[80vh] flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>Customer Reviews</CardTitle>
                  <button 
                    className="text-muted-foreground hover:text-foreground text-lg leading-none p-1" 
                    onClick={() => setReviewsModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1">
                {loadingReviews ? (
                  <p className="text-center py-8 text-muted-foreground">Loading reviews...</p>
                ) : currentCarReviews.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No reviews for this car yet.</p>
                ) : (
                  <div className="space-y-4">
                    {currentCarReviews.map(review => (
                      <div key={review.id} className="p-4 bg-muted rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">{review.user_name}</span>
                          <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-sm mb-2">{review.comment || <span className="text-muted-foreground italic">No comment provided</span>}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cars
