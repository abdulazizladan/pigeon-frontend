# Pigeon

**Pigeon** is a comprehensive fuel station management system built with Angular. It provides role-based dashboards and tools for managing fuel stations, sales, dispensers, staff, and performance analytics across an organization.

## Overview

Pigeon is designed to streamline operations for fuel station networks by providing:
- **Role-based access control** with dedicated interfaces for Admins, Directors, and Managers
- **Real-time sales tracking** and reporting
- **Station and dispenser management**
- **Performance analytics** with charts and visualizations
- **Issue tracking** and ticket management
- **User and manager administration**

## Tech Stack

- **Framework**: Angular 20.1.2
- **UI Components**: Angular Material 20.1.3
- **State Management**: NgRx Signals 19.2.1
- **Charts**: Chart.js 4.4.9 with ng2-charts 8.0.0
- **Authentication**: JWT with @nestjs/jwt and jwt-decode
- **Styling**: SCSS with Angular Flex Layout
- **Validation**: class-validator and class-transformer

## Project Structure

```
src/app/
├── auth/                    # Authentication module (login, guards, interceptors)
├── users/                   # Role-based user modules
│   ├── admin/              # Admin dashboard and features
│   ├── director/           # Director dashboard and features
│   └── manager/            # Manager dashboard and features
└── features/               # Shared feature modules
    ├── users-management/       # User CRUD operations
    ├── stations-management/    # Multi-station management (Director)
    ├── station-management/     # Single station management (Manager)
    ├── sales-management/       # Sales recording and tracking
    ├── sales-records-manaement/ # Sales reports and analytics
    ├── dispensers-management/  # Pump/dispenser management
    ├── managers-management/    # Manager assignment and oversight
    └── tickets-management/     # Issue tracking system
```

## User Roles & Features

### Admin
- **Dashboard**: System-wide overview and statistics
- **User Management**: Create, update, and manage all users
- **Issue Management**: View and resolve support tickets
- **Settings**: System configuration and preferences

### Director
- **Dashboard**: Organization-wide performance metrics
- **Stations Management**: Oversee all fuel stations
- **Sales Analytics**: View aggregated sales data and trends
- **Manager Management**: Assign and manage station managers
- **Issue Management**: Track and resolve operational issues

### Manager
- **Dashboard**: Station-specific performance overview
- **My Station**: Manage assigned fuel station details
- **Dispensers**: Monitor and manage pumps/dispensers
- **Sales Management**: Record daily sales per pump
- **Profile & Settings**: Personal account management

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Angular CLI 20.1.1

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pigeon/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Update `src/environments/environment.ts` with your backend API URL

### Development Server

Start the development server:
```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload when you make changes.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma

## Building for Production

Build the project for production:
```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory, optimized for performance.

## Authentication & Authorization

The application uses JWT-based authentication with role-based access control:
- **AuthGuard**: Protects routes requiring authentication
- **RoleGuard**: Enforces role-based access (admin, director, manager)
- Routes automatically redirect based on user role after login

## API Integration

The frontend integrates with a NestJS backend. Key endpoints include:
- Sales reporting and aggregations
- Station performance metrics
- User and manager management
- Ticket/issue tracking

See `ref.txt` for detailed API endpoint documentation.

## State Management

The application uses **NgRx Signals** for reactive state management:
- Centralized stores for users, stations, sales, and tickets
- Reactive data flow with signals
- Optimized change detection

## Styling & Theming

- **SCSS** for component styling
- **Angular Material** theming with custom color palettes
- **Responsive design** with Angular Flex Layout
- Theme configuration in `_theme-colors.scss`

## Code Scaffolding

Generate new components:
```bash
ng generate component component-name
```

View all available schematics:
```bash
ng generate --help
```

## Testing

Run unit tests:
```bash
npm test
```

Tests are executed using Karma with Jasmine framework.

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io)
- [Chart.js Documentation](https://www.chartjs.org)

## License

This project is proprietary software.
