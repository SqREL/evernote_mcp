# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Evernote MCP (Model Context Protocol) server that provides integration with the Evernote API. It's built with TypeScript and uses the MCP SDK to expose Evernote functionality as tools.

## Build and Development Commands

```bash
# Install dependencies
yarn install

# Build the TypeScript code
yarn build

# Start the server (after building)
yarn start
```

## Architecture

The project follows a simple MCP server architecture:

- **Main Entry Point**: `src/index.ts` - Contains the `EvernoteServer` class that:
  - Sets up MCP server with tool handlers
  - Implements Evernote API operations (create/search/update notes, manage notebooks)
  - Uses axios for HTTP requests to Evernote API
  - Handles ENML (Evernote Markup Language) formatting

- **Configuration**: Expects `EVERNOTE_API_KEY` environment variable for authentication

- **Tools Exposed**:
  - `create_note`: Creates new notes with title, content, notebook, and tags
  - `search_notes`: Searches notes with query, notebook filter, and result limit
  - `get_note`: Retrieves specific note by ID
  - `update_note`: Updates existing note's title, content, or tags
  - `list_notebooks`: Lists all notebooks
  - `create_notebook`: Creates new notebook

## TypeScript Configuration

- Target: ES2022 with NodeNext module system
- Strict mode enabled
- Source in `./src`, output to `./dist`
- Source maps and declarations generated