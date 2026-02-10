@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: 'Inter', var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Custom colors */
  --color-indigo: #6366F1;
  --color-indigo-dark: #4F46E5;
  --color-purple: #9333EA;
  --color-coral: #F97316;
  --color-success: #22C55E;
}

:root {
  --radius: 0.75rem;
  --background: #0a0a0f;
  --foreground: #ffffff;
  --card: #111118;
  --card-foreground: #ffffff;
  --popover: #111118;
  --popover-foreground: #ffffff;
  --primary: #6366F1;
  --primary-foreground: #ffffff;
  --secondary: #1a1a24;
  --secondary-foreground: #ffffff;
  --muted: #1a1a24;
  --muted-foreground: #9CA3AF;
  --accent: #9333EA;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.08);
  --ring: #6366F1;
  --chart-1: #6366F1;
  --chart-2: #9333EA;
  --chart-3: #F97316;
  --chart-4: #22C55E;
  --chart-5: #3B82F6;
  --sidebar: #111118;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #6366F1;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1a1a24;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255, 255, 255, 0.08);
  --sidebar-ring: #6366F1;
}

.dark {
  --background: #0a0a0f;
  --foreground: #ffffff;
  --card: #111118;
  --card-foreground: #ffffff;
  --popover: #111118;
  --popover-foreground: #ffffff;
  --primary: #6366F1;
  --primary-foreground: #ffffff;
  --secondary: #1a1a24;
  --secondary-foreground: #ffffff;
  --muted: #1a1a24;
  --muted-foreground: #9CA3AF;
  --accent: #9333EA;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.08);
  --ring: #6366F1;
  --chart-1: #6366F1;
  --chart-2: #9333EA;
  --chart-3: #F97316;
  --chart-4: #22C55E;
  --chart-5: #3B82F6;
  --sidebar: #111118;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #6366F1;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1a1a24;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: rgba(255, 255, 255, 0.08);
  --sidebar-ring: #6366F1;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

/* Custom utilities */
@layer utilities {

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, #6366F1, #9333EA, #F97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Glassmorphism */
  .glass {
    background: rgba(17, 17, 24, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-strong {
    background: rgba(17, 17, 24, 0.9);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Glow effects */
  .glow-primary {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
  }

  .glow-accent {
    box-shadow: 0 0 40px rgba(147, 51, 234, 0.3);
  }

  .glow-cta {
    box-shadow: 0 0 40px rgba(249, 115, 22, 0.4);
  }

  /* Gradient backgrounds */
  .bg-gradient-radial {
    background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  }

  .bg-gradient-hero {
    background:
      radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 60%);
  }

  /* Animated gradient border */
  .gradient-border {
    position: relative;
    border-radius: var(--radius);
  }

  .gradient-border::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(135deg, #6366F1, #9333EA, #F97316);
    z-index: -1;
    opacity: 0.5;
  }

  /* Popular badge glow */
  .glow-popular {
    box-shadow:
      0 0 20px rgba(99, 102, 241, 0.5),
      0 0 40px rgba(99, 102, 241, 0.3),
      0 0 60px rgba(99, 102, 241, 0.2);
  }

  /* Text shadow for headings */
  .text-glow {
    text-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
  }

  /* Floating animation */
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  /* Pulse glow animation */
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  /* Shimmer animation */
  .animate-shimmer {
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 50%,
        transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
}

/* Keyframes */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }

  50% {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0a0f;
}

::-webkit-scrollbar-thumb {
  background: #1a1a24;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2a2a34;
}

/* Selection color */
::selection {
  background: rgba(99, 102, 241, 0.3);
  color: white;
}