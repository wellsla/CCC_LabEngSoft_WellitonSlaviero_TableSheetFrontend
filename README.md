# TableSheet - RPG Companion App

This is a Next.js application designed to be a digital companion for tabletop RPG players and game masters.

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **Forms**: React Hook Form with Zod for validation
*   **API Communication**: Axios
*   **Backend**: Laravel API

## Project Structure

```
/src
|-- /app/                 # Next.js App Router: all pages and layouts
|   |-- /admin/           # Admin-only routes for managing data
|   |-- /auth/            # Authentication pages (login, register, etc.)
|   |-- /characters/      # Character management pages (list, create, edit, view)
|   |-- /games/           # Public game listing and detail pages
|   |-- /profile/         # User profile page
|   |-- /rulebooks/       # PDF viewer for rulebooks
|   |-- layout.tsx        # Root layout for the entire application
|   |-- page.tsx          # Homepage
|   `-- globals.css       # Global styles and Tailwind theme variables
|
|-- /components/          # Reusable components
|   |-- /layout/          # Layout components like Header, Footer
|   |-- /profile/         # Components specific to the user profile
|   `-- /ui/              # Core UI components from shadcn/ui
|
|-- /hooks/               # Custom React hooks (e.g., useToast)
|
|-- /lib/                 # Libraries, helpers, and API configuration
|   |-- apiClient.ts      # Axios instance and API function implementations
|   |-- pdfGenerator.ts   # Logic for generating character sheet PDFs
|   `-- utils.ts          # Utility functions (e.g., cn for classnames)
|
`-- /services/            # Data-layer services that interact with the API client
    |-- auth.ts
    |-- book.ts
    |-- character.ts
    |-- class.ts
    |-- game.ts
    |-- race.ts
    `-- userProfile.ts
```

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

The application requires environment variables to connect to the backend API.

1.  Create a new file named `.env.local` in the root of the project.
2.  Copy the contents of `.env.example` into your new `.env.local` file.
3.  Update the `NEXT_PUBLIC_API_URL` with the URL of your backend API.

**`.env.local`**
```
NEXT_PUBLIC_API_URL=http://your-backend-api-url/api
```

### Running the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

*   `npm run dev`: Starts the development server with hot-reloading.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the code to check for errors and style issues.
*   `npm run lint:fix`: Automatically fixes linting issues.
*   `npm run format`: Formats all code using Prettier.
