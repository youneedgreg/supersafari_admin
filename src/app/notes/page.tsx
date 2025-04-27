/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, Calendar, User, Tag } from "lucide-react"
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

// Mock notes data
const mockNotes = [
  {
    id: 1,
    title: "Smith Safari Preferences",
    content:
      "John and Sarah are interested in wildlife photography. They've requested extra time at animal sightings for photos. Prefer early morning game drives. Both are vegetarians - need to inform all lodges.",
    date: "May 2, 2023",
    clientId: 1,
    clientName: "John & Sarah Smith",
    tags: ["preferences", "dietary", "photography"],
  },
  {
    id: 2,
    title: "Williams Accommodation Notes",
    content:
      "David prefers luxury accommodations. Has stayed at Serena Lodge before and enjoyed it. Interested in private dining experiences. Has a back condition - needs firm mattress.",
    date: "May 5, 2023",
    clientId: 2,
    clientName: "David Williams",
    tags: ["accommodation", "returning client", "medical"],
  },
  {
    id: 3,
    title: "Thompson Family Activities",
    content:
      "Family with two children (ages 10 and 12). Kids are interested in educational experiences about wildlife. Parents want to ensure safety during activities. Consider family-friendly lodges with pools.",
    date: "May 8, 2023",
    clientId: 3,
    clientName: "Thompson Family",
    tags: ["family", "children", "educational"],
  },
  {
    id: 4,
    title: "Garcia Honeymoon Planning",
    content:
      "Maria and partner are on their honeymoon. Requested romantic experiences like private dinners and sunset viewings. Interested in hot air balloon safari. Celebrating anniversary during trip - arrange special surprise.",
    date: "May 12, 2023",
    clientId: 4,
    clientName: "Maria Garcia",
    tags: ["honeymoon", "romantic", "special occasion"],
  },
  {
    id: 5,
    title: "Chen Family Cultural Interests",
    content:
      "Very interested in local culture and traditions. Would like to visit Maasai village if possible. Speak limited English - consider guide with Mandarin knowledge. One family member has shellfish allergy.",
    date: "May 15, 2023",
    clientId: 5,
    clientName: "Chen Family",
    tags: ["cultural", "language", "dietary"],
  },
  {
    id: 6,
    title: "Marketing Strategy 2023",
    content:
      "Focus on digital marketing channels. Increase social media presence with more safari photos and videos. Consider partnerships with travel influencers. Target European market for off-season bookings.",
    date: "April 25, 2023",
    clientId: null,
    clientName: null,
    tags: ["marketing", "strategy", "business"],
  },
]

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)

  // Filter notes based on search query
  const filteredNotes = mockNotes.filter((note) => {
    if (searchQuery === "") return true
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.clientName && note.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const handleViewNote = (note: any) => {
    setSelectedNote(note)
    setIsViewNoteOpen(true)
  }

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
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>Create a new note for client information or business purposes.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="note-title">Note Title</Label>
                    <Input id="note-title" placeholder="Enter note title" />
                  </div>
                  <div>
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea id="note-content" placeholder="Enter note content" className="min-h-[150px]" />
                  </div>
                  <div>
                    <Label htmlFor="note-client">Related Client (Optional)</Label>
                    <Select>
                      <SelectTrigger id="note-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">John & Sarah Smith</SelectItem>
                        <SelectItem value="2">David Williams</SelectItem>
                        <SelectItem value="3">Thompson Family</SelectItem>
                        <SelectItem value="4">Maria Garcia</SelectItem>
                        <SelectItem value="5">Chen Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="note-tags">Tags (comma separated)</Label>
                    <Input id="note-tags" placeholder="e.g. preferences, dietary, important" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddNoteOpen(false)}>
                  Save Note
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
        {filteredNotes.length === 0 ? (
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewNote(note)}>View Note</DropdownMenuItem>
                      <DropdownMenuItem>Edit Note</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete Note</DropdownMenuItem>
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
                    {note.tags.map((tag: string, index: number) => (
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
        <DialogContent className="sm:max-w-[600px]">
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
                {selectedNote.tags.map((tag: string, index: number) => (
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
            <Button variant="outline" className="mr-2">
              Edit
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
