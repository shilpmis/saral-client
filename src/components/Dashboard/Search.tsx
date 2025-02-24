import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, GraduationCap, Users, BookOpen,ShieldCheck,IdCard,UserPen,CircleHelp,Grip,ChartPie,Hand,Shapes,UserRoundCheck,UsersRound,Type,PersonStanding} from "lucide-react"
import React, { useContext, useEffect } from "react"
import { SearchCategory } from "@/types/searchCategory"
import { SearchContext} from "./searchContext"


export function Search() {

  const studentCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "grno", label: "GR Number",icon: <GraduationCap className="h-4 w-4" /> },
    { id: "class", label: "Class", icon: <Users className="h-4 w-4" /> },
    { id: "subject", label: "Subject", icon: <BookOpen className="h-4 w-4" /> },
  ]
  const staffCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "profile", label: "profile",icon: <UserPen className="h-4 w-4" /> },
    { id: "status", label: "status", icon: <ShieldCheck className="h-4 w-4"/>},
    { id: "staffId", label: "Staff Id", icon: <IdCard className="h-4 w-4" /> },
  ]
  const payrollCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "role", label: "Role",icon: <CircleHelp className="h-4 w-4"/>},
    { id: "category", label: "Category", icon: <Grip className="h-4 w-4"/> },
    { id: "status", label: "Status", icon: <ChartPie className="h-4 w-4" /> },
  ]
  const attendanceCategories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "roleNumber", label: "Roll Number",icon: <Hand className="h-4 w-4"/> },
    { id: "class", label: "Class", icon: <Shapes className="h-4 w-4"/> },
    { id: "attendance", label: "Attendance", icon: <UserRoundCheck className="h-4 w-4"/> },
  ]
  const leaveCategories: SearchCategory[] = [
    { id: "employee", label: "Employee", icon: <UsersRound className="h-4 w-4"/> },
    { id: "type", label: "Leave Type",icon: <Type className="h-4 w-4"/> },
    { id: "status", label: "Status", icon: <ShieldCheck className="h-4 w-4"/> },
  ]
  const feeCategories: SearchCategory[] = [
    { id: "standard", label: "Standard", icon: <PersonStanding className="h-4 w-4"/> },
    { id: "status", label: "status",icon: <ShieldCheck className="h-4 w-4"/> },
  ]
  const mark_Attendance_Categories: SearchCategory[] = [
    { id: "name", label: "Name", icon: <User className="h-4 w-4" /> },
    { id: "roleNumber", label: "Roll Number",icon: <Hand className="h-4 w-4"/> },
  ]

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory | null>(null);
  const {activePage, setActivePage}:any =  useContext(SearchContext);


  const handleSearch = (category: SearchCategory) => {
    setSelectedCategory(category)
  }

  useEffect(() => {
    if (window.location.pathname === '/d/students') {
      setActivePage('Search for Students'); 
    } else if (window.location.pathname === '/d/staff') {
      setActivePage('Search for Staff');   
    }
    else if(window.location.pathname === '/d'){
      setActivePage('')
    }
    else if(window.location.pathname === '/d/payroll'){
      setActivePage('Search for payroll'); 
    }
    else if(window.location.pathname === '/d/admin-attendance-mangement'){
      setActivePage('Search for Attendance'); 
    }
    else if(window.location.pathname === '/d/admin-leave-management'){
      setActivePage('Search for Leave'); 
    }
    else if(window.location.pathname === '/d/fee'){
      setActivePage('Search for Fee'); 
    }
    else if(window.location.pathname === '/d/mark-attendance'){
      setActivePage('Search for mark attendance'); 
    }
    else if(window.location.pathname === '/d/leave'){
      setActivePage('');
    }
  }, [window.location.pathname]);

  useEffect(()=>{
   if(searchQuery === ""){
    setSelectedCategory(null);
   }
  },[searchQuery])

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {
        activePage !== '' ? (
          <div className="relative flex items-center">
      <Input
          type="text"
          placeholder={activePage}
          className="pl-[120px] pr-10"
          value={searchQuery}
          onChange={(e) => {setSearchQuery(e.target.value)}}
          disabled={selectedCategory === null }
        />
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
          ): activePage === "Search for payroll" ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                {selectedCategory ? selectedCategory.label : "Search by"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {payrollCategories.map((category) => (
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
          ) : activePage === "Search for Attendance" ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                {selectedCategory ? selectedCategory.label : "Search by"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {attendanceCategories.map((category) => (
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
          ) : activePage === "Search for mark attendance" ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute left-1 top-1/2 -translate-y-1/2 rounded-md border bg-background px-2 py-1 text-sm font-medium">
                {selectedCategory ? selectedCategory.label : "Search by"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {mark_Attendance_Categories.map((category) => (
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
          ) : ''
        }
        
      </div>
        ): ('')
      }
    </div>
  )
  
}

