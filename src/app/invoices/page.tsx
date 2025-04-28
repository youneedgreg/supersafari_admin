/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, Download, Eye, Filter, Loader2, MoreHorizontal, Plus, Printer, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Define types
interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  price: number
  total: number
}

interface Invoice {
  id: string
  clientId: number
  clientName: string
  amount: number
  date: string
  dueDate: string
  status: string
  notes?: string
  items?: InvoiceItem[]
}

interface Client {
  id: number
  name: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewLoading, setViewLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    items: [{ description: "", quantity: 1, price: 0, total: 0 }]
  })

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices")
      
      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }
      
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast.error("Failed to load invoices", {
        description: "There was an error loading your invoices. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch all clients for the select dropdown
  const fetchClients = async () => {
    try {
      // For now, creating a mock client list
      // In a real application, you would fetch this from an API
      const mockClients = [
        { id: 1, name: "John & Sarah Smith" },
        { id: 2, name: "David Williams" },
        { id: 3, name: "Thompson Family" },
        { id: 4, name: "Maria Garcia" },
        { id: 5, name: "Chen Family" },
        { id: 6, name: "Robert Johnson" }
      ]
      setClients(mockClients)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [])

  // Get full invoice details
  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setViewLoading(true)
      const response = await fetch(`/api/invoices?id=${invoiceId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch invoice details")
      }
      
      const data = await response.json()
      setSelectedInvoice(data)
      setIsViewInvoiceOpen(true)
    } catch (error) {
      console.error("Error fetching invoice details:", error)
      toast.error("Failed to load invoice details", {
        description: "There was an error loading the invoice details. Please try again.",
      })
    } finally {
      setViewLoading(false)
    }
  }

  // Handle creating a new invoice
  const handleCreateInvoice = async (isDraft: boolean = false) => {
    try {
      setSubmitting(true)
      
      // Validate form
      if (!newInvoice.clientId) {
        toast.error("Please select a client")
        return
      }
      
      if (!newInvoice.date || !newInvoice.dueDate) {
        toast.error("Invoice date and due date are required")
        return
      }
      
      // Validate items
      const validItems = newInvoice.items.filter(
        item => item.description.trim() !== "" && item.quantity > 0 && item.price > 0
      )
      
      if (validItems.length === 0) {
        toast.error("Please add at least one valid item")
        return
      }
      
      // Prepare items to submit
      const itemsToSubmit = validItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price
      }))
      
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: parseInt(newInvoice.clientId),
          date: newInvoice.date,
          dueDate: newInvoice.dueDate,
          notes: newInvoice.notes,
          status: isDraft ? "draft" : "pending",
          items: itemsToSubmit
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create invoice")
      }
      
      // Reset form and close dialog
      setNewInvoice({
        clientId: "",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "",
        items: [{ description: "", quantity: 1, price: 0, total: 0 }]
      })
      
      setIsAddInvoiceOpen(false)
      toast.success(
        isDraft ? "Invoice saved as draft" : "Invoice created successfully", 
        { description: isDraft ? "You can edit it later." : "The invoice has been sent to the client." }
      )
      
      // Reload invoices
      fetchInvoices()
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice", {
        description: "There was an error creating your invoice. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle marking an invoice as paid
  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoiceId,
          status: "paid"
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update invoice")
      }
      
      toast.success("Invoice marked as paid")
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, status: "paid" } 
            : inv
        )
      )
      
      // If the invoice is currently being viewed, update it
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: "paid" })
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("Failed to update invoice", {
        description: "There was an error updating the invoice. Please try again.",
      })
    }
  }

  // Handle finalizing a draft invoice
  const handleFinalizeInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoiceId,
          status: "pending"
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update invoice")
      }
      
      toast.success("Invoice finalized and sent to client")
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, status: "pending" } 
            : inv
        )
      )
      
      // If the invoice is currently being viewed, update it
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: "pending" })
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("Failed to finalize invoice", {
        description: "There was an error updating the invoice. Please try again.",
      })
    }
  }

  // Handle sending invoice to client
  const handleSendToClient = async (invoiceId: string) => {
    // In a real application, you would have an API endpoint to send the invoice via email
    toast.success("Invoice sent to client")
  }

  // Handle adding an item to new invoice
  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: "", quantity: 1, price: 0, total: 0 }]
    })
  }

  // Handle updating an item in new invoice
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoice.items]
    
    // Update the specified field
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    // If quantity or price changed, recalculate total
    if (field === "quantity" || field === "price") {
      const qty = field === "quantity" ? value : updatedItems[index].quantity
      const price = field === "price" ? value : updatedItems[index].price
      updatedItems[index].total = qty * price
    }
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems
    })
  }

  // Filter invoices based on active tab and search query
  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by tab
    if (activeTab !== "all" && invoice.status !== activeTab) return false

    // Filter by search query
    if (searchQuery === "") return true
    return (
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Calculate total amount for new invoice
  const calculateTotalAmount = () => {
    return newInvoice.items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  // Get invoice status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-500 mt-1">Create and manage client invoices</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={newInvoice.clientId}
                      onValueChange={(value) => setNewInvoice({...newInvoice, clientId: value})}
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="invoice-date">Invoice Date</Label>
                    <Input 
                      id="invoice-date" 
                      type="date" 
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input 
                      id="due-date" 
                      type="date" 
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2 border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Invoice Items</h4>
                      <Button variant="outline" size="sm" onClick={handleAddItem}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {newInvoice.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <Label htmlFor={`item-${index}-desc`}>Description</Label>
                            <Input 
                              id={`item-${index}-desc`} 
                              placeholder="Item description" 
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor={`item-${index}-qty`}>Qty</Label>
                            <Input 
                              id={`item-${index}-qty`} 
                              type="number" 
                              min="1" 
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor={`item-${index}-price`}>Price</Label>
                            <Input 
                              id={`item-${index}-price`} 
                              type="number" 
                              min="0" 
                              placeholder="0.00" 
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor={`item-${index}-total`}>Total</Label>
                            <Input 
                              id={`item-${index}-total`} 
                              readOnly 
                              value={item.total}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">Ksh {calculateTotalAmount().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Additional notes for the invoice" 
                      value={newInvoice.notes}
                      onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => handleCreateInvoice(true)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleCreateInvoice(false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Invoice'
                  )}
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
            placeholder="Search invoices..."
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

      {/* Invoice tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        {/* Invoice list */}
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-500">Loading invoices...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg bg-green-100 text-green-600 mr-4`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{invoice.id}</h3>
                          <Badge className={`ml-3 ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="mr-2 h-4 w-4" />
                            {invoice.clientName}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-2 h-4 w-4" />
                            Due: {invoice.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-2">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold">Ksh {invoice.amount.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => fetchInvoiceDetails(invoice.id)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => toast.info("Download functionality would be implemented here")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Print functionality would be implemented here")}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Edit functionality would be implemented here")}>
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendToClient(invoice.id)}>
                            Send to Client
                          </DropdownMenuItem>
                          {invoice.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleFinalizeInvoice(invoice.id)}>
                              Finalize Invoice
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
      </Tabs>

      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>{selectedInvoice?.clientName}</DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-500">Loading invoice details...</span>
            </div>
          ) : selectedInvoice && (
            <div className="py-4">
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">Safari Management</h3>
                  <p className="text-gray-500">123 Safari Road</p>
                  <p className="text-gray-500">Nairobi, Kenya</p>
                  <p className="text-gray-500">info@safariadmin.com</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">INVOICE</p>
                  <p className="text-gray-500">Invoice #: {selectedInvoice.id}</p>
                  <p className="text-gray-500">Date: {selectedInvoice.date}</p>
                  <p className="text-gray-500">Due Date: {selectedInvoice.dueDate}</p>
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Bill To:</h4>
                <p>{selectedInvoice.clientName}</p>
              </div>

              <div className="border rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.items && selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Ksh {item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Ksh {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>Ksh {selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">Ksh {selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Notes:</h4>
                <p className="text-gray-600 text-sm">
                  {selectedInvoice.notes || "Thank you for your business. Payment is due within 10 days of invoice date."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewInvoiceOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => toast.info("Download functionality would be implemented here")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => toast.info("Print functionality would be implemented here")}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}