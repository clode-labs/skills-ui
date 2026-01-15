# Quick Start Guide

## Running the Development Server

```bash
cd skills-ui
npm install  # If you haven't already
npm run dev
```

The app will be available at `http://localhost:5173`

## What You'll See

1. **Home Page** - Browse and search skills with filters
2. **Featured Skills** - Highlighted skills in a grid layout
3. **Skill Details** - Click any skill to see detailed information
4. **Categories** - Browse skills organized by category
5. **Tags** - Filter skills by tags
6. **Submit Form** - Add new skills to the registry

## Connecting to the Backend

Make sure your Aramb Skills backend is running on `http://localhost:8080`

To change the API URL, update `.env`:
```
VITE_API_BASE_URL=http://your-api-url:port
```

## Key Features Implemented

### Layout
- **Sidebar Navigation** - Fixed left sidebar with menu items
- **Header** - Search bar and action buttons
- **Responsive Design** - Works on different screen sizes

### Pages
- **Home/Skills List**
  - Search functionality
  - Filter by status (All, Featured, Latest)
  - Filter by category (dropdown)
  - Grid layout of skill cards
  - Real-time API integration

- **Skill Detail**
  - Full skill information
  - Author details
  - Stats (stars, downloads)
  - Tags and category
  - Source link

- **Categories Page**
  - List all categories
  - Click to filter skills

- **Tags Page**
  - List all tags
  - Click to filter skills

- **Submit Page**
  - Form to submit new skills
  - All required fields
  - Category and tag selection

### Components
- **SkillCard** - Reusable card component for displaying skills
- **Sidebar** - Navigation menu
- **Header** - Search and actions
- **Layout** - Main layout wrapper

### API Integration
- TypeScript types matching backend models
- Service layer for API calls
- Error handling
- Loading states

## Design Inspiration

The UI is inspired by [mcp.so](https://mcp.so/) with:
- Clean, modern design
- Card-based layouts
- Red/orange color scheme
- Grid layouts for content
- Clear navigation

## Next Steps

1. **Test with Real Data** - Make sure your backend has some seed data
2. **Customize** - Update colors, layout, or add features
3. **Deploy** - Build for production with `npm run build`

Enjoy building with Aramb Skills! 🚀
