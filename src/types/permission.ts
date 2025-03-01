// import { UserRole } from "./auth";

// // types/permissions.ts
// export enum Permission {
//     // User Management
//     VIEW_USERS = 'VIEW_USERS',
//     CREATE_USER = 'CREATE_USER',
//     EDIT_USER = 'EDIT_USER',
//     DELETE_USER = 'DELETE_USER',
    
//     // Staff Management
//     VIEW_STAFF = 'VIEW_STAFF',
//     CREATE_STAFF = 'CREATE_STAFF',
//     EDIT_STAFF = 'EDIT_STAFF',
//     DELETE_STAFF = 'DELETE_STAFF',
    
//     // Class Management
//     VIEW_CLASSES = 'VIEW_CLASSES',
//     CREATE_CLASS = 'CREATE_CLASS',
//     EDIT_CLASS = 'EDIT_CLASS',
//     DELETE_CLASS = 'DELETE_CLASS',
    
//     // Student Management
//     VIEW_STUDENTS = 'VIEW_STUDENTS',
//     CREATE_STUDENT = 'CREATE_STUDENT',
//     EDIT_STUDENT = 'EDIT_STUDENT',
//     DELETE_STUDENT = 'DELETE_STUDENT',
//   }
  
//   export const RolePermissions: Record<UserRole, Permission[]> = {
//     [UserRole.SUPER_ADMIN]: Object.values(Permission),
//     [UserRole.IT_ADMIN]: [
//       Permission.VIEW_USERS,
//       Permission.CREATE_USER,
//       Permission.EDIT_USER,
//       Permission.VIEW_STAFF,
//       Permission.EDIT_STAFF,
//     ],
//     [UserRole.CLERK]: [
//       Permission.VIEW_STUDENTS,
//       Permission.CREATE_STUDENT,
//       Permission.EDIT_STUDENT,
//       Permission.VIEW_STAFF,
//     ],
//     [UserRole.PRINCIPAL]: [
//       Permission.VIEW_USERS,
//       Permission.VIEW_STAFF,
//       Permission.VIEW_CLASSES,
//       Permission.VIEW_STUDENTS,
//     ],
//     [UserRole.TEACHER]: [
//       Permission.VIEW_STUDENTS,
//       Permission.EDIT_STUDENT,
//       Permission.VIEW_CLASSES,
//     ],
//   }
  

//   src/
// ├── components/
// │   ├── common/                    # Shared components
// │   ├── layouts/
// │   │   ├── MainLayout.tsx        # Single main layout
// │   │   └── components/           # Layout-specific components
// │   │       ├── Sidebar.tsx
// │   │       ├── Header.tsx
// │   │       └── Navigation.tsx
// │   └── features/                 # Feature-based components
// │       ├── users/
// │       ├── staff/
// │       └── students/
// ├── config/
// │   ├── routes.config.ts         # Route configurations
// │   └── permissions.config.ts     # Permission configurations
// ├── hooks/
// │   ├── useAuth.ts
// │   └── usePermissions.ts        # Custom permission hook
// ├── types/
// │   ├── auth.types.ts
// │   └── permissions.types.ts
// ├── utils/
// │   └── permissionUtils.ts
// └── pages/
//     ├── auth/
//     │   └── Login.tsx
//     └── dashboard/
//         └── components/           # Dashboard-specific components
//             ├── AdminView.tsx
//             ├── TeacherView.tsx
//             └── ClerkView.tsx



// config/permissions.config.ts
// export enum Permission {
//     MANAGE_USERS = 'MANAGE_USERS',
//     VIEW_USERS = 'VIEW_USERS',
//     MANAGE_STAFF = 'MANAGE_STAFF',
//     VIEW_STAFF = 'VIEW_STAFF',
//     // ... other permissions
//   }
  
