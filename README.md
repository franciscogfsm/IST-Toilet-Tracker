# IST Toilet Tracker

A modern, accessible web application for finding and reviewing bathrooms at Instituto Superior Técnico (IST). Built with React, TypeScript, and modern web technologies.

## 🏗️ Architecture Overview

This project follows a **feature-based architecture** designed for scalability and easy contribution. The codebase is organized into logical features that can be developed independently.

### 📁 Project Structure

```
src/
├── components/           # Shared UI components
│   ├── ui/              # Reusable UI primitives (buttons, inputs, etc.)
│   └── ...              # Other shared components
├── features/            # Feature-specific code
│   ├── bathrooms/       # Bathroom-related components & logic
│   ├── map/            # Map functionality
│   ├── reviews/        # Review system
│   └── search/         # Search and filtering
├── hooks/              # Custom React hooks
├── services/           # Business logic & API services
├── store/              # State management (if needed)
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── data/               # Static data files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/franciscogfsm/caganisto.git
cd caganisto

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Development Guidelines

### Code Organization

#### 1. Feature-Based Structure

Each feature is self-contained with its own:

- Components
- Hooks
- Services
- Types
- Tests (future)

**Example: Adding a new feature**

```bash
# Create feature directory
mkdir src/features/new-feature

# Add feature files
touch src/features/new-feature/NewFeature.tsx
touch src/features/new-feature/index.ts
touch src/features/new-feature/hooks/
touch src/features/new-feature/services/
```

#### 2. Component Guidelines

- **Small, focused components**: Each component should have a single responsibility
- **Custom hooks**: Extract complex logic into reusable hooks
- **Props interfaces**: Always define TypeScript interfaces for props
- **Accessibility**: Use semantic HTML and ARIA attributes

```typescript
// ✅ Good: Focused component with clear interface
interface BathroomCardProps {
  bathroom: Bathroom;
  onSelect?: (bathroom: Bathroom) => void;
  showDistance?: boolean;
}

export function BathroomCard({
  bathroom,
  onSelect,
  showDistance,
}: BathroomCardProps) {
  // Component logic here
}
```

#### 3. State Management

- **Local state**: Use `useState` for component-specific state
- **Shared state**: Use custom hooks for feature-level state
- **Global state**: Use services for app-wide business logic

### Adding New Features

#### Step 1: Plan Your Feature

1. **Define the feature scope**: What problem does it solve?
2. **Identify dependencies**: Which existing features does it interact with?
3. **Design the API**: How will other parts of the app use it?

#### Step 2: Create Feature Structure

```bash
# Create feature directory
mkdir src/features/your-feature

# Create main component
touch src/features/your-feature/YourFeature.tsx

# Create supporting files
touch src/features/your-feature/index.ts
touch src/features/your-feature/hooks/useYourFeature.ts
touch src/features/your-feature/services/yourFeatureService.ts
```

#### Step 3: Implement Core Logic

```typescript
// src/features/your-feature/services/yourFeatureService.ts
export class YourFeatureService {
  static getInstance(): YourFeatureService {
    // Singleton pattern for services
  }

  async getData(): Promise<Data[]> {
    // Business logic here
  }
}

// src/features/your-feature/hooks/useYourFeature.ts
export function useYourFeature() {
  // Custom hook logic
  return {
    data,
    loading,
    error,
    refetch,
  };
}

// src/features/your-feature/YourFeature.tsx
export function YourFeature() {
  const { data, loading } = useYourFeature();

  if (loading) return <Skeleton />;

  return <div>{/* Your feature UI */}</div>;
}
```

#### Step 4: Export from Feature Index

```typescript
// src/features/your-feature/index.ts
export { YourFeature } from "./YourFeature";
export { useYourFeature } from "./hooks/useYourFeature";
export { YourFeatureService } from "./services/yourFeatureService";
```

#### Step 5: Integrate into Main App

```typescript
// src/pages/Index.tsx
import { YourFeature } from "@/features/your-feature";

export function Index() {
  return (
    <div>
      {/* Existing content */}
      <YourFeature />
    </div>
  );
}
```

### Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

#### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### TypeScript

- All code must be TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Use generics where appropriate

#### Naming Conventions

- **Components**: PascalCase (`BathroomCard`)
- **Hooks**: camelCase with `use` prefix (`useBathrooms`)
- **Services**: PascalCase with `Service` suffix (`BathroomService`)
- **Types**: PascalCase (`Bathroom`, `Review`)
- **Files**: kebab-case (`bathroom-card.tsx`)

### Performance

- Use `React.memo` for expensive components
- Implement lazy loading for routes and heavy components
- Optimize images and assets
- Use proper key props in lists
- Debounce search inputs

## 📋 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test your changes**: `npm run dev`
5. **Commit your changes**: `git commit -m "Add your feature"`
6. **Push to your branch**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

### Pull Request Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what the PR does and why
- **Testing**: Describe how you tested the changes
- **Screenshots**: Include screenshots for UI changes
- **Breaking Changes**: Clearly mark any breaking changes

### Code Review Process

1. **Automated Checks**: CI/CD runs linting and tests
2. **Peer Review**: At least one maintainer reviews the code
3. **Approval**: PR is approved and merged
4. **Deployment**: Changes are automatically deployed

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_API_URL=http://localhost:3000/api
VITE_MAP_API_KEY=your_map_api_key
```

### Build Configuration

The build configuration is in `vite.config.ts`. Key optimizations include:

- **Chunk splitting**: Automatic code splitting for better caching
- **Minification**: Terser for production builds
- **Asset optimization**: Image compression and optimization

## 📚 API Documentation

### Bathroom Service

```typescript
import { BathroomService } from "@/services/bathroomService";

const service = BathroomService.getInstance();

// Get all bathrooms
const bathrooms = service.getAllBathrooms();

// Search bathrooms
const results = service.searchBathrooms("informatics");

// Add review
service.addReview("bathroom_id", {
  rating: 5,
  comment: "Great bathroom!",
  user: "John Doe",
  cleanliness: 5,
  paperSupply: 4,
  privacy: 5,
});
```

### Location Service

```typescript
import { LocationService } from "@/services/locationService";

const locationService = LocationService.getInstance();

// Request user location
const locationState = await locationService.requestLocation();

// Calculate distance
const distance = locationService.calculateDistance(lat1, lng1, lat2, lng2);
```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are installed with `npm install`
2. **TypeScript errors**: Run `npm run lint` to check for type issues
3. **Development server not starting**: Check that port 8081 is available

### Getting Help

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and inline code comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- IST community for feedback and contributions
- React and TypeScript communities for excellent tools
- All contributors who help make this project better

---

**Happy coding! 🎉**
