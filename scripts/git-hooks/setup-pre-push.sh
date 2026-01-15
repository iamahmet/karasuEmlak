#!/bin/bash

# Setup Git Pre-push Hook
# This script installs the pre-push hook

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-push"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRE_PUSH_SCRIPT="$PROJECT_ROOT/scripts/pre-push-check.sh"

if [ ! -d "$HOOK_DIR" ]; then
  echo "❌ .git/hooks dizini bulunamadı. Bu bir git repository değil!"
  exit 1
fi

# Make pre-push script executable
chmod +x "$PRE_PUSH_SCRIPT"

# Create or update pre-push hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Pre-push hook - Run tests before push

# Get the project root
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# Run pre-push check
"$PROJECT_ROOT/scripts/pre-push-check.sh"

# If check fails, prevent push
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Pre-push kontrolleri başarısız! Push iptal edildi."
  echo "💡 Hataları düzeltip tekrar deneyin."
  exit 1
fi
EOF

chmod +x "$HOOK_FILE"

echo "✅ Git pre-push hook kuruldu!"
echo "📝 Her push öncesi otomatik test çalışacak."
echo ""
echo "💡 Hook'u devre dışı bırakmak için:"
echo "   rm .git/hooks/pre-push"
