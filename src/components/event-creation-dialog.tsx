"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define the interfaces
interface Client {
  id: number
  name: string
}

interface EventCreationProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
  onEventCreated?: () => void
}

export default function EventCreationDialog({
  isOpen,
  onOpenChange,
  initialDate = new Date(),
  onEventCreated
}: EventCreationProps) {
  // State for the active tab (event type)
  const [activeTab, setActiveTab] = useState<string>("arrival")
  
  // Form states
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [clientId, setClientId] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const [status, setStatus] = useState<string>("planning")
  const [priority, setPriority] = useState<string>("medium")
  const [guests, setGuests] = useState<string>("1")
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false)
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate)
      setClientId("")
      setTitle("")
      setDetails("")
      setStatus("planning")
      setPriority("medium")
      setGuests("1")
      
      // Set default departure date (7 days from arrival)
      if (activeTab === "arrival") {
        const defaultDeparture = new Date(initialDate)
        defaultDeparture.setDate(defaultDeparture.getDate() + 7)
        setDepartureDate(defaultDeparture)
      } else {
        setDepartureDate(undefined)
      }
    }
  }, [isOpen, initialDate, activeTab])
  
  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!isOpen) return
      
      try {
        setIsLoadingClients(true)
        const response = await fetch('/api/clients')
        if (!response.ok) throw new Error('Failed to fetch clients')
        
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoadingClients(false)
      }
    }
    
    fetchClients()
  }, [isOpen])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Construct the event data based on the active tab
      let eventData: Record<string, unknown> = {}
      
      if (activeTab === "arrival") {
        eventData = {
          client_id: parseInt(clientId),
          arrival_date: format(date!, 'yyyy-MM-dd'),
          departure_date: departureDate ? format(departureDate, 'yyyy-MM-dd') : null,
          guests: parseInt(guests),
          status: status,
          type: "arrival"
        }
      } else if (activeTab === "departure") {
        eventData = {
          client_id: parseInt(clientId),
          departure_date: format(date!, 'yyyy-MM-dd'),
          status: status,
          type: "departure"
        }
      } else if (activeTab === "task") {
        eventData = {
          title: title,
          description: details,
          due_date: format(date!, 'yyyy-MM-dd'),
          priority: priority,
          status: "pending",
          client_id: clientId ? parseInt(clientId) : null,
          type: "task"
        }
      }
      
      // Determine which API endpoint to use
      let apiEndpoint = '/api/calendar/events'
      
      if (activeTab === "arrival" || activeTab === "departure") {
        apiEndpoint = '/api/reservations'
      } else if (activeTab === "task") {
        apiEndpoint = '/api/tasks'
      }
      
      // Submit the form
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create event')
      }
      
      // Close the dialog and refresh data
      onOpenChange(false)
      if (onEventCreated) onEventCreated()
      
    } catch (error) {
      console.error('Error creating event:', error)
      // You could add error handling/display here
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar. Select the type of event you want to create.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          defaultValue="arrival"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="arrival">Arrival</TabsTrigger>
            <TabsTrigger value="departure">Departure</TabsTrigger>
            <TabsTrigger value="task">Task</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            {/* Common Fields for All Types */}
            <div className="grid gap-4 py-4">
              {/* Date Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-date" className="text-right">
                  {activeTab === "arrival" ? "Arrival Date" : 
                   activeTab === "departure" ? "Departure Date" : "Due Date"}
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Client Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <div className="col-span-3">
                  <Select
                    value={clientId}
                    onValueChange={setClientId}
                    disabled={isLoadingClients}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Clients</SelectLabel>
                        {isLoadingClients ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : (
                          <>
                            {activeTab === "task" && (
                              <SelectItem value="">No client (general task)</SelectItem>
                            )}
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Arrival-specific fields */}
              <TabsContent value="arrival" className="mt-0 space-y-4">
                {/* Departure Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departure-date" className="text-right">
                    Departure Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !departureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? format(departureDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={setDepartureDate}
                          disabled={(currentDate: Date) => currentDate < (date || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Number of Guests */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guests" className="text-right">
                    Number of Guests
                  </Label>
                  <Input
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    type="number"
                    min="1"
                    className="col-span-3"
                  />
                </div>
                
                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              {/* Departure-specific fields */}
              <TabsContent value="departure" className="mt-0 space-y-4">
                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              {/* Task-specific fields */}
              <TabsContent value="task" className="mt-0 space-y-4">
                {/* Task Title */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                
                {/* Task Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                
                {/* Priority */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Priority</Label>
                  <RadioGroup
                    className="col-span-3 flex items-center space-x-4"
                    value={priority}
                    onValueChange={setPriority}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="text-blue-700">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="text-amber-700">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="text-red-700">High</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !date || (activeTab !== "task" && !clientId)}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>Create Event</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}