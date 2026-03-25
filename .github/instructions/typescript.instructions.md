---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Standards

## Strict Mode

- `strict: true` in `tsconfig.json` — never weaken it.
- Never use `any`. Use `unknown` and narrow with type guards.
- Define explicit return types on all exported functions and components.

## Types and Interfaces

- `interface` for object shapes; `type` for unions, intersections, and mapped types.
- `as const` instead of `enum`.
- Prefer `readonly` properties and `ReadonlyArray` when data should not be mutated.

```typescript
// Avoid
const parse = (data: any) => { ... }
export const validate = (rows) => { ... }

// Prefer
const parse = (data: unknown): ParseResult => { ... }
export const validate = (rows: ReadonlyArray<CsvRow>): ValidationResult => { ... }
```

## React Components

- Functional components only, named exports, no default exports.
- Props defined as `interface <ComponentName>Props` above the component.
- Components under 150 lines — extract logic into hooks, shared code into `src/utils/` or `src/hooks/`.
- Never define components inside other components.
- Order: hooks → handlers → return/render.

```typescript
interface FileUploadProps {
  readonly onUpload: (file: File) => void;
  readonly acceptedTypes?: ReadonlyArray<string>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, acceptedTypes = ['.csv'] }) => {
  // hooks first, then handlers, then render
};
```

## State Management

- Local state (`useState`, `useReducer`) by default.
- Never store derived data in state — compute inline or with `useMemo`.
- Lift state only when siblings need the same data.

## Error Handling

- Never swallow exceptions with empty `catch` blocks.
- Validate external data (CSV input, API responses) at the boundary.
- User-facing errors via UI; technical details to console.

```typescript
// Avoid
try { await saveData(rows); } catch (e) {}

// Prefer
try {
  await saveData(rows);
} catch (error) {
  console.error('Failed to save data:', error);
  throw new AppError('Unable to save records. Please try again.', { cause: error });
}
```

## Performance

- `useMemo` for expensive computations (parsing, filtering large datasets), not trivial values.
- `useCallback` for handlers passed to memoized children.
- Virtualize lists over ~100 rows (`@tanstack/react-virtual`).
- Lazy-load routes with `React.lazy()` + `Suspense`.

## File Naming

- **Components:** `PascalCase.tsx` (e.g. `FileUpload.tsx`)
- **Hooks:** `camelCase.ts` prefixed with `use` (e.g. `useCsvParser.ts`)
- **Utilities:** `camelCase.ts` (e.g. `validateSchema.ts`)
- **Types:** `camelCase.types.ts` (e.g. `csv.types.ts`)
- **Tests:** co-located as `<filename>.test.ts(x)`

## Anti-Patterns

- `// @ts-ignore` without explanation
- `useEffect` for derived state
- Prop drilling beyond 2 levels — use composition or context
- Inline styles when Tailwind classes exist
- `console.log` in committed code
