"use client"

import { useState } from "react"
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

// Mock client data
const mockClients = [
  {
    id: 1,
    name: "John & Sarah Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    arrivalDate: "May 15, 2023",
    departureDate: "May 25, 2023",
    guests: 2,
    status: "planning",
    amount: null,
    deposit: null,
    notes: "Interested in wildlife photography. First safari experience.",
  },
  {
    id: 2,
    name: "David Williams",
    email: "david.w@example.com",
    phone: "+1 (555) 987-6543",
    location: "London, UK",
    arrivalDate: "May 18, 2023",
    departureDate: "May 28, 2023",
    guests: 1,
    status: "confirmed",
    amount: 3500,
    deposit: 1000,
    notes: "Returning client. Prefers luxury accommodations.",
  },
  {
    id: 3,
    name: "Thompson Family",
    email: "thompson@example.com",
    phone: "+1 (555) 456-7890",
    location: "Toronto, Canada",
    arrivalDate: "May 20, 2023",
    departureDate: "June 1, 2023",
    guests: 4,
    status: "booked",
    amount: 7200,
    deposit: 2500,
    notes: "Family with two children (ages 10 and 12). Interested in educational experiences.",
  },
  {
    id: 4,
    name: "Maria Garcia",
    email: "maria.g@example.com",
    phone: "+1 (555) 234-5678",
    location: "Madrid, Spain",
    arrivalDate: "June 5, 2023",
    departureDate: "June 15, 2023",
    guests: 2,
    status: "confirmed",
    amount: 4200,
    deposit: 1500,
    notes: "Honeymoon trip. Requested romantic experiences.",
  },
  {
    id: 5,
    name: "Chen Family",
    email: "chen@example.com",
    phone: "+1 (555) 876-5432",
    location: "Singapore",
    arrivalDate: "June 10, 2023",
    departureDate: "June 20, 2023",
    guests: 3,
    status: "planning",
    amount: null,
    deposit: null,
    notes: "Interested in cultural experiences and wildlife.",
  },
  {
    id: 6,
    name: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "+1 (555) 345-6789",
    location: "Sydney, Australia",
    arrivalDate: "July 1, 2023",
    departureDate: "July 12, 2023",
    guests: 1,
    status: "completed",
    amount: 3800,
    deposit: 1200,
    notes: "Solo traveler. Photography enthusiast.",
  },
  {
    id: 7,
    name: "Patel Family",
    email: "patel@example.com",
    phone: "+1 (555) 654-3210",
    location: "Mumbai, India",
    arrivalDate: "July 15, 2023",
    departureDate: "July 25, 2023",
    guests: 5,
    status: "canceled",
    amount: 8500,
    deposit: 2000,
    notes: "Canceled due to family emergency. Deposit refunded.",
  },
]

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState("planning")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedClient, setSelectedClient] = useState<any>(null)

  // Filter clients based on active tab and search query
  const filteredClients = mockClients.filter(
    (client) =>
      client.status === activeTab &&
      (searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleOpenNotes = (client: unknown) => {
    setSelectedClient(client)
    setIsNotesOpen(true)
  }

  const statusColors: Record<string, string> = {
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
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Enter the client details to create a new reservation.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input id="name" placeholder="Full name or group name" />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email address" />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="Phone number" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, Country" />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="arrival">Arrival Date</Label>
                    <Input id="arrival" type="date" />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="departure">Departure Date</Label>
                    <Input id="departure" type="date" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input id="guests" type="number" min="1" placeholder="Number of guests" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Initial Notes</Label>
                    <Textarea id="notes" placeholder="Add any initial notes about the client" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsAddClientOpen(false)
                    toast.success("Client added successfully", {
                      description: "The new client has been added to the planning stage.",
                    })
                  }}
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
            {filteredClients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No clients in this category</p>
              </div>
            ) : (
              filteredClients.map((client) => (
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
                              <Badge className={`ml-3 ${statusColors[client.status]}`}>
                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="mr-2 h-4 w-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="mr-2 h-4 w-4" />
                                {client.phone}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="mr-2 h-4 w-4" />
                                {client.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-2 h-4 w-4" />
                                {client.arrivalDate} - {client.departureDate}
                              </div>
                            </div>
                            {(client.status === "confirmed" ||
                              client.status === "booked" ||
                              client.status === "completed") && (
                              <div className="mt-3 flex items-center">
                                <div className="mr-6">
                                  <span className="text-sm text-gray-500">Total Amount:</span>
                                  <span className="ml-2 font-semibold">${client.amount}</span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Deposit:</span>
                                  <span className="ml-2 font-semibold">${client.deposit}</span>
                                </div>
                              </div>
                            )}
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Send Email</DropdownMenuItem>
                            <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                            {client.status === "planning" && <DropdownMenuItem>Move to Confirmed</DropdownMenuItem>}
                            {client.status === "confirmed" && <DropdownMenuItem>Move to Booked</DropdownMenuItem>}
                            <DropdownMenuItem className="text-red-600">Cancel Reservation</DropdownMenuItem>
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
              defaultValue={selectedClient?.notes || ""}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsNotesOpen(false)}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
