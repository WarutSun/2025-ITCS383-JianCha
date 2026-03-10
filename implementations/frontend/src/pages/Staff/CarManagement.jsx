import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

function CarManagement() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: 'sedan',
    license_plate: '',
    price_per_day: '',
    location: '',
    is_available: true,
  })

  const fetchCars = async () => {
    try {
      setLoading(true)
      const res = await api.get('/staff/cars')
      setCars(res.data)
      setError('')
    } catch (err) {
      setError('Failed to load cars')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  const handleOpenDialog = (car = null) => {
    if (car) {
      setEditingCar(car)
      setFormData({
        brand: car.brand,
        model: car.model,
        type: car.type,
        license_plate: car.license_plate,
        price_per_day: car.price_per_day,
        location: car.location,
        is_available: car.is_available,
      })
    } else {
      setEditingCar(null)
      setFormData({
        brand: '',
        model: '',
        type: 'sedan',
        license_plate: '',
        price_per_day: '',
        location: '',
        is_available: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCar(null)
    setMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'price_per_day' ? parseFloat(value) : value,
    })
  }

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value })
  }

  const handleAvailabilityChange = (value) => {
    setFormData({ ...formData, is_available: value === 'true' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (
      !formData.brand ||
      !formData.model ||
      !formData.license_plate ||
      !formData.price_per_day ||
      !formData.location
    ) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      if (editingCar) {
        await api.put(`/staff/cars/${editingCar.id}`, formData)
        setMessage('Car updated successfully')
      } else {
        await api.post('/staff/cars', formData)
        setMessage('Car added successfully')
      }

      setTimeout(() => {
        handleCloseDialog()
        fetchCars()
      }, 1000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving car')
    }
  }

  const handleDeleteCar = async (carId) => {
    try {
      await api.delete(`/staff/cars/${carId}`)
      setMessage('Car deleted successfully')
      setDeleteConfirm(null)
      fetchCars()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete car')
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Car Management</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(null)}>Add New Car</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCar ? 'Edit Car' : 'Add New Car'}
                </DialogTitle>
                <DialogDescription>
                  {editingCar
                    ? 'Update car details'
                    : 'Add a new car to the fleet'}
                </DialogDescription>
              </DialogHeader>

              {message && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-600 text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="brand"
                    placeholder="Brand (e.g., Toyota)"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    name="model"
                    placeholder="Model (e.g., Camry)"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Input
                  name="license_plate"
                  placeholder="License Plate"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    name="price_per_day"
                    type="number"
                    placeholder="Price per day"
                    value={formData.price_per_day}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                  />
                </div>

                <Input
                  name="location"
                  placeholder="Location (e.g., Bangkok)"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />

                {editingCar && (
                  <div>
                    <label className="text-sm font-medium">Availability</label>
                    <Select
                      value={formData.is_available ? 'true' : 'false'}
                      onValueChange={handleAvailabilityChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCar ? 'Update Car' : 'Add Car'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading cars...</p>
            </CardContent>
          </Card>
        ) : cars.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No cars available</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Cars ({cars.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price/Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map(car => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.brand}</TableCell>
                        <TableCell>{car.model}</TableCell>
                        <TableCell className="capitalize">{car.type}</TableCell>
                        <TableCell>{car.license_plate}</TableCell>
                        <TableCell>{car.location}</TableCell>
                        <TableCell className="font-semibold">฿{car.price_per_day}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              car.is_available
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {car.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(car)}
                          >
                            Edit
                          </Button>
                          {deleteConfirm === car.id ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCar(car.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfirm(car.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CarManagement
