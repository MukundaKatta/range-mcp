# range-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/range-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/range-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: generate numeric ranges. Two flavors:

- `range` — Python-style `range(start, stop, step)`, half-open, integer steps
- `linspace` — NumPy-style `linspace(start, stop, num)`, closed, evenly spaced

No deps.

## Tools

- `range(start=0, stop=5)` → `[0, 1, 2, 3, 4]`
- `range(0, 10, 2)` → `[0, 2, 4, 6, 8]`
- `range(5, 0, -1)` → `[5, 4, 3, 2, 1]`
- `linspace(0, 1, 5)` → `[0, 0.25, 0.5, 0.75, 1]`

`range` is capped at 1M elements; `linspace` at 100K.

## Configure

```json
{ "mcpServers": { "range": { "command": "npx", "args": ["-y", "@mukundakatta/range-mcp"] } } }
```

## License

MIT.
