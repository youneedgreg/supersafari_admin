/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, Plus, Search, User, Mail, Phone, MapPin, FileText, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Define the client type for TypeScript
interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  status: string;
  arrival_date?: string;
  departure_date?: string;
  tour_name?: string;
  adults?: number;
  children?: number;
  additional_info?: string;
  passport?: string;
  flight_details?: string;
}

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState("planning")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    passport: "",
    tourName: "",
    arrival: "",
    departure: "",
    flightDetails: "",
    adults: "",
    children: "",
    partnerDetails: "",
    diet: "",
    nextOfKin: "",
    emailOfKin: "",
  })
  const [notes, setNotes] = useState("")

  // Fetch clients when tab changes or search query updates
  useEffect(() => {
    fetchClients()
  }, [activeTab, searchQuery])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const url = new URL('/api/clients', window.location.origin)
      if (activeTab) {
        url.searchParams.append('status', activeTab)
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery)
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === 'OK') {
        setClients(data.clients)
      } else {
        console.error('Error fetching clients:', data.message)
        toast.error('Failed to load clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleAddClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.status === 'OK') {
        toast.success("Client added successfully", {
          description: "The new client has been added to the planning stage.",
        })
        
        // Reset form and close dialog
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          passport: "",
          tourName: "",
          arrival: "",
          departure: "",
          flightDetails: "",
          adults: "",
          children: "",
          partnerDetails: "",
          diet: "",
          nextOfKin: "",
          emailOfKin: "",
        })
        setIsAddClientOpen(false)
        
        // Refresh clients
        fetchClients()
      } else {
        toast.error("Failed to add client", {
          description: data.message,
        })
      }
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error("Failed to add client")
    }
  }

  const handleOpenNotes = (client: Client) => {
    setSelectedClient(client)
    setNotes(client.additional_info || "")
    setIsNotesOpen(true)
  }

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()
      
      if (data.status === 'OK') {
        toast.success("Notes saved successfully")
        setIsNotesOpen(false)
        fetchClients()
      } else {
        toast.error("Failed to save notes")
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error("Failed to save notes")
    }
  }

  const handleChangeStatus = async (clientId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      
      if (data.status === 'OK') {
        toast.success(`Client moved to ${newStatus}`)
        fetchClients()
      } else {
        toast.error("Failed to update client status")
      }
    } catch (error) {
      console.error('Error updating client status:', error)
      toast.error("Failed to update client status")
    }
  }

  const statusColors = {
    planning: "bg-blue-100 text-blue-800",
    confirmed: "bg-amber-100 text-amber-800",
    booked: "bg-purple-100 text-purple-800",
    completed: "bg-emerald-100 text-emerald-800",
    canceled: "bg-red-100 text-red-800",
    archived: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-500 mt-1">Manage all your safari clients</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-white max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter the client details to create a new reservation.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Client Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Full name or group name" 
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Email address" 
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        placeholder="Phone number" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Country" 
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="passport">Passport Number</Label>
                      <Input 
                        id="passport" 
                        placeholder="Passport Number" 
                        value={formData.passport}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="tourName">Tour Name</Label>
                      <Input 
                        id="tourName" 
                        placeholder="Tour Name" 
                        value={formData.tourName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="arrival">Arrival Date</Label>
                      <Input 
                        id="arrival" 
                        type="date" 
                        value={formData.arrival}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="departure">Departure Date</Label>
                      <Input 
                        id="departure" 
                        type="date" 
                        value={formData.departure}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="flightDetails">Flight Details</Label>
                      <Input 
                        id="flightDetails" 
                        placeholder="Flight Details" 
                        value={formData.flightDetails}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="adults">Number of Adults</Label>
                      <Input 
                        id="adults" 
                        type="number" 
                        min="1" 
                        placeholder="Number of adults" 
                        value={formData.adults}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="children">Number of Children</Label>
                      <Input 
                        id="children" 
                        type="number" 
                        min="0" 
                        placeholder="Number of children" 
                        value={formData.children}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="partnerDetails">Details of travel partners (name, age, email)</Label>
                      <Textarea 
                        id="partnerDetails" 
                        placeholder="Add any details of travel partners" 
                        value={formData.partnerDetails}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="diet">Dietary requirements or other special requirements</Label>
                      <Textarea 
                        id="diet" 
                        placeholder="Dietary requirements or other special requirements" 
                        value={formData.diet}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="nextOfKin">Name of Next of Kin</Label>
                      <Input 
                        id="nextOfKin" 
                        placeholder="Name of next of kin" 
                        value={formData.nextOfKin}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="emailOfKin">Next of Kin&apos;s Email</Label>
                      <Input 
                        id="emailOfKin" 
                        placeholder="Next of kin's email" 
                        value={formData.emailOfKin}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAddClient}
                >
                  Add Client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Client tabs */}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="booked">Booked</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        {/* Client list for each tab */}
        {["planning", "confirmed", "booked", "completed", "canceled", "archived"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No clients in this category</p>
              </div>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold">{client.name}</h3>
                              <Badge className={`ml-3 ${statusColors[client.status as keyof typeof statusColors]}`}>
                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="mr-2 h-4 w-4" />
                                {client.email || 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="mr-2 h-4 w-4" />
                                {client.phone || 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="mr-2 h-4 w-4" />
                                {client.location || 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-2 h-4 w-4" />
                                {client.arrival_date || 'TBD'} - {client.departure_date || 'TBD'}
                              </div>
                            </div>
                            {/* Tour name info */}
                            {client.tour_name && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Tour:</span> {client.tour_name}
                              </div>
                            )}
                            {/* Group size info */}
                            <div className="mt-2 text-sm text-gray-700">
                              <span className="font-medium">Group:</span> {client.adults || 0} adults
                              {client.children && client.children > 0 && `, ${client.children} children`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start mt-4 md:mt-0 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleOpenNotes(client)}
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Notes
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Send Email</DropdownMenuItem>
                            <DropdownMenuItem>Send itenary</DropdownMenuItem>
                            <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                            {client.status === "planning" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(client.id, "confirmed")}>
                                Move to Confirmed
                              </DropdownMenuItem>
                            )}
                            {client.status === "confirmed" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(client.id, "booked")}>
                                Move to Booked
                              </DropdownMenuItem>
                            )}
                            {client.status === "booked" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(client.id, "completed")}>
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {client.status !== "canceled" && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleChangeStatus(client.id, "canceled")}
                              >
                                Cancel Reservation
                              </DropdownMenuItem>
                            )}
                            {client.status === "canceled" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(client.id, "archived")}>
                                Archive Client
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Client Notes Dialog */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Client Notes</DialogTitle>
            <DialogDescription>{selectedClient?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="client-notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="client-notes"
              className="mt-2 h-40"
              placeholder="Add notes about this client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}