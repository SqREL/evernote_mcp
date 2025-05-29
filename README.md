# Evernote MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Evernote, enabling AI assistants to create, read, update, and manage notes and notebooks through a standardized interface.

## Features

- 📝 **Create Notes** - Create new notes with rich content, tags, and notebook assignment
- 🔍 **Search Notes** - Search through your notes with powerful query capabilities
- 📖 **Read Notes** - Retrieve specific notes by ID with or without content
- ✏️ **Update Notes** - Modify existing notes including title, content, and tags
- 📚 **Manage Notebooks** - List all notebooks and create new ones
- 🏷️ **Tag Support** - Organize notes with tags for better categorization
- 🔒 **Secure** - Uses environment variables for API key management
- ✅ **Fully Tested** - 100% test coverage with comprehensive test suite

## Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Evernote API key (obtain from [Evernote Developer Portal](https://dev.evernote.com))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/evernote-mcp-server.git
cd evernote-mcp-server
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:
```bash
export EVERNOTE_API_KEY="your-evernote-api-key"
```

4. Build the TypeScript code:
```bash
yarn build
```

## Usage

### Starting the Server

Run the server using stdio transport:
```bash
yarn start
```

The server will output "Evernote MCP server running on stdio" when ready.

### Configuration with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "evernote": {
      "command": "node",
      "args": ["/path/to/evernote-mcp-server/dist/index.js"],
      "env": {
        "EVERNOTE_API_KEY": "your-evernote-api-key"
      }
    }
  }
}
```

## Available Tools

### 1. create_note

Create a new note in Evernote.

**Parameters:**
- `title` (required): Note title
- `content` (required): Note content (supports HTML)
- `notebook` (optional): Notebook GUID where the note should be created
- `tags` (optional): Array of tag names

**Example:**
```json
{
  "title": "Meeting Notes",
  "content": "<p>Important points from today's meeting...</p>",
  "notebook": "notebook-guid-123",
  "tags": ["meetings", "important"]
}
```

### 2. search_notes

Search for notes using Evernote's search syntax.

**Parameters:**
- `query` (required): Search query string
- `notebook` (optional): Limit search to specific notebook
- `limit` (optional): Maximum number of results (default: 10)

**Example:**
```json
{
  "query": "project proposal",
  "notebook": "Work",
  "limit": 20
}
```

### 3. get_note

Retrieve a specific note by its ID.

**Parameters:**
- `noteId` (required): Note GUID
- `includeContent` (optional): Whether to include note content (default: true)

**Example:**
```json
{
  "noteId": "note-guid-456",
  "includeContent": true
}
```

### 4. update_note

Update an existing note.

**Parameters:**
- `noteId` (required): Note GUID
- `title` (optional): New title
- `content` (optional): New content
- `tags` (optional): New tags (replaces existing tags)

**Example:**
```json
{
  "noteId": "note-guid-456",
  "title": "Updated Meeting Notes",
  "tags": ["meetings", "completed"]
}
```

### 5. list_notebooks

List all notebooks in the user's account.

**Parameters:** None

**Returns:** Array of notebooks with id, name, and creation date.

### 6. create_notebook

Create a new notebook.

**Parameters:**
- `name` (required): Notebook name

**Example:**
```json
{
  "name": "Project Ideas"
}
```

## Development

### Project Structure

```
evernote-mcp-server/
├── src/
│   ├── index.ts           # Main server implementation
│   ├── index.test.ts      # Main test suite
│   └── index.apikey.test.ts # API key validation tests
├── dist/                  # Compiled JavaScript output
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest testing configuration
├── CLAUDE.md            # Claude-specific documentation
└── README.md            # This file
```

### Running Tests

```bash
# Run main test suite
yarn test

# Run API key validation tests
yarn test:apikey

# Run all tests
yarn test:all

# Run tests with coverage report
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

### Building

```bash
# Build TypeScript to JavaScript
yarn build
```

## Evernote API Integration

This server uses the Evernote API to interact with notes and notebooks. The content is formatted using ENML (Evernote Markup Language), which is automatically handled by the server.

### ENML Content

When creating or updating notes, the server automatically wraps content in proper ENML format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>Your content here</en-note>
```

### Search Syntax

The search functionality supports Evernote's advanced search syntax:
- `intitle:keyword` - Search in title
- `notebook:"Notebook Name"` - Search within specific notebook
- `tag:tagname` - Search by tag
- `created:20230101` - Search by creation date
- Combine multiple criteria with spaces (AND) or `any:` prefix (OR)

## Error Handling

The server implements comprehensive error handling:

- **API Key Errors**: Returns clear error when API key is not configured
- **Network Errors**: Wraps network errors with descriptive messages
- **Invalid Tool Errors**: Returns error for unknown tool names
- **API Errors**: Properly forwards Evernote API error messages

All errors follow the MCP error format with appropriate error codes.

## Security Considerations

- Store your Evernote API key securely using environment variables
- Never commit API keys to version control
- Use `.env` files for local development (remember to add to `.gitignore`)
- Rotate API keys regularly
- Monitor API usage through Evernote Developer Portal

## Troubleshooting

### Common Issues

1. **"Evernote API key not configured"**
   - Ensure `EVERNOTE_API_KEY` environment variable is set
   - Check that the key is valid and not expired

2. **"404 Not Found" errors**
   - Verify the API endpoint URLs are correct
   - Check if you're using the correct sandbox/production environment

3. **"Permission denied" errors**
   - Ensure your API key has necessary permissions
   - Check rate limits on your Evernote developer account

4. **Connection timeouts**
   - Check your internet connection
   - Verify Evernote API service status

### Debug Mode

To enable debug logging, set the `DEBUG` environment variable:
```bash
DEBUG=* yarn start
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Maintain 100% test coverage
- Follow TypeScript best practices
- Update documentation for API changes
- Use conventional commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [Evernote API](https://dev.evernote.com/) for note management capabilities
- [Claude](https://claude.ai) for AI assistance integration

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing issues before creating new ones
- Provide detailed information for bug reports
- Include examples for feature requests