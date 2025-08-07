# **App Name**: Taco's Task Manager

## Core Features:

- Authentication Setup: Firebase Authentication setup with email/password, phone number (SMS verification), Google social login, Anonymous login, and Passkeys.
- FusionAuth Integration: Setup OIDC integration with FusionAuth for secure authentication.
- Task Management UI: User interface elements for managing tasks: adding, editing, and deleting tasks with a Trello-like board structure (drag and drop cards between columns).
- Kanban Board: Visually distinguish and track progress within your project workflows, adding depth and detail to task items.
- Protected Routes: Protected routes to ensure that only authenticated users can access the task management functionalities using Firebase Authentication in Next.js.

## Style Guidelines:

- Primary color: FusionAuth orange (#F58320) to represent the FusionAuth brand, with an energetic and confident tone.
- Background color: Very light orange (#FAF0E7), almost white, for a clean and calm user interface.
- Accent color: Dark navy (#1E293B) for interactive elements, providing a sophisticated contrast to the orange.
- Font pairing: 'Poppins' (sans-serif) for headers paired with 'PT Sans' (sans-serif) for body text; creates a balance of modernity and readability.
- Icons: Use clear and functional icons sourced from libraries such as 'Font Awesome' to represent task actions and categories.
- Layout: Implement a clear, intuitive layout using Tailwind CSS grid system, optimized for desktop and mobile responsiveness.