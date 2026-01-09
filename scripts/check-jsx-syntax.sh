#!/bin/bash

# JSX Syntax Checker Script
# This script checks for common JSX syntax errors that can cause parsing failures

echo "🔍 Checking JSX syntax in TypeScript/TSX files..."

# Find all TSX files
FILES=$(find apps/admin -name "*.tsx" -type f)

ERRORS=0

for file in $FILES; do
  # Check for unclosed tags (basic check)
  OPEN_DIVS=$(grep -o "<div" "$file" | wc -l | tr -d ' ')
  CLOSE_DIVS=$(grep -o "</div>" "$file" | wc -l | tr -d ' ')
  
  OPEN_CARDS=$(grep -o "<Card" "$file" | wc -l | tr -d ' ')
  CLOSE_CARDS=$(grep -o "</Card>" "$file" | wc -l | tr -d ' ')
  
  OPEN_BUTTONS=$(grep -o "<button" "$file" | wc -l | tr -d ' ')
  CLOSE_BUTTONS=$(grep -o "</button>" "$file" | wc -l | tr -d ' ')
  
  # Check for mismatched tags
  if [ "$OPEN_DIVS" != "$CLOSE_DIVS" ]; then
    echo "❌ $file: Mismatched <div> tags (Open: $OPEN_DIVS, Close: $CLOSE_DIVS)"
    ERRORS=$((ERRORS + 1))
  fi
  
  if [ "$OPEN_CARDS" != "$CLOSE_CARDS" ]; then
    echo "❌ $file: Mismatched <Card> tags (Open: $OPEN_CARDS, Close: $CLOSE_CARDS)"
    ERRORS=$((ERRORS + 1))
  fi
  
  if [ "$OPEN_BUTTONS" != "$CLOSE_BUTTONS" ]; then
    echo "❌ $file: Mismatched <button> tags (Open: $OPEN_BUTTONS, Close: $CLOSE_BUTTONS)"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for common JSX syntax errors
  if grep -q "style={{.*}}" "$file" && ! grep -q "style=\{" "$file"; then
    # This is just a warning, not an error
    :
  fi
  
  # Check for unclosed JSX expressions
  if grep -q "{.*{" "$file" && ! grep -q "}.*}" "$file"; then
    echo "⚠️  $file: Potential unclosed JSX expression"
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "✅ No obvious JSX syntax errors found!"
  exit 0
else
  echo "❌ Found $ERRORS potential syntax errors"
  exit 1
fi
