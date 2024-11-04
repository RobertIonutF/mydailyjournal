'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Smile, Meh, Frown, ChevronLeft, ChevronRight, Pencil, Trash2} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from 'date-fns'
import { getEntries } from "@/actions/get-entries"
import { createEntry } from "@/actions/create-entry"
import { updateEntry } from "@/actions/update-entry"
import { deleteEntry } from "@/actions/delete-entry"
import { type Entry } from "@/db/schema"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { deleteAllEntries } from "@/actions/delete-all-entries"

const ITEMS_PER_PAGE = 5;

type EntryMood = 'happy' | 'neutral' | 'sad';
type EntryType = 'thoughts' | 'activity';

interface DashboardProps {
  defaultTab: EntryType;
}

export function Dashboard({ defaultTab }: DashboardProps) {
  const [thoughts, setThoughts] = useState<Entry[]>([])
  const [activities, setActivities] = useState<Entry[]>([])
  const [newEntry, setNewEntry] = useState("")
  const [newMood, setNewMood] = useState<EntryMood>('neutral')
  const [activeTab] = useState<EntryType>(defaultTab)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<EntryMood | 'all'>('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [thoughtsResult, activitiesResult] = await Promise.all([
        getEntries('thoughts'),
        getEntries('activity')
      ])
      
      setThoughts(thoughtsResult)
      setActivities(activitiesResult)
    }
    
    fetchData()
  }, [])

  const handleUpdateEntry = async (updatedEntry: Entry) => {
    const result = await updateEntry(updatedEntry.id, {
      content: updatedEntry.content,
      mood: updatedEntry.mood
    })

    if (result.data) {
      const updateEntries = (entries: Entry[]) =>
        entries.map(entry => entry.id === result.data!.id ? result.data! : entry)

      if (activeTab === 'thoughts') {
        setThoughts(updateEntries(thoughts))
      } else {
        setActivities(updateEntries(activities))
      }
      setSelectedEntry(null)
    }
  }

  const handleDeleteEntry = async (id: number) => {
    const result = await deleteEntry(id)
    
    if (result.data) {
      const filterEntries = (entries: Entry[]) =>
        entries.filter(entry => entry.id !== id)

      if (activeTab === 'thoughts') {
        setThoughts(filterEntries(thoughts))
      } else {
        setActivities(filterEntries(activities))
      }
    }
  }

  const MoodIcon = ({ mood }: { mood: Entry['mood'] }) => {
    switch (mood) {
      case 'happy':
        return <Smile className="h-5 w-5 text-green-500" />
      case 'neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />
      case 'sad':
        return <Frown className="h-5 w-5 text-red-500" />
    }
  }

  const handleEditClick = (entry: Entry) => {
    setSelectedEntry({...entry})
    setIsEditDialogOpen(true)
  }

  const handleMoodChange = (value: Entry['mood']) => {
    if (selectedEntry) {
      setSelectedEntry({ ...selectedEntry, mood: value })
    }
  }

  const handleContentChange = (content: string) => {
    if (selectedEntry) {
      setSelectedEntry({ ...selectedEntry, content })
    }
  }

  const EntryCard = ({ entry, type }: { entry: Entry, type: string }) => (
    <Card className="mb-4 transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{type === 'thoughts' ? 'Thought' : 'Activity'}</CardTitle>
        <div className="flex items-center space-x-2">
          <MoodIcon mood={entry.mood} />
          <span className="text-sm text-muted-foreground">{entry.time}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p>{entry.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{entry.date}</p>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditClick(entry)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  const currentEntries = activeTab === 'thoughts' ? thoughts : activities;

  const filteredAndSearchedEntries = currentEntries
    .filter(entry => {
      const matchesMood = moodFilter === 'all' || entry.mood === moodFilter
      const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesMood && matchesSearch
    })

  const totalPages = Math.ceil(filteredAndSearchedEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredAndSearchedEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const addNewEntry = () => {
    setNewEntry("")
    setNewMood('neutral')
    setIsAddDialogOpen(true)
  }

  const handleAddEntry = async () => {
    if (newEntry.trim() === "") return
    const now = new Date()
    
    const result = await createEntry({
      content: newEntry,
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
      mood: newMood,
      type: activeTab
    })

    if (result.data) {
      if (activeTab === 'thoughts') {
        setThoughts(prev => [result.data!, ...prev])
      } else {
        setActivities(prev => [result.data!, ...prev])
      }
      setNewEntry("")
      setNewMood('neutral')
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteAllEntries = async () => {
    const result = await deleteAllEntries(activeTab)
    
    if (result.data) {
      if (activeTab === 'thoughts') {
        setThoughts([])
      } else {
        setActivities([])
      }
      setCurrentPage(1)
      setIsDeleteConfirmOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background z-10 sticky top-0 border-b p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{activeTab === 'thoughts' ? 'Thoughts' : 'Activities'}</h2>
            <div className="space-x-2">
              <Button onClick={addNewEntry}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New {activeTab === 'thoughts' ? 'Thought' : 'Activity'}
              </Button>
              <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All {activeTab === 'thoughts' ? 'Thoughts' : 'Activities'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your {activeTab === 'thoughts' ? 'thoughts' : 'activities'}. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAllEntries}
                    >
                      Delete All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
              />
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={moodFilter === 'all' ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => setMoodFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant={moodFilter === 'happy' ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => setMoodFilter('happy')}
              >
                <Smile className="h-4 w-4 mr-1" /> Happy
              </Badge>
              <Badge 
                variant={moodFilter === 'neutral' ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => setMoodFilter('neutral')}
              >
                <Meh className="h-4 w-4 mr-1" /> Neutral
              </Badge>
              <Badge 
                variant={moodFilter === 'sad' ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => setMoodFilter('sad')}
              >
                <Frown className="h-4 w-4 mr-1" /> Sad
              </Badge>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {activeTab === 'thoughts' ? 'Thought' : 'Activity'}</DialogTitle>
                <DialogDescription>
                  {activeTab === 'thoughts'
                    ? "Record your thoughts and reflections"
                    : "Log your daily activities and experiences"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder={`Enter your ${activeTab === 'thoughts' ? 'thought' : 'activity'}...`}
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="min-h-[100px]"
                />
                <Select value={newMood} onValueChange={(value) => setNewMood(value as EntryMood)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEntry}>Add {activeTab === 'thoughts' ? 'Thought' : 'Activity'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="space-y-4">
            {paginatedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} type={activeTab} />
            ))}
          </div>
        </div>
        <footer className="bg-background z-10 sticky bottom-0 border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </footer>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Make changes to your entry here. Click save when you&apos;re done.</DialogDescription>
            </DialogHeader>
            {selectedEntry && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEntry(selectedEntry);
                setIsEditDialogOpen(false);
                setSelectedEntry(null);
              }}>
                <div className="grid gap-4 py-4">
                  <Textarea
                    value={selectedEntry.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Select
                    value={selectedEntry.mood}
                    onValueChange={handleMoodChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}