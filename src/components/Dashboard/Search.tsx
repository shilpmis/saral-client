import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, GraduationCap, Users, BookOpen, ShieldCheck, IdCard, UserPen, CircleHelp, Grip, ChartPie, Hand, Shapes, UserRoundCheck, UsersRound, Type, PersonStanding } from "lucide-react"
import React, { useContext, useEffect } from "react"
import { SearchCategory } from "@/types/searchCategory"
import { SearchContext } from "./searchContext"



export function Search() {

  const studentCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "grno", label: "GR Number", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "class", label: "Class", icon: <Users className="h-4 w-4" /> },
    { id: "subject", label: "Subject", icon: <BookOpen className="h-4 w-4" /> },
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

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory | null>(null);
  const { activePage, setActivePage }: any = useContext(SearchContext);

  const handleSearch = (category:SearchCategory) => {
    setSelectedCategory(category)
  }
  const onChangeSearch = (value:any)=>{
    setSearchQuery(value); 
  }
  const searchTrigger = (event:any)=>{
    if (event.key === 'Enter') {
      event.preventDefault();
      if(window.location.pathname === '/d/students'){
        console.log("from Student",searchQuery,selectedCategory?.id);
      }
      else if(window.location.pathname === '/d/staff'){
        console.log("from Staff",searchQuery,selectedCategory?.id); 
      }
      else if (window.location.pathname === '/d/leaves') {
      console.log("from leaves",searchQuery,selectedCategory?.id);
      }
      else if (window.location.pathname === '/d/fee') {
      console.log("from fee",searchQuery,selectedCategory?.id);
      }
  }
  else if(event === 'Enter'){
    console.log("value is ==>>",searchQuery,selectedCategory?.id);
  }
  }

  useEffect(() => {
    setActivePage(undefined);
    if (window.location.pathname === '/d/students') {
      setSearchQuery('');
      setSelectedCategory(null)
      setActivePage('Search for Students');
    } else if (window.location.pathname === '/d/staff') {
      setSearchQuery('');
      setSelectedCategory(null)
      setActivePage('Search for Staff');
    }
    else if (window.location.pathname === '/d/leaves') {
      setSearchQuery('');
      setSelectedCategory(null)
      setActivePage('Search for Leave');
    }
    else if (window.location.pathname === '/d/fee') {
      setSearchQuery('');
      setSelectedCategory(null)
      setActivePage('Search for Fee');
    }
  }, [window.location.pathname]);

  useEffect(() => {
    if (searchQuery === "") {
      setSelectedCategory(null);
    }
  }, [searchQuery])

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {
        activePage === 'Search for Students' || activePage === 'Search for Staff' || activePage === 'Search for Leave' || activePage === 'Search for Fee' ? (
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder={activePage}
              className="pl-[120px] pr-10"
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              disabled={selectedCategory === null}
              onKeyDown={(event)=>searchTrigger(event)} 
            />
              <button
        onClick={() => {
          if (searchQuery !== '' && selectedCategory !== null) {
            searchTrigger('Enter');
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
            {
              activePage === "Search for Students" ? (
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
              ): activePage === "Search for Leave" ? (
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
              ): ([])
            }

          </div>
        ) : ('')
      }
    </div>
  )

}

