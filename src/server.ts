#!/usr/bin/env node
/**
 * range MCP server. Two tools: `range`, `linspace`.
 *
 * `range` mirrors Python's `range(start, stop, step)`: half-open interval,
 * integer step (positive or negative). `linspace` mirrors NumPy's
 * `linspace(start, stop, num)`: closed interval, `num` evenly-spaced floats.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

function assertInteger(name: string, value: number): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
}

export function range(start: number, stop?: number, step: number = 1): number[] {
  assertInteger('start', start);
  if (stop !== undefined) assertInteger('stop', stop);
  assertInteger('step', step);
  let lo = start;
  let hi: number;
  if (stop === undefined) {
    hi = start;
    lo = 0;
  } else {
    hi = stop;
  }
  if (step === 0) throw new Error('step must not be zero');
  const out: number[] = [];
  // Cap output length to prevent runaway responses.
  const limit = 1_000_000;
  if (step > 0) {
    for (let i = lo; i < hi; i += step) {
      if (out.length >= limit) throw new Error('range exceeds 1,000,000 elements');
      out.push(i);
    }
  } else {
    for (let i = lo; i > hi; i += step) {
      if (out.length >= limit) throw new Error('range exceeds 1,000,000 elements');
      out.push(i);
    }
  }
  return out;
}

export function linspace(start: number, stop: number, num: number = 50): number[] {
  if (typeof start !== 'number' || !Number.isFinite(start)) {
    throw new Error('start must be a finite number');
  }
  if (typeof stop !== 'number' || !Number.isFinite(stop)) {
    throw new Error('stop must be a finite number');
  }
  if (!Number.isInteger(num)) throw new Error('num must be an integer');
  if (num < 0) throw new Error('num must be >= 0');
  if (num > 100_000) throw new Error('num must be <= 100,000');
  if (num === 0) return [];
  if (num === 1) return [start];
  const out: number[] = [];
  const step = (stop - start) / (num - 1);
  for (let i = 0; i < num; i++) out.push(start + step * i);
  return out;
}

const server = new Server({ name: 'range', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'range',
    description:
      'Python-style range(start, stop, step). Half-open. step must not be zero. start alone is treated as `range(0, start)`.',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'number' },
        stop: { type: 'number' },
        step: { type: 'number', default: 1 },
      },
      required: ['start'],
    },
  },
  {
    name: 'linspace',
    description: 'NumPy-style linspace(start, stop, num). Closed interval, num evenly-spaced floats.',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'number' },
        stop: { type: 'number' },
        num: { type: 'integer', default: 50, minimum: 0, maximum: 100_000 },
      },
      required: ['start', 'stop'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'range') {
      const a = args as unknown as { start: number; stop?: number; step?: number };
      return jsonResult({ values: range(a.start, a.stop, a.step ?? 1) });
    }
    if (name === 'linspace') {
      const a = args as unknown as { start: number; stop: number; num?: number };
      return jsonResult({ values: linspace(a.start, a.stop, a.num ?? 50) });
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('range failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`range MCP server v${VERSION} ready on stdio\n`);
}