//   export enum Role {
//     ADMIN = 'ADMIN',
//     IT_ADMIN = 'IT_ADMIN',
//     CLERK = 'CLERK',
//     PRINCIPAL = 'PRINCIPAL',
//     TEACHER = 'TEACHER'
//   }
  
//   export const RolePermissions: Record<Role, Permission[]> = {
//     [Role.ADMIN]: [
//       Permission.MANAGE_USERS,
//       Permission.MANAGE_STAFF,
//       // ... all permissions
//     ],
//     [Role.IT_ADMIN]: [
//       Permission.VIEW_USERS,
//       Permission.MANAGE_STAFF,
//       // ... specific permissions
//     ],
//     // ... other role permissions
//   }
  
//   export const MenuItems: Record<Role, string[]> = {
//     [Role.ADMIN]: ['dashboard', 'users', 'staff', 'students'],
//     [Role.TEACHER]: ['dashboard', 'students', 'attendance'],
//     // ... other role menus
//   }


// hooks/usePermissions.ts
// import { useAppSelector } from '@/redux/hooks/useAppSelector';
// import { Permission } from '@/config/permissions.config';

// export const usePermissions = () => {
//   const { user } = useAppSelector(state => state.auth);

//   const hasPermission = (permission: Permission): boolean => {
//     return user?.permissions.includes(permission) ?? false;
//   };

//   const hasAnyPermission = (permissions: Permission[]): boolean => {
//     return permissions.some(permission => hasPermission(permission));
//   };

//   const hasAllPermissions = (permissions: Permission[]): boolean => {
//     return permissions.every(permission => hasPermission(permission));
//   };

//   return {
//     hasPermission,
//     hasAnyPermission,
//     hasAllPermissions
//   };
// };




// // components/layouts/MainLayout.tsx
// import { FC } from 'react';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';

// export const MainLayout: FC = ({ children }) => {
//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 p-6 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };


// components/layouts/MainLayout.tsx
// import { FC } from 'react';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';

// export const MainLayout: FC = ({ children }) => {
//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 p-6 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };



// config/routes.config.ts
// import { Permission } from './permissions.config';

// export const routes = [
//   {
//     path: '/dashboard',
//     component: Dashboard,
//     permissions: [], // accessible to all authenticated users
//   },
//   {
//     path: '/users',
//     component: Users,
//     permissions: [Permission.VIEW_USERS],
//   },
//   {
//     path: '/staff',
//     component: Staff,
//     permissions: [Permission.VIEW_STAFF],
//   },
//   // ... other routes
// ];


// pages/dashboard/Dashboard.tsx
// import { Role } from '@/config/permissions.config';
// import { useAppSelector } from '@/redux/hooks/useAppSelector';

// const DashboardViews: Record<Role, FC> = {
//   [Role.ADMIN]: AdminView,
//   [Role.TEACHER]: TeacherView,
//   [Role.CLERK]: ClerkView,
//   // ... other role views
// };

// export const Dashboard = () => {
//   const { user } = useAppSelector(state => state.auth);
  
//   if (!user) return null;

//   const ViewComponent = DashboardViews[user.role];
  
//   return (
//     <div className="dashboard">
//       <ViewComponent />
//     </div>
//   );
// };


// // components/features/users/UserList.tsx
// import { PermissionGate } from '@/components/common/PermissionGate';
// import { Permission } from '@/config/permissions.config';

// export const UserList = () => {
//   return (
//     <div>
//       <h1>Users</h1>
//       <PermissionGate permissions={[Permission.MANAGE_USERS]}>
//         <button>Add User</button>
//       </PermissionGate>
//       {/* User list content */}
//     </div>
//   );
// };


// Use a single layout with dynamic content instead of multiple layouts

// Implement component-level permission checks

// Keep permission logic centralized

// Use TypeScript for better type safety

// Implement lazy loading for role-specific components

// Keep the routing configuration centralized

// Use composition over inheritance

// Implement proper error boundaries and fallbacks