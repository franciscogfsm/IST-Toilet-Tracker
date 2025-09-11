# Contributing to IST Toilet Tracker

Thank you for your interest in contributing to the IST Toilet Tracker! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### 1. **Environment Setup**

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/caganisto.git
cd caganisto

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. **Project Structure Overview**

```
src/
├── features/          # Feature-based modules
│   ├── bathrooms/     # Bathroom management
│   ├── map/          # Map functionality
│   ├── reviews/      # Review system
│   └── search/       # Search and filtering
├── hooks/            # Custom React hooks
├── services/         # Business logic & API services
├── types/            # TypeScript definitions
├── components/       # Shared UI components
└── lib/             # Utilities
```

## 🛠️ Development Workflow

### **Creating a New Feature**

1. **Plan your feature** in a GitHub issue
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Follow the feature structure**:

```bash
# Create feature directory
mkdir src/features/your-feature

# Create required files
touch src/features/your-feature/YourFeature.tsx
touch src/features/your-feature/hooks/useYourFeature.ts
touch src/features/your-feature/services/yourFeatureService.ts
touch src/features/your-feature/index.ts
```

4. **Implement using the established patterns**
5. **Test thoroughly**
6. **Create a pull request**

### **Code Standards**

#### **TypeScript**

- Use strict type checking
- Define interfaces for all props and data structures
- Use generics when appropriate
- Avoid `any` type

#### **React**

- Use functional components with hooks
- Extract custom logic into custom hooks
- Use `React.memo` for expensive components
- Follow the single responsibility principle

#### **Styling**

- Use Tailwind CSS classes
- Follow the established design system
- Ensure responsive design
- Maintain accessibility standards

### **Example: Adding a New Feature**

```typescript
// src/features/example/ExampleFeature.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExampleFeatureProps {
  title: string;
  onAction?: () => void;
}

export function ExampleFeature({ title, onAction }: ExampleFeatureProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">Count: {count}</p>
      <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
    </div>
  );
}
```

## 📋 Contribution Guidelines

### **Issues**

- Use issue templates when available
- Provide clear, descriptive titles
- Include steps to reproduce for bugs
- Suggest solutions for feature requests

### **Pull Requests**

- Reference related issues
- Include screenshots for UI changes
- Keep PRs focused on a single feature/fix
- Write clear commit messages

### **Commit Messages**

```
feat: add bathroom filtering by accessibility
fix: resolve map marker positioning bug
docs: update API documentation
style: format code with prettier
refactor: extract bathroom service logic
```

## 🧪 Testing

### **Manual Testing Checklist**

- [ ] Test on different screen sizes
- [ ] Test with slow network connection
- [ ] Test accessibility with keyboard navigation
- [ ] Test on different browsers
- [ ] Verify no console errors

### **Code Review Checklist**

- [ ] TypeScript types are correct
- [ ] No ESLint errors
- [ ] Component follows established patterns
- [ ] Proper error handling
- [ ] Code is well-documented

## 🎯 Feature Ideas

### **High Priority**

- [ ] Dark mode support
- [ ] Offline functionality
- [ ] Push notifications for updates
- [ ] Advanced filtering options

### **Medium Priority**

- [ ] Bathroom reservation system
- [ ] Photo uploads for reviews
- [ ] Social sharing features
- [ ] Multi-language support

### **Low Priority**

- [ ] Bathroom usage statistics
- [ ] Maintenance reporting
- [ ] Integration with campus calendar
- [ ] QR code generation

## 📚 Resources

### **Documentation**

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)

### **Tools**

- [ESLint](https://eslint.org/docs/user-guide/getting-started)
- [Prettier](https://prettier.io/docs/en/index.html)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professional communication

## 📞 Getting Help

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the README and inline comments

---

**Happy contributing! 🎉**
