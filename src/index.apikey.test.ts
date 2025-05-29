import { jest, describe, it, expect } from '@jest/globals';
import { ErrorCode, McpError, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Set up mocks before imports
const mockSetRequestHandler = jest.fn();
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockServer = jest.fn().mockImplementation(() => ({
  setRequestHandler: mockSetRequestHandler,
  connect: mockConnect,
}));
const mockTransport = jest.fn();

jest.unstable_mockModule('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: mockServer,
}));

jest.unstable_mockModule('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: mockTransport,
}));

// Mock console.error to suppress server start message
global.console = {
  ...console,
  error: jest.fn(),
};

describe('EvernoteServer API Key Validation', () => {
  it('should throw error when API key is not configured', async () => {
    // Ensure no API key is set
    delete process.env.EVERNOTE_API_KEY;
    
    const handlers = new Map();
    mockSetRequestHandler.mockImplementation((schema: any, handler: Function) => {
      handlers.set(schema, handler);
    });
    
    // Import the module with no API key
    await import('./index.js');
    
    const callToolHandler = handlers.get(CallToolRequestSchema);
    expect(callToolHandler).toBeDefined();
    
    await expect(callToolHandler!({
      params: { name: 'create_note', arguments: { title: 'Test', content: 'Test' } }
    })).rejects.toThrow('Evernote API key not configured');
  });
});