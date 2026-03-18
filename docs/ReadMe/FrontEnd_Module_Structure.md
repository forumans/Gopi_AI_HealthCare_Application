# Frontend Module Structure Documentation

## Overview

This document explains the purpose and organization of each frontend module in the HealthCare application.

## 📁 Directory Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── layout/           # Layout and structural components
│   ├── pages/            # Page-specific components
│   └── index.ts          # Component exports
├── hooks/
│   ├── useAuth.ts        # Authentication logic
│   ├── useAppointments.ts # Appointment management
│   ├── useUserData.ts    # User data management
│   ├── useNavigation.ts  # Navigation state management
│   └── index.ts          # Hook exports
├── types/
│   └── app.ts            # Application-specific types
├── constants/
│   └── index.ts          # Application constants
├── config/
│   └── menu.ts           # Menu configuration
├── utils/
│   └── index.ts          # Utility functions
└── docs/
    └── MODULE_STRUCTURE.md # This documentation
```

## 🧩 Module Breakdown

### 1. Components (`src/components/`)

#### Common Components (`components/common/`)

**LabeledField.tsx**
- **Purpose**: Reusable form field with label, validation, and password toggle
- **Used in**: All forms throughout the application
- **Props**: `id`, `label`, `helpText`, `value`, `onChange`, `type`, `placeholder`, `error`, `autoComplete`
- **Important**: Use specific `id` attributes for testing (e.g., `id="doctor-full-name"`)
- **Accessibility**: Password toggle has `tabIndex={-1}` for better keyboard navigation

**ProtectedRoute.tsx**
- **Purpose**: Route protection based on user roles
- **Used in**: Route definitions to enforce role-based access
- **Props**: `allowed`, `role`, `children`

**StatusMessage.tsx**
- **Purpose**: Consistent display of success/error messages
- **Used in**: Forms and API interactions
- **Props**: `message`, `type` ('success' | 'error')

#### Layout Components (`components/layout/`)

**AppHeader.tsx**
- **Purpose**: Main application header with navigation and user actions
- **Features**: Menu dropdowns, user menu, search, notifications
- **Props**: `session`, `onSignOut`

**AppLayout.tsx**
- **Purpose**: Main layout wrapper with breadcrumbs and status messages
- **Features**: Breadcrumb display, status message handling
- **Props**: `session`, `status`, `children`

#### Page Components (`components/pages/`)

**ConsultationForm.tsx**
- **Purpose**: Patient consultation form for doctors
- **Features**: Symptoms, diagnosis, lab results, prescription fields
- **Props**: `session`, `appointmentId`

**PatientDetailsCard.tsx**
- **Purpose**: Display patient information in card format
- **Used in**: Dashboard, appointment pages
- **Props**: `patientDetails`, `showOnHome`

**LoginPage.tsx**
- **Purpose**: Login functionality for all user roles
- **Features**: Role-specific login, validation, navigation
- **Props**: `role` ("PATIENT" | "DOCTOR" | "ADMIN")

### 2. Hooks (`src/hooks/`)

#### useAuth.ts
- **Purpose**: Centralized authentication management
- **State**: `session`, `status`, `loginForm`, `patientRegistration`
- **Functions**: `handleLogin`, `handleLogout`, `registerPatient`, `checkRole`
- **Used in**: Login, registration, and route protection

#### useAppointments.ts
- **Purpose**: Appointment booking, management, and search
- **State**: `appointments`, `doctorAppointments`, `searchRows`, `bookingState`
- **Functions**: `loadPatientAppointments`, `bookAppointment`, `cancelAppointment`, `searchPatients`
- **Used in**: Patient and doctor appointment pages

#### useUserData.ts
- **Purpose**: User profile and data management
- **State**: `patientDetails`, `doctorDetails`, `adminDetails`, `adminUsers`, `adminReports`
- **Functions**: `loadPatientDetails`, `loadDoctorDetails`, `loadAdminDashboard`, `registerByAdmin`
- **Used in**: Profile pages and admin dashboard

#### useNavigation.ts
- **Purpose**: Navigation state and menu management
- **State**: `navigationState`, `submenuItems`
- **Functions**: `openMainMenu`, `closeAllMenus`, `isMenuItemActive`
- **Used in**: AppHeader and navigation components

### 3. Types (`src/types/`)

#### app.ts
- **Purpose**: Application-specific TypeScript interfaces
- **Exports**: `MainMenu`, `RegisterPayload`, `LoginFormState`, `ProtectedRouteProps`, etc.
- **Used in**: All components and hooks for type safety

### 4. Constants (`src/constants/`)

#### index.ts
- **Purpose**: Application-wide constants
- **Exports**: `COUNTRIES`, `DEFAULT_COUNTRY`, `STATUS_MESSAGE_DURATION`, etc.
- **Used in**: Forms, validation, and timing configurations

### 5. Configuration (`src/config/`)

#### menu.ts
- **Purpose**: Menu structure and navigation configuration
- **Exports**: `submenuMap`, `getMainMenuFromPath`
- **Used in**: Navigation components and routing

### 6. Utilities (`src/utils/`)

#### index.ts
- **Purpose**: Reusable utility functions
- **Exports**: `validateEmail`, `convertDateFormat`, `formatTime`, `parseErrorMessage`, `delay`
- **Used in**: Forms, data processing, and error handling

## 🔄 Data Flow Architecture

```
App Component
├── useAuth (Authentication State)
├── useNavigation (Navigation State)
├── useAppointments (Appointment Data)
└── useUserData (User Profiles)
    ↓
