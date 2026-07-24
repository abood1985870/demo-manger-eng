# Cafe Connect ☕

A professional application that connects cafes and customers. It features a dashboard for cafe management, monthly subscriptions, and a modern app for customers to discover and order from cafes.

## Project Structure

This project is divided into two main parts: the **Backend** (Laravel) and the **Frontend** (Flutter).

### 1. Backend (Laravel 12, PHP 8.4)
Built with an advanced architecture incorporating Repository Pattern and Service Layer to maintain a clean separation of concerns and a highly scalable RESTful API.

- **Framework:** Laravel 12
- **Language:** PHP 8.4
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **Architecture:** Repository & Service Pattern

**Core Modules:**
- `Authentication`
- `Users`
- `Cafes`
- `Categories`
- `Products`
- `Orders`
- `Offers`
- `Reviews`
- `Favorites`
- `Notifications`
- `Payments`
- `Subscriptions`
- `Admin`

### 2. Frontend (Flutter, Material 3)
A modern, cross-platform mobile application built with Flutter using Clean Architecture principles to ensure maintainability, testability, and a seamless user experience.

- **Framework:** Flutter (Latest Stable)
- **Design System:** Material 3
- **Architecture:** Clean Architecture (Domain, Data, Presentation layers)

**Core Features:**
- `Authentication`
- `Home`
- `Cafes`
- `Orders`
- `Favorites`
- `Offers`
- `Profile`
- `Admin`

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `composer install` to install dependencies.
3. Copy `.env.example` to `.env` (or use the pre-configured `.env` file).
4. Generate the application key: `php artisan key:generate`.
5. Run the database migrations: `php artisan migrate`.
6. Start the local server: `php artisan serve`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `flutter pub get` to install dependencies.
3. Configure the base API URL in the Flutter app to point to your local Laravel server (e.g., `http://10.0.2.2:8000` for Android emulator or `http://localhost:8000` for iOS simulator).
4. Run the app: `flutter run`.

## Git Workflow
The project is initialized with Git. Ensure to follow standard branch naming conventions (e.g., `feature/module-name`, `fix/issue-description`).
