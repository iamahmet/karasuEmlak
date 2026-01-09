#!/bin/bash

# Update MCP config to use python3.10 -m uv tool run instead of uvx
MCP_CONFIG=".cursor/mcp.json"

if [ -f "$MCP_CONFIG" ]; then
    # Backup
    cp "$MCP_CONFIG" "$MCP_CONFIG.backup"
    
    # Update command
    cat > "$MCP_CONFIG" << 'JSON'
{
  "mcpServers": {
    "seo-research": {
      "command": "python3.10",
      "args": ["-m", "uv", "tool", "run", "seo-mcp"],
      "env": {
        "CAPSOLVER_API_KEY": "${CAPSOLVER_API_KEY}"
      }
    }
  }
}
JSON
    echo "✅ MCP config updated to use python3.10 -m uv tool run"
else
    echo "❌ MCP config not found"
fi
