import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

interface EvernoteConfig {
  apiKey: string;
  apiUrl: string;
}

class EvernoteServer {
  private server: Server;
  private config: EvernoteConfig;

  constructor() {
    this.server = new Server(
      {
        name: 'evernote-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      apiKey: process.env.EVERNOTE_API_KEY || '',
      apiUrl: 'https://api.evernote.com',
    };

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_note',
          description: 'Create a new note in Evernote',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Note title',
              },
              content: {
                type: 'string',
                description: 'Note content (can include HTML)',
              },
              notebook: {
                type: 'string',
                description: 'Notebook name (optional)',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for the note',
              },
            },
            required: ['title', 'content'],
          },
        },
        {
          name: 'search_notes',
          description: 'Search for notes in Evernote',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              notebook: {
                type: 'string',
                description: 'Limit search to specific notebook',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_note',
          description: 'Get a specific note by ID',
          inputSchema: {
            type: 'object',
            properties: {
              noteId: {
                type: 'string',
                description: 'Note ID',
              },
              includeContent: {
                type: 'boolean',
                description: 'Include note content',
                default: true,
              },
            },
            required: ['noteId'],
          },
        },
        {
          name: 'update_note',
          description: 'Update an existing note',
          inputSchema: {
            type: 'object',
            properties: {
              noteId: {
                type: 'string',
                description: 'Note ID',
              },
              title: {
                type: 'string',
                description: 'New title',
              },
              content: {
                type: 'string',
                description: 'New content',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'New tags',
              },
            },
            required: ['noteId'],
          },
        },
        {
          name: 'list_notebooks',
          description: 'List all notebooks',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'create_notebook',
          description: 'Create a new notebook',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Notebook name',
              },
            },
            required: ['name'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.config.apiKey) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Evernote API key not configured'
        );
      }

      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_note':
            return await this.createNote(args);
          case 'search_notes':
            return await this.searchNotes(args);
          case 'get_note':
            return await this.getNote(args);
          case 'update_note':
            return await this.updateNote(args);
          case 'list_notebooks':
            return await this.listNotebooks();
          case 'create_notebook':
            return await this.createNotebook(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Evernote API error: ${error}`
        );
      }
    });
  }

  private async createNote(args: any) {
    const { title, content, notebook, tags } = args;
    
    // Format content as ENML (Evernote Markup Language)
    const enmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>${content}</en-note>`;

    const response = await axios.post(
      `${this.config.apiUrl}/notes`,
      {
        title,
        content: enmlContent,
        notebookGuid: notebook,
        tagNames: tags,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Note created successfully with ID: ${response.data.guid}`,
        },
      ],
    };
  }

  private async searchNotes(args: any) {
    const { query, notebook, limit = 10 } = args;
    
    let searchQuery = query;
    if (notebook) {
      searchQuery = `notebook:"${notebook}" ${query}`;
    }

    const response = await axios.get(`${this.config.apiUrl}/notes/search`, {
      params: {
        query: searchQuery,
        maxNotes: limit,
      },
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    const results = response.data.notes.map((note: any) => ({
      id: note.guid,
      title: note.title,
      created: new Date(note.created).toISOString(),
      updated: new Date(note.updated).toISOString(),
      notebook: note.notebookGuid,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async getNote(args: any) {
    const { noteId, includeContent = true } = args;

    const response = await axios.get(
      `${this.config.apiUrl}/notes/${noteId}`,
      {
        params: {
          includeContent,
        },
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async updateNote(args: any) {
    const { noteId, title, content, tags } = args;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) {
      updateData.content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>${content}</en-note>`;
    }
    if (tags) updateData.tagNames = tags;

    const response = await axios.put(
      `${this.config.apiUrl}/notes/${noteId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Note updated successfully`,
        },
      ],
    };
  }

  private async listNotebooks() {
    const response = await axios.get(`${this.config.apiUrl}/notebooks`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    const notebooks = response.data.map((notebook: any) => ({
      id: notebook.guid,
      name: notebook.name,
      created: new Date(notebook.serviceCreated).toISOString(),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(notebooks, null, 2),
        },
      ],
    };
  }

  private async createNotebook(args: any) {
    const { name } = args;

    const response = await axios.post(
      `${this.config.apiUrl}/notebooks`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Notebook created successfully with ID: ${response.data.guid}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Evernote MCP server running on stdio');
  }
}

const server = new EvernoteServer();
server.run().catch(console.error);
