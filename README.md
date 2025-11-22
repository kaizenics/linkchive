# Linkchive

**The bookmark manager with privacy at its core.**

Linkchive is a modern, privacy-focused bookmark management application built with Next.js. It allows users to organize their links into folders, search through their bookmarks, and manage their collection with an intuitive file-manager-style interface.

## Features

- **Secure Authentication** - Powered by Clerk for secure user authentication
- **Folder Organization** - Organize links into custom folders with a file-manager-style interface
- **Smart Search** - Search through your links by title, URL, or label
- **Favorites** - Mark important links as favorites for quick access
- **Pinned Folders** - Pin frequently used folders to the top
- **Dark Mode** - Beautiful dark and light themes with system preference detection
- **PWA Support** - Install as a Progressive Web App for offline access
- **Fast & Modern** - Built with Next.js 15, React 19, and tRPC for type-safe APIs
- **Privacy First** - Your data is stored securely with user-based isolation

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **GSAP** - Animation library
- **Next Themes** - Theme management

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM
- **Turso (LibSQL)** - Edge SQLite database
- **Clerk** - Authentication and user management
- **Zod** - Schema validation
- **Cheerio** - HTML parsing for link metadata extraction

### Development Tools
- **ESLint** - Code linting
- **Husky** - Git hooks
- **Drizzle Kit** - Database migrations and studio

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn** or **pnpm**
- A **Turso** account (for database)
- A **Clerk** account (for authentication)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/linkchive.git
cd linkchive
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Turso Database
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

#### Getting Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select an existing one
3. Navigate to **API Keys** section
4. Copy your **Publishable Key** and **Secret Key**

#### Getting Your Turso Credentials

1. Go to [Turso Dashboard](https://turso.tech/)
2. Create a new database or select an existing one
3. Navigate to the database settings
4. Copy your **Database URL** and **Auth Token**

### 4. Set Up the Database

Run database migrations to create the necessary tables:

```bash
npm run db:push
# or
npm run db:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
linkchive/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── trpc/          # tRPC API endpoint
│   ├── links/             # Links management page
│   │   ├── components/    # Link-specific components
│   │   └── utils/         # Link utilities and hooks
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/             # Shared components
│   ├── providers/         # Context providers (Theme, tRPC)
│   └── ui/                # Reusable UI components
├── db/                     # Database layer
│   ├── schema.ts          # Drizzle schema definitions
│   ├── queries.ts         # Database query functions
│   └── index.ts           # Database connection
├── lib/                    # Library code
│   ├── server/            # Server-side code
│   │   └── routers/       # tRPC routers
│   ├── trpc.ts            # tRPC configuration
│   └── utils.ts           # Utility functions
├── drizzle/                # Database migrations
├── public/                 # Static assets
├── scripts/                # Build scripts
├── middleware.ts           # Next.js middleware (auth)
└── package.json           # Dependencies and scripts
```

## Database Schema

### Folders Table
- `id` - Primary key (auto-increment)
- `name` - Folder name
- `userId` - Clerk user ID (foreign key)
- `isPinned` - Boolean flag for pinned folders
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Links Table
- `id` - Primary key (auto-increment)
- `url` - Link URL
- `title` - Link title
- `label` - Custom label/tag
- `userId` - Clerk user ID (foreign key)
- `folderId` - Optional folder reference
- `isFavorite` - Boolean flag for favorites
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Key Features Explained

### Authentication
- Uses Clerk middleware to protect routes
- `/links` route requires authentication
- Unauthenticated users are redirected to home page

### Link Management
- Add links with automatic title extraction from URLs
- Organize links into folders
- Move links between folders
- Mark links as favorites
- Search links by title, URL, or label
- Sort by date, alphabetical, or favorites

### Folder Management
- Create custom folders
- Rename folders
- Pin folders to top
- Delete folders (links are moved to root)

### tRPC API
The application uses tRPC for type-safe API calls:

- **Links Router** (`/api/trpc/links`)
  - `getAll` - Get all user's links
  - `getById` - Get a specific link
  - `create` - Create a new link
  - `update` - Update a link
  - `delete` - Delete a link
  - `toggleFavorite` - Toggle favorite status
  - `getFavorites` - Get all favorite links
  - `getByFolder` - Get links in a folder

- **Folders Router** (`/api/trpc/folders`)
  - `getAll` - Get all user's folders
  - `getById` - Get a specific folder
  - `create` - Create a new folder
  - `update` - Update a folder
  - `delete` - Delete a folder
  - `togglePin` - Toggle pin status
  - `getPinned` - Get all pinned folders
  - `getWithLinksCount` - Get folder with link count

- **Utils Router** (`/api/trpc/utils`)
  - `fetchTitle` - Extract title from URL

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/linkchive.git
   cd linkchive
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set Up Your Development Environment**
   - Follow the installation steps above
   - Create your own Clerk application and Turso database for development
   - Ensure all environment variables are set

4. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test Your Changes**
   ```bash
   npm run lint        # Check for linting errors
   npm run build       # Ensure build succeeds
   npm run dev         # Test in development
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # or
   git commit -m "fix: fix your bug description"
   ```

   **Commit Message Guidelines:**
   - Use conventional commits format
   - Prefix with `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, or `chore:`
   - Write clear, descriptive messages

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template (if available)
   - Describe your changes clearly
   - Link any related issues

### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Components**: Use functional components with hooks
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **Imports**: Organize imports (external, internal, relative)
- **Formatting**: Follow the existing code formatting
- **Comments**: Add comments for complex logic or non-obvious code

### Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (if applicable)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow conventional commits
- [ ] No console.logs or debug code left behind
- [ ] Environment variables are documented (if new ones are added)

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots (if applicable)

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Database Changes**
   ```bash
   # After modifying db/schema.ts
   npm run db:generate  # Generate migration
   npm run db:push      # Apply to database
   ```

3. **View Database**
   ```bash
   npm run db:studio    # Opens Drizzle Studio
   ```

4. **Type Checking**
   ```bash
   # TypeScript will check types automatically in your IDE
   # Or run: npx tsc --noEmit
   ```

### Areas for Contribution

- Bug fixes
- New features
- Documentation improvements
- UI/UX enhancements
- Performance optimizations
- Test coverage
- Internationalization
- Accessibility improvements

## License

[Add your license here - e.g., MIT, Apache 2.0, etc.]

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Clerk](https://clerk.com/) - Authentication
- [Turso](https://turso.tech/) - Edge Database
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Radix UI](https://www.radix-ui.com/) - Accessible components

## Support

For support, please open an issue on GitHub or contact [your contact information].

---

Made with love by the Linkchive team

