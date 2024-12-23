# Application Route Structure

## Root Routes (`/app/routes/`)

### User/Customer Routes (`_app+/`)
Main routes for authenticated users:

- `_index.tsx` - Root redirect to /books
- `_layout.tsx` - Main layout with sidebar navigation
- **books+/**
  - `_index.tsx` - Lists all available books
  - `$id.purchase.tsx` - Book purchase flow
- **rented-books+/**
  - `_index.tsx` - Lists user's rented books
  - `$id.rental-payment.tsx` - Rental payment processing
- `purchased-books.tsx` - Lists user's purchased books
- `invoices.tsx` - User's payment history

### Authentication Routes (`_auth+/`)
Handles authentication functionality:

- `_layout.tsx` - Authentication pages layout
- `login.tsx` - User login
- `register.tsx` - New user registration
- `logout.tsx` - Handles user logout

### Admin Routes (`admin+/`)
Administrative section for system management:

- `_index.tsx` - Admin dashboard redirect to /admin/books
- `_layout.tsx` - Admin area layout
- **books+/**
  - `_index.tsx` - Manage all books
- **genre+/**
  - `_index.tsx` - List all genres
  - `new.tsx` - Add new genre
  - `$id.edit.tsx` - Edit genre
- **libraries+/**
  - `_index.tsx` - List all libraries
  - `new.tsx` - Add new library
  - `$id.edit.tsx` - Edit library
- **librarians+/**
  - `_index.tsx` - List all librarians
  - `new.tsx` - Add new librarian
  - `$id.edit.tsx` - Edit librarian
- `purchased-books.tsx` - View all book purchases
- `rented-books.tsx` - View all book rentals

## Route Naming Conventions

### Prefix Meanings
- `_app+/` - User/customer routes requiring authentication
- `_auth+/` - Public authentication routes
- `admin+/` - Admin-only routes

### Special Characters
- `+` - Route grouping (nested routes)
- `$` - Dynamic parameters (e.g., `$id`)
- `_` - Special handling (layouts, indexes)

## Data Flow Examples

1. **Book Purchase Flow**
   - User browses books at `/books`
   - Selects book to purchase
   - Completes purchase at `/books/$id/purchase`
   - Views purchased books at `/purchased-books`
   - Views invoice at `/invoices`

2. **Book Rental Flow**
   - User browses books at `/books`
   - Rents a book
   - Views rented books at `/rented-books`
   - Processes return payment at `/rented-books/$id/rental-payment`
   - Views invoice at `/invoices`

3. **Library Management Flow**
   - Admin manages libraries at `/admin/libraries`
   - Creates new libraries at `/admin/libraries/new`
   - Assigns librarians
   - Manages book inventory

# Data Flow and Feature Documentation

## Core Features & Data Flow

### 1. User Authentication System
**Flow: `_auth+/`**
- **Registration (`/register`)**
  - Collects:
    - Name
    - Email
    - Password
  - Role assignment (default: customer)
  - Data stored in User table

- **Login (`/login`)**
  - Role-based authentication
  - Redirects based on user role:
    - Customers → `/books`
    - Admins → `/admin/books`

### 2. Book Management System
**Flow: `_app+/` and `admin+/`**

- **Book Browsing (`/books`)**
  - View all available books
  - Filter by genre
  - Purchase or rent options
  - Access to PDF previews

- **Book Purchase (`/books/$id/purchase`)**
  - Payment processing
  - PDF access
  - Invoice generation

- **Book Rental (`/rented-books`)**
  - Rental period tracking
  - Return processing
  - Late fee calculation
  - Payment handling

### 3. Library System
**Flow: `admin+/libraries`**

1. **Library Management**
   - Create/edit libraries
   - Assign librarians
   - Track book inventory
   - Manage locations

2. **Librarian Management**
   - Create librarian accounts
   - Assign to libraries
   - Track performance
   - Manage permissions

### 4. Payment and Invoice System
**Multiple touchpoints**

1. **Purchase Payments**
   - Direct book purchases
   - Payment processing
   - Invoice generation
   - PDF access provision

2. **Rental Payments**
   - Initial rental fee
   - Return processing
   - Late fee calculation
   - Payment collection


### Data Protection
- Encrypted passwords
- Secure session management
- Role-based access control
- Protected PDF access
- Secure payment processing

This documentation outlines the main components and data flows of the library management system, showing how different parts interact while maintaining security and user role separation. The system is designed for scalability and efficient management of library resources. 