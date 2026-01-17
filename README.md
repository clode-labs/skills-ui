# Aramb Skills UI

A modern, searchable skills registry UI built with React, TypeScript, and Vite. Inspired by [mcp.so](https://mcp.so/).

## Features

- **Search & Browse**: Search skills by name, browse by category, or filter by tags
- **Featured Skills**: Highlight popular and featured skills
- **Skill Details**: View detailed information about each skill including author, stats, and usage
- **Submit Skills**: Form to submit new skills to the registry
- **Responsive Design**: Modern UI with Tailwind CSS
- **Type-Safe**: Built with TypeScript for better development experience

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create your `.env` file:

```bash
cp .env.example .env
```

3. Update the API base URL in `.env` if needed:

```
VITE_API_BASE_URL=http://localhost:8080
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.tsx   # Top navigation bar
│   ├── Sidebar.tsx  # Side navigation menu
│   ├── Layout.tsx   # Main layout wrapper
│   └── SkillCard.tsx # Skill card component
├── pages/           # Page components
│   ├── Home.tsx     # Skills list with filters
│   ├── SkillDetail.tsx # Individual skill page
│   ├── Categories.tsx  # Categories list
│   ├── Tags.tsx        # Tags list
│   └── Submit.tsx      # Submit skill form
├── services/        # API service layer
│   └── api.ts       # API client
├── types/           # TypeScript types
│   └── index.ts     # Shared types
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## API Integration

The UI connects to the Aramb Skills backend API. Make sure the backend is running before starting the UI.

Available endpoints:

- `GET /skills` - List skills with filtering
- `GET /skills/search` - Search skills
- `GET /skills/featured` - Get featured skills
- `GET /skills/:author/:slug` - Get skill details
- `GET /categories` - List categories
- `GET /tags` - List tags

## Features Overview

### Home Page

- Search bar for finding skills
- Filter tabs (All, Featured, Latest)
- Category dropdown filter
- Grid layout of skill cards
- Pagination support

### Skill Detail Page

- Comprehensive skill information
- Author details
- Download and star counts
- Tags and categories
- Source link
- Related metadata (license, compatibility, etc.)

### Submit Page

- Form to submit new skills
- Category selection
- Tag management
- Validation

### Categories & Tags

- Browse skills by category
- Browse skills by tag
- Click to filter skills

## Customization

### Colors

The primary color scheme uses red/orange gradients. To change this, update the colors in:

- `tailwind.config.js` - Theme colors
- Component class names with color utilities

### Layout

The sidebar width is fixed at 256px (`w-64`). To adjust:

- Update `Sidebar.tsx` width class
- Update `Layout.tsx` left margin (`ml-64`)

## Development Tips

1. **Hot Module Replacement**: Vite provides instant HMR for fast development
2. **Type Safety**: Use TypeScript types from `src/types/index.ts`
3. **API Errors**: Check browser console for API connection issues
4. **Tailwind Classes**: Use Tailwind's utility classes for styling

## Contributing

When adding new features:

1. Add TypeScript types to `src/types/`
2. Create reusable components in `src/components/`
3. Use the existing API service pattern
4. Follow the existing code style

## License

MIT