Components consume hooks via props
    ↓
UI renders based on state and user actions
```

## 🎯 Key Implementation Insights

### **Form Testing Best Practices**
- **Use Specific IDs**: Always use unique `id` attributes for form elements (e.g., `id="doctor-full-name"`)
- **Avoid Generic Selectors**: Don't use CSS classes or nth-child selectors for testing
- **Wait for URLs**: Use `page.waitForURL()` for login redirects
- **Test Validation**: Test both empty form submission and successful submission

### **Authentication Flow**
- **Patient Login**: Redirects to `/patients/appointments` after successful login
- **Doctor Login**: Redirects to `/doctors/today-appointments` after successful login
- **Admin Login**: Redirects to `/admin/dashboard` after successful login
- **Token Storage**: Uses React context, not localStorage for authentication tokens

### **Component Accessibility**
- **Password Fields**: Include `tabIndex={-1}` on toggle buttons for better keyboard navigation
- **Form Labels**: Use `htmlFor` attributes to link labels with form inputs
- **Error Messages**: Use StatusMessage component for consistent error display
- **Calendar Pickers**: Enhanced styling for cross-browser compatibility

### **API Integration**
- **CORS Configuration**: Backend must allow frontend origins (ports 5173 and 5174)
- **Error Handling**: Use try/catch blocks with proper error messages
- **Data Validation**: Validate both on frontend and backend
- **Authentication**: Include JWT tokens in Authorization headers

## 🎯 Benefits of This Architecture

### 1. **Separation of Concerns**
- Each module has a single responsibility
- Business logic separated from UI components
- Easy to test and maintain individual pieces

### 2. **Reusability**
- Common components can be used across multiple pages
- Hooks can be shared between different components
- Utilities and constants are centralized

### 3. **Type Safety**
- Comprehensive TypeScript definitions
- Clear interfaces for all props and state
- Reduced runtime errors

### 4. **Maintainability**
- Smaller, focused files are easier to understand
- Changes to one module don't affect others
- Clear dependencies between modules

### 5. **Scalability**
- Easy to add new pages and features
- Modular structure supports team collaboration
- Consistent patterns across the application

## 🚀 Usage Guidelines

### Adding New Components
1. Determine if it's a common, layout, or page component
2. Place in appropriate directory under `src/components/`
3. Export from `src/components/index.ts`
4. Add TypeScript types to `src/types/app.ts`

### Adding New Hooks
1. Create hook file in `src/hooks/`
2. Follow naming convention: `use[FeatureName].ts`
3. Export from `src/hooks/index.ts`
4. Document purpose and state management

### Adding New Constants
1. Add to appropriate constant file in `src/constants/`
2. Use descriptive naming (UPPER_CASE for constants)
3. Document purpose and usage

### Adding New Utilities
1. Add to `src/utils/index.ts`
2. Write comprehensive JSDoc comments
3. Include input/output types and examples

## 📝 Migration Notes

The original monolithic frontend architecture has been successfully migrated to a modular component-based structure:

- **20+ component files** (average 100-300 lines each)
- **4 hook files** (average 200-400 lines each)
- **Improved maintainability** and code organization
- **Better testability** with individual components
- **Enhanced developer experience** with clear separation of concerns
- **5 configuration/utility files** (average 50-150 lines each)
- **1 main App file** (~300 lines)

This reduces complexity while maintaining all functionality and improving maintainability.

## 🔧 Development Workflow

1. **Start with types**: Define interfaces in `src/types/app.ts`
2. **Create hooks**: Implement business logic in custom hooks
3. **Build components**: Create UI components using hooks
4. **Add to exports**: Update relevant `index.ts` files
5. **Test integration**: Ensure components work together
6. **Document**: Update this documentation for new patterns

## 📚 Related Files

- `App.tsx` - Main application using modular architecture
- `api.ts` - API layer (unchanged)
- `types.ts` - Base type definitions (unchanged)
- Component files in `/src/components/` - Modular UI components
- Hook files in `/src/hooks/` - Custom React hooks
- Utility files in `/src/utils/` - Helper functions and utilities
