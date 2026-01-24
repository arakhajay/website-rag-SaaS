---
name: Shadcn UI Expert
description: A skill for implementing Shadcn UI components, establishing design systems, and managing dependencies.
---

# Shadcn UI Development Guide

This skill provides the knowledge required to effectively use Shadcn UI in React/Next.js projects.

## 1. Initialization
When initializing Shadcn UI in a project:
- **Command**: Run `npx shadcn@latest init`.
- **Configuration**:
  - Style: Default or New York (listen to user preference, default to New York for more extensive options).
  - Base Color: Slate/Zinc/Neutral/etc.
  - CSS Variables: Yes (highly recommended).
  - React Server Components: Yes (for Next.js App Router).

## 2. Adding Components
- **Preferred Method**: Use the CLI to add components.
  - Command: `npx shadcn@latest add [component-name]`
  - Example: `npx shadcn@latest add button card dialog`
- **Batching**: You can add multiple components in one command.
- **Manual Method**: Only if the CLI is unavailable, copy the code from the official docs into `components/ui/[component].tsx` and install necessary dependencies (e.g., `@radix-ui/react-xxx`).

## 3. Project Structure
- **Components**: `components/ui/` (default for shadcn components).
- **Utils**: `lib/utils.ts` (contains the `cn` helper).
- **Styles**: `app/globals.css` (contains Tailwind directives and CSS variables).

## 4. The `cn` Utility
All components must use the `cn` utility for class merging.
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 5. Forms (React Hook Form + Zod)
When building forms:
1. `npx shadcn@latest add form input button`
2. Define a Zod schema.
3. Use `useForm` hook.
4. Implement `<Form>` components as per shadcn patterns.

## 6. Dark Mode
- Install `next-themes`.
- Wrap the app in a `ThemeProvider`.
- Use the standard `ModeToggle` component pattern.
