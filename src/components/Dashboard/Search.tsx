import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, GraduationCap, Users, BookOpen } from "lucide-react"
import React from "react"
import { SearchCategory } from "@/types/searchCategory"


export function Search() {

  const searchCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "grno", label: "GR Number",icon: <GraduationCap className="h-4 w-4" /> },
    { id: "class", label: "Class", icon: <Users className="h-4 w-4" /> },
    { id: "subject", label: "Subject", icon: <BookOpen className="h-4 w-4" /> },
  ]
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory | null>(null)

  const handleSearch = (category: SearchCategory) => {
    setSelectedCategory(category)
    console.log(`Searching by ${category.label}: ${searchQuery}`)
  }


  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search students..."
          className="pl-40 pr-10"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)    
          }}
          disabled={selectedCategory === null }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
              {selectedCategory ? selectedCategory.label : "Search by"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {searchCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleSearch(category)}
                className="flex items-center gap-2"
              >
                {category.icon}
                <span>{category.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
  
}

