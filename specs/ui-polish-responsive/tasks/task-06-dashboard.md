# Task 06: Dashboard Page

## Status

pending

## Wave

2

## Description

Update the dashboard page to use shadcn Card components instead of bare divs, add responsive breakpoints, improve the loading state, and add visual polish. The dashboard currently has two plain `<div>` cards with `border border-border rounded-lg` and a simple "Loading..." text.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 defines the `card-interactive` utility class in globals.css and updates the primary color to a blue-tinted hue. This task uses `card-interactive` on cards and `text-primary` on new icon accents.

## Files to Modify

- `src/app/dashboard/page.tsx` — Replace divs with Cards, add responsive classes, improve loading

## Technical Details

### Implementation Steps

1. **Add new imports**. The file currently imports: `Link`, `Lock`, `UserProfile`, `Button`, `useDiagnostics`, `useSession`. Add these:

```tsx
import { Lock, Bot, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
```

Remove the existing `Lock` from the lucide-react import (it's being re-imported in the combined import).

2. **Update loading state** (lines 15-19). Change:

```tsx
return (
  <div className="flex justify-center items-center h-screen">
    Loading...
  </div>
);
```

To:

```tsx
return (
  <div className="flex justify-center items-center h-screen">
    <Spinner size="lg" />
  </div>
);
```

3. **Update unauthenticated state container** (line 24). Change:

```
className="container mx-auto px-4 py-12"
```

To:

```
className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
```

4. **Wrap unauthenticated content in Card** (lines 26-34). Change:

```tsx
<div className="mb-8">
  <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
  <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
  <p className="text-muted-foreground mb-6">
    You need to sign in to access the dashboard
  </p>
</div>
```

To:

```tsx
<Card className="mb-8 text-center">
  <CardContent className="pt-6">
    <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
    <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
    <p className="text-muted-foreground mb-6">
      You need to sign in to access the dashboard
    </p>
  </CardContent>
</Card>
```

5. **Update authenticated container** (line 40). Change:

```
className="container mx-auto p-6"
```

To:

```
className="container mx-auto p-4 sm:p-6 max-w-5xl"
```

6. **Update title section** (lines 41-43). Change:

```tsx
<div className="flex justify-between items-center mb-8">
  <h1 className="text-3xl font-bold">Dashboard</h1>
</div>
```

To:

```tsx
<div className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">
  <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
</div>
```

7. **Update card grid** (line 45). Change:

```
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

To:

```
className="grid grid-cols-1 sm:grid-cols-2 gap-6"
```

8. **Replace AI Chat card div** (lines 46-59). Change:

```tsx
<div className="p-6 border border-border rounded-lg">
  <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
  <p className="text-muted-foreground mb-4">
    Start a conversation with AI using the Vercel AI SDK
  </p>
  ...button...
</div>
```

To:

```tsx
<Card className="card-interactive">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Bot className="h-5 w-5 text-primary" />
      AI Chat
    </CardTitle>
    <CardDescription>
      Start a conversation with AI using the Vercel AI SDK
    </CardDescription>
  </CardHeader>
  <CardContent>
    ...button stays the same...
  </CardContent>
</Card>
```

9. **Replace Profile card div** (lines 62-76). Change:

```tsx
<div className="p-6 border border-border rounded-lg">
  <h2 className="text-xl font-semibold mb-2">Profile</h2>
  <p className="text-muted-foreground mb-4">
    Manage your account settings and preferences
  </p>
  <div className="space-y-2">
    <p><strong>Name:</strong> {session.user.name}</p>
    <p><strong>Email:</strong> {session.user.email}</p>
  </div>
</div>
```

To:

```tsx
<Card className="card-interactive">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <User className="h-5 w-5 text-primary" />
      Profile
    </CardTitle>
    <CardDescription>
      Manage your account settings and preferences
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p><strong>Name:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
    </div>
  </CardContent>
</Card>
```

## Acceptance Criteria

- [ ] Both dashboard cards use shadcn `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`
- [ ] Both cards have `card-interactive` class
- [ ] AI Chat card has Bot icon with `text-primary`, Profile card has User icon with `text-primary`
- [ ] Loading state shows `Spinner` component instead of "Loading..." text
- [ ] Container has `max-w-5xl` to prevent overly wide content
- [ ] Grid uses `sm:grid-cols-2` breakpoint
- [ ] Title scales: `text-2xl sm:text-3xl`
- [ ] Unauthenticated state wraps in Card
- [ ] No TypeScript errors
