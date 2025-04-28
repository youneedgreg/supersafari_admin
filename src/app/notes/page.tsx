/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, Calendar, User, Tag, Loader2, Printer } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Define interfaces
interface Note {
  id: number
  title: string
  content: string
  clientId: number | null
  clientName: string | null
  date: string
  tags: string[]
}

interface Client {
  id: number
  name: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // New note form state
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    clientId: "",
    tags: ""
  })

  // Edit note form state
  const [editNote, setEditNote] = useState<Note | null>(null)

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notes")
      
      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }
      
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Failed to load notes", {
        description: "There was an error loading your notes. Please try again.",
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
        { id: 5, name: "Chen Family" }
      ]
      setClients(mockClients)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchNotes()
    fetchClients()
  }, [])

  // Handle creating a new note
  const handleCreateNote = async () => {
    try {
      setSubmitting(true)
      
      // Validate form
      if (!newNote.title.trim()) {
        toast.error("Please enter a note title")
        return
      }
      
      if (!newNote.content.trim()) {
        toast.error("Please enter note content")
        return
      }
      
      // Process tags - split by comma and trim
      const tags = newNote.tags
        ? newNote.tags.split(",").map((tagItem: string) => tagItem.trim()).filter(Boolean)
        : []
      
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
          clientId: newNote.clientId ? parseInt(newNote.clientId) : null,
          tags: tags
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create note")
      }
      
      // Reset form and close dialog
      setNewNote({
        title: "",
        content: "",
        clientId: "",
        tags: ""
      })
      
      setIsAddNoteOpen(false)
      toast.success("Note created successfully")
      
      // Reload notes
      fetchNotes()
    } catch (error) {
      console.error("Error creating note:", error)
      toast.error("Failed to create note", {
        description: "There was an error creating your note. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle updating a note
  const handleUpdateNote = async () => {
    if (!editNote) return

    try {
      setSubmitting(true)
      
      // Validate form
      if (!editNote.title.trim()) {
        toast.error("Please enter a note title")
        return
      }
      
      if (!editNote.content.trim()) {
        toast.error("Please enter note content")
        return
      }
      
      // Process tags - if tags is a string, split and process
      let processedTags: string[] = []
      
      if (typeof editNote.tags === 'string') {
        processedTags = editNote.tags
          .split(",")
          .map((tagItem: string) => tagItem.trim())
          .filter(Boolean)
      } else {
        processedTags = editNote.tags
      }
      
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editNote.id,
          title: editNote.title,
          content: editNote.content,
          clientId: typeof editNote.clientId === 'string' 
            ? editNote.clientId ? parseInt(editNote.clientId) : null 
            : editNote.clientId,
          tags: processedTags
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update note")
      }
      
      setIsEditNoteOpen(false)
      toast.success("Note updated successfully")
      
      // Update the selected note if it's currently being viewed
      if (selectedNote && selectedNote.id === editNote.id) {
        const clientName = clients.find(c => {
          const clientId = typeof editNote.clientId === 'string' 
            ? editNote.clientId ? parseInt(editNote.clientId) : null 
            : editNote.clientId
          return c.id === clientId
        })?.name || null
        
        setSelectedNote({
          ...editNote,
          clientName: clientName,
          tags: processedTags
        })
      }
      
      // Reload notes
      fetchNotes()
    } catch (error) {
      console.error("Error updating note:", error)
      toast.error("Failed to update note", {
        description: "There was an error updating your note. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle deleting a note
  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete note")
      }
      
      // Close any open dialogs
      setIsViewNoteOpen(false)
      setIsEditNoteOpen(false)
      
      toast.success("Note deleted successfully")
      
      // Reload notes
      fetchNotes()
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note", {
        description: "There was an error deleting your note. Please try again.",
      })
    }
  }

  // Open view note dialog
  const handleViewNote = async (note: Note) => {
    try {
      // Get complete note details
      const response = await fetch(`/api/notes?id=${note.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch note details")
      }
      
      const data = await response.json()
      setSelectedNote(data)
      setIsViewNoteOpen(true)
    } catch (error) {
      console.error("Error fetching note details:", error)
      toast.error("Failed to load note details", {
        description: "There was an error loading the note details. Please try again.",
      })
    }
  }

  // Open edit note dialog
  const handleEditNote = (note: Note) => {
    setEditNote({
      ...note,
      tags: note.tags // Keep the array format
    })
    setIsEditNoteOpen(true)
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (searchQuery === "") return true
    
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.clientName && note.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Notes</h1>
          <p className="text-gray-500 mt-1">Manage client information and business notes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>Create a new note for client information or business purposes.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="note-title">Note Title</Label>
                    <Input 
                      id="note-title" 
                      placeholder="Enter note title" 
                      value={newNote.title}
                      onChange={e => setNewNote({...newNote, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea 
                      id="note-content" 
                      placeholder="Enter note content" 
                      className="min-h-[150px]" 
                      value={newNote.content}
                      onChange={e => setNewNote({...newNote, content: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-client">Related Client (Optional)</Label>
                    <Select 
                      value={newNote.clientId} 
                      onValueChange={value => setNewNote({...newNote, clientId: value})}
                    >
                      <SelectTrigger id="note-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="note-tags">Tags (comma separated)</Label>
                    <Input 
                      id="note-tags" 
                      placeholder="e.g. preferences, dietary, important" 
                      value={newNote.tags}
                      onChange={e => setNewNote({...newNote, tags: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddNoteOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={handleCreateNote}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Note'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search notes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Loading notes...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No notes found</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg truncate">{note.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleViewNote(note)}>View Note</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditNote(note)}>Edit Note</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this note?")) {
                            handleDeleteNote(note.id);
                          }
                        }}
                      >
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-3">{note.content}</p>
                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <Calendar className="mr-1 h-4 w-4" />
                  {note.date}
                </div>
                {note.clientName && (
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <User className="mr-1 h-4 w-4" />
                    {note.clientName}
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Note Dialog */}
      <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription>
              {selectedNote?.date} {selectedNote?.clientName && `• ${selectedNote.clientName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="whitespace-pre-line">{selectedNote?.content}</p>

            {selectedNote?.tags && selectedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {selectedNote.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewNoteOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => {
                setIsViewNoteOpen(false);
                if (selectedNote) {
                  handleEditNote(selectedNote);
                }
              }}
            >
              Edit
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.info("Print functionality would be implemented here");
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update note details.</DialogDescription>
          </DialogHeader>
          {editNote && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-note-title">Note Title</Label>
                  <Input 
                    id="edit-note-title" 
                    placeholder="Enter note title" 
                    value={editNote.title}
                    onChange={e => setEditNote({...editNote, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-note-content">Content</Label>
                  <Textarea 
                    id="edit-note-content" 
                    placeholder="Enter note content" 
                    className="min-h-[150px]" 
                    value={editNote.content}
                    onChange={e => setEditNote({...editNote, content: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-note-client">Related Client (Optional)</Label>
                  <Select 
                    value={typeof editNote.clientId === 'number' ? editNote.clientId.toString() : editNote.clientId || ''}
                    onValueChange={value => setEditNote({...editNote, clientId: value ? value : null})}
                  >
                    <SelectTrigger id="edit-note-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-note-tags">Tags (comma separated)</Label>
                  <Input 
                    id="edit-note-tags" 
                    placeholder="e.g. preferences, dietary, important" 
                    value={Array.isArray(editNote.tags) ? editNote.tags.join(", ") : editNote.tags}
                    onChange={e => setEditNote({...editNote, tags: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditNoteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleUpdateNote}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Note'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}