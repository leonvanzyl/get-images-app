# Task 07: Chat Page

## Status

pending

## Wave

2

## Description

Update the chat page to use shadcn Input/Button components instead of native HTML elements, add responsive breakpoints to the header and message bubbles, make the input form sticky at the bottom, and improve the empty state. This page has the most interactive elements and benefits significantly from consistent component usage.

## Dependencies

**Depends on:** task-01-globals-css.md
**Blocks:** None

**Context from dependencies:** Task 01 updates the color palette (so `text-primary`, `bg-primary` references use the new blue-tinted primary). No utility classes from Task 01 are used on this page (chat doesn't use `card-interactive`).

## Files to Modify

- `src/app/chat/page.tsx` — Replace native elements with shadcn components, add responsive classes, sticky input

## Technical Details

### Implementation Steps

1. **Add Input import**. Add to the existing imports:

```tsx
import { Input } from "@/components/ui/input";
```

The file already imports `Button` from `@/components/ui/button`.

2. **Also import Bot icon** for the improved empty state. Add `Bot` to the existing lucide-react import:

```tsx
import { Copy, Check, Loader2, Bot } from "lucide-react";
```

3. **Replace native `<button>` in CopyButton** (lines 165-177). Change the function body from:

```tsx
return (
  <button
    onClick={handleCopy}
    className="p-1 hover:bg-muted rounded transition-colors"
    title="Copy to clipboard"
  >
    {copied ? (
      <Check className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
    )}
  </button>
);
```

To:

```tsx
return (
  <Button
    variant="ghost"
    size="icon"
    className="h-7 w-7"
    onClick={handleCopy}
    title="Copy to clipboard"
  >
    {copied ? (
      <Check className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
    )}
  </Button>
);
```

4. **Update container** (line 247). Change:

```
className="container mx-auto px-4 py-8"
```

To:

```
className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
```

5. **Update chat header** (lines 249-261). Change:

```tsx
<div className="flex justify-between items-center mb-6 pb-4 border-b">
  <h1 className="text-2xl font-bold">AI Chat</h1>
  <div className="flex items-center gap-4">
    <span className="text-sm text-muted-foreground">
      Welcome, {session.user.name}!
    </span>
```

To:

```tsx
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b">
  <h1 className="text-xl sm:text-2xl font-bold">AI Chat</h1>
  <div className="flex items-center gap-2 sm:gap-4">
    <span className="text-sm text-muted-foreground hidden sm:inline">
      Welcome, {session.user.name}!
    </span>
```

Key changes: flex stacks on mobile, welcome text hidden on mobile (`hidden sm:inline`), smaller gaps.

6. **Update message bubble max-widths** (line ~289-290). For user messages, change:

```
bg-primary text-primary-foreground ml-auto max-w-[80%]
```

To:

```
bg-primary text-primary-foreground ml-auto max-w-[85%] sm:max-w-[80%] md:max-w-2xl shadow-sm
```

For AI messages, change:

```
bg-muted max-w-[80%]
```

To:

```
bg-muted max-w-[85%] sm:max-w-[80%] md:max-w-2xl shadow-sm
```

7. **Update message area** (line 271). Change:

```
className="min-h-[50vh] overflow-y-auto space-y-4 mb-4"
```

To:

```
className="min-h-[50vh] overflow-y-auto space-y-4 mb-4 pb-4"
```

8. **Improve empty state** (lines 272-275). Change:

```tsx
<div className="text-center text-muted-foreground py-12">
  Start a conversation with AI
</div>
```

To:

```tsx
<div className="text-center text-muted-foreground py-16 space-y-3">
  <Bot className="h-12 w-12 mx-auto text-muted-foreground/50" />
  <p className="text-lg font-medium">Start a conversation with AI</p>
  <p className="text-sm">Type a message below to begin chatting</p>
</div>
```

9. **Make input form sticky and replace native input** (lines 317-344). Change the form from:

```tsx
<form
  onSubmit={...}
  className="flex gap-2"
>
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type your message..."
    className="flex-1 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
    disabled={isStreaming}
  />
  <Button type="submit" disabled={!input.trim() || isStreaming}>
    ...
  </Button>
</form>
```

To:

```tsx
<form
  onSubmit={...}
  className="sticky bottom-0 bg-background py-4 border-t z-10 flex gap-2 sm:gap-3"
>
  <Input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type your message..."
    className="flex-1 min-w-0"
    disabled={isStreaming}
  />
  <Button type="submit" disabled={!input.trim() || isStreaming}>
    ...
  </Button>
</form>
```

Key changes: `sticky bottom-0 bg-background py-4 border-t z-10` makes the form stick. `Input` replaces native `<input>` for consistent styling. `min-w-0` prevents flex overflow.

## Acceptance Criteria

- [ ] Chat input uses shadcn `Input` component, not a native `<input>`
- [ ] CopyButton uses shadcn `Button variant="ghost" size="icon"`, not a native `<button>`
- [ ] Chat header stacks vertically on mobile (`flex-col`) and is horizontal on sm+
- [ ] Welcome text is hidden on mobile (`hidden sm:inline`)
- [ ] Message bubbles have `shadow-sm` for depth
- [ ] Message widths scale: `max-w-[85%]` on mobile, `max-w-[80%]` on sm, `max-w-2xl` on md+
- [ ] Input form is sticky at bottom with `bg-background` and `border-t`
- [ ] Empty state shows Bot icon, title text, and subtitle
- [ ] Container has responsive padding: `px-4 sm:px-6 lg:px-8`
- [ ] No TypeScript errors (Input import is correct)
