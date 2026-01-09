# JSX Syntax Rules - Preventing Parsing Errors

## Common JSX Syntax Errors to Avoid

### 1. Unclosed Tags
**❌ WRONG:**
```tsx
<div>
  <Card>
    <CardContent>
      {/* Missing closing tags */}
```

**✅ CORRECT:**
```tsx
<div>
  <Card>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

### 2. Mismatched Opening/Closing Tags
**❌ WRONG:**
```tsx
<div className="...">
  <Card>
    {/* Content */}
  </div> {/* Wrong closing tag */}
</Card>
```

**✅ CORRECT:**
```tsx
<div className="...">
  <Card>
    {/* Content */}
  </Card>
</div>
```

### 3. Missing Closing Tags in Conditional Rendering
**❌ WRONG:**
```tsx
{condition && (
  <div>
    <Card>
      {/* Missing closing tags */}
    </Card>
  {/* Missing closing div and parenthesis */}
```

**✅ CORRECT:**
```tsx
{condition && (
  <div>
    <Card>
      {/* Content */}
    </Card>
  </div>
)}
```

### 4. Incorrect JSX Expression Syntax
**❌ WRONG:**
```tsx
<div style={{ width: `${value}%` }}> {/* Missing closing brace */}
```

**✅ CORRECT:**
```tsx
<div style={{ width: `${value}%` }}>
  {/* Content */}
</div>
```

### 5. Missing Closing Tags in Map Functions
**❌ WRONG:**
```tsx
{items.map((item, index) => (
  <div key={index}>
    <Card>
      {/* Missing closing tags */}
    </Card>
  {/* Missing closing div and parenthesis */}
```

**✅ CORRECT:**
```tsx
{items.map((item, index) => (
  <div key={index}>
    <Card>
      {/* Content */}
    </Card>
  </div>
))}
```

## Best Practices

### 1. Always Match Opening and Closing Tags
- Count opening tags: `<div>`, `<Card>`, `<button>`
- Count closing tags: `</div>`, `</Card>`, `</button>`
- They must match!

### 2. Use Proper Indentation
- Proper indentation helps identify missing closing tags
- Use 2 spaces for indentation consistently

### 3. Check Conditional Rendering
- Always close parentheses: `{condition && (...)}`
- Always close JSX elements inside conditionals

### 4. Verify Map Functions
- Map functions should return JSX: `{items.map(item => (...))}`
- All JSX elements inside map must be properly closed

### 5. Use TypeScript/ESLint
- Run `npm run typecheck` before committing
- Run `npm run check:jsx` to check for syntax errors
- Use your IDE's JSX validation

## Pre-commit Checklist

Before committing JSX changes:

1. ✅ Run `npm run check:syntax`
2. ✅ Check that all opening tags have closing tags
3. ✅ Verify conditional rendering is properly closed
4. ✅ Ensure map functions return properly closed JSX
5. ✅ Check for any TypeScript errors
6. ✅ Test the component renders correctly

## Automated Checks

### Run JSX Syntax Check
```bash
npm run check:jsx
```

### Run Full Syntax Check (JSX + TypeScript)
```bash
npm run check:syntax
```

## Common Patterns

### Pattern 1: Conditional Rendering
```tsx
{condition && (
  <div>
    {/* Content */}
  </div>
)}
```

### Pattern 2: Map with Multiple Elements
```tsx
{items.map((item, index) => (
  <div key={index}>
    <Card>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  </div>
))}
```

### Pattern 3: Nested Conditionals
```tsx
{condition1 && (
  <div>
    {condition2 && (
      <div>
        {/* Content */}
      </div>
    )}
  </div>
)}
```

## Debugging Tips

1. **Use IDE Features:**
   - Most IDEs highlight matching tags
   - Use "Go to Matching Bracket" feature
   - Check for syntax highlighting errors

2. **Count Tags:**
   - Manually count opening and closing tags
   - Use search/replace to count: `grep -o "<div" file.tsx | wc -l`

3. **Check Build Output:**
   - Run `npm run build` to see parsing errors
   - Check the exact line number in error message

4. **Incremental Testing:**
   - Comment out sections to isolate the error
   - Add closing tags incrementally

## Remember

- **Every opening tag needs a closing tag**
- **Conditional rendering needs closing parenthesis**
- **Map functions need closing parenthesis and braces**
- **Always test after making JSX changes**
