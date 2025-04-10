"use client"

import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  User,
  GraduationCap,
  ShieldCheck,
  BadgeIcon as IdCard,
  PenIcon as UserPen,
  CircleHelp,
  Grip,
  PieChartIcon as ChartPie,
  Hand,
  Shapes,
  UserRoundCheck,
  UsersRound,
  Type,
  PersonStanding,
  X,
  Phone,
  SearchX,
} from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import type { SearchCategory } from "@/types/searchCategory"
import { SearchContext } from "./searchContext"
import { useLocation, useNavigate } from "react-router-dom"

import type { Student } from "@/types/student"
import { Button } from "@/components/ui/button"
import { useLazySearchStudentsQuery } from "@/services/StudentServices"
import { useDebounceThrottle } from "@/hooks/use-debounce-throttle"
import { StudentSearchResults } from "../Students/StudentSearchResult"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice"

export function Search() {
  // Get the current active academic session from Redux
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)

  // Original categories
  const studentCategories: SearchCategory[] = [
    { id: "name", label: "Student Name", icon: <User className="h-4 w-4" /> },
    { id: "grno", label: "GR Number", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "mobile", label: "Mobile Number", icon: <Phone className="h-4 w-4" /> },
  ]
  const staffCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "profile", label: "profile", icon: <UserPen className="h-4 w-4" /> },
    { id: "status", label: "status", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "staffId", label: "Staff Id", icon: <IdCard className="h-4 w-4" /> },
  ]
  const payrollCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "role", label: "Role", icon: <CircleHelp className="h-4 w-4" /> },
    { id: "category", label: "Category", icon: <Grip className="h-4 w-4" /> },
    { id: "status", label: "Status", icon: <ChartPie className="h-4 w-4" /> },
  ]
  const attendanceCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "roleNumber", label: "Roll Number", icon: <Hand className="h-4 w-4" /> },
    { id: "class", label: "Class", icon: <Shapes className="h-4 w-4" /> },
    { id: "attendance", label: "Attendance", icon: <UserRoundCheck className="h-4 w-4" /> },
  ]
  const leaveCategories: SearchCategory[] = [
    { id: "employee", label: "Employee", icon: <UsersRound className="h-4 w-4" /> },
    { id: "type", label: "Leave Type", icon: <Type className="h-4 w-4" /> },
    { id: "status", label: "Status", icon: <ShieldCheck className="h-4 w-4" /> },
  ]
  const feeCategories: SearchCategory[] = [
    { id: "standard", label: "Standard", icon: <PersonStanding className="h-4 w-4" /> },
    { id: "status", label: "status", icon: <ShieldCheck className="h-4 w-4" /> },
  ]
  const mark_Attendance_Categories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "roleNumber", label: "Roll Number", icon: <Hand className="h-4 w-4" /> },
  ]

  // Original state
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | null>(null)
  const { activePage, setActivePage }: any = useContext(SearchContext)

  // State for student search
  const [showResults, setShowResults] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Use RTK Query hook for search
  const [searchStudents, { data: searchResults = [], isLoading, error: searchError }] = useLazySearchStudentsQuery()

  // Use debounce-throttle hook for search query
  const debouncedSearchQuery = useDebounceThrottle(searchQuery, 500, 300)

  // Original handlers
  const handleSearch = (category: SearchCategory) => {
    setSelectedCategory(category)
  }

  const onChangeSearch = (value: string) => {
    setSearchQuery(value)
    if (value === "") {
      setShowResults(false)
      setHasSearched(false)
    } else {
      setShowResults(true)
    }
  }

  const searchTrigger = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault()
      performSearch()
    } else if (event === "Enter") {
      performSearch()
    }
  }

  // Perform search based on selected category
  const performSearch = async () => {
    if (!searchQuery || !selectedCategory || !currentAcademicSession?.id) return

    setHasSearched(true)

    try {
      // For now, we're only implementing the name search for students
      if (activePage === "Search for Students") {
        if (selectedCategory.id === "name") {
          searchStudents({
            academic_session_id: currentAcademicSession.id,
            name: searchQuery,
            detailed: false,
          })
        } else if (selectedCategory.id === "grno") {
          const grNo = Number.parseInt(searchQuery)
          if (!isNaN(grNo)) {
            searchStudents({
              academic_session_id: currentAcademicSession.id,
              gr_no: grNo,
              detailed: false,
            })
          }
        } else if (selectedCategory.id === "mobile") {
          searchStudents({
            academic_session_id: currentAcademicSession.id,
            primary_mobile: Number(searchQuery),
            detailed: false,
          })
        } else {
          console.log("from Student", searchQuery, selectedCategory?.id)
        }
      } else if (window.location.pathname === "/d/staff") {
        console.log("from Staff", searchQuery, selectedCategory?.id)
      } else if (window.location.pathname === "/d/leaves") {
        console.log("from leaves", searchQuery, selectedCategory?.id)
      } else if (window.location.pathname === "/d/fee") {
        console.log("from fee", searchQuery, selectedCategory?.id)
      }
    } catch (err) {
      console.error("Search error:", err)
    }
  }

  // Handle student selection - navigate to student profile page
  const handleSelectStudent = (student: Student) => {
    // Navigate to the student profile page with the student ID
    navigate(`/d/student/${student.id}`)
    // Clear search results and query
    setShowResults(false)
    setSearchQuery("")
    setHasSearched(false)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setHasSearched(false)
  }

  // Effect for debounced search
  useEffect(() => {
    if (
      debouncedSearchQuery &&
      selectedCategory &&
      activePage === "Search for Students" &&
      currentAcademicSession?.id
    ) {
      performSearch()
    }
  }, [debouncedSearchQuery, selectedCategory, currentAcademicSession])

  // Original effects
  const pageTitles: any = useMemo(
    () => ({
      "/d/students": "Search for Students",
      "/d/staff": "Search for Staff",
      "/d/leaves": "Search for Leave",
      "/d/fee": "Search for Fee",
    }),
    [],
  )

  useEffect(() => {
    setSearchQuery("")
    setSelectedCategory(null)
    setActivePage(pageTitles[location.pathname])
    setHasSearched(false)
  }, [location.pathname, pageTitles, setActivePage])

  useEffect(() => {
    if (searchQuery === "" && activePage !== "Search for Students") {
      setSelectedCategory(null)
    }
  }, [searchQuery, activePage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".search-container") && showResults) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showResults])

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {activePage === "Search for Students" ||
      activePage === "Search for Staff" ||
      activePage === "Search for Leave" ||
      activePage === "Search for Fee" ? (
        <div className="search-container">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder={activePage}
              className="pl-[120px] pr-10"
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              disabled={
                (selectedCategory === null && activePage !== "Search for Students") || !currentAcademicSession?.id
              }
              onKeyDown={(event) => searchTrigger(event)}
              onFocus={() => {
                if (searchQuery && searchResults.length > 0) {
                  setShowResults(true)
                }
              }}
            />

            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}

            <button
              onClick={() => {
                if (searchQuery !== "" && selectedCategory !== null) {
                  searchTrigger("Enter")
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activePage === "Search for Students" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                    {selectedCategory ? selectedCategory.label : "Search by"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {studentCategories.map((category) => (
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
            ) : activePage === "Search for Staff" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                    {selectedCategory ? selectedCategory.label : "Search by"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {staffCategories.map((category) => (
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
            ) : activePage === "Search for Leave" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                    {selectedCategory ? selectedCategory.label : "Search by"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {leaveCategories.map((category) => (
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
            ) : activePage === "Search for Fee" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                    {selectedCategory ? selectedCategory.label : "Search by"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {feeCategories.map((category) => (
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
            ) : (
              []
            )}
          </div>

          {/* Show search results or loading state */}
          {showResults && activePage === "Search for Students" && (
            <>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                </div>
              ) : (
                <>
                  {searchResults.length > 0 ? (
                    <StudentSearchResults
                      results={searchResults}
                      isLoading={isLoading}
                      error={searchError}
                      onSelectStudent={handleSelectStudent}
                    />
                  ) : (
                    hasSearched && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-auto">
                        <div className="flex items-center justify-center p-4 border-b">
                          <SearchX className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No results found for "{searchQuery}" in {selectedCategory?.label}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </>
              )}
            </>
          )}

          {/* Show error message if any */}
          {searchError && <div className="text-sm text-red-500 mt-1">Failed to search. Please try again.</div>}

          {/* Show message if no active academic session */}
          {!currentAcademicSession?.id && (
            <div className="text-sm text-amber-500 mt-1">
              No active academic session found. Please set an active academic session first.
            </div>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  )
}
