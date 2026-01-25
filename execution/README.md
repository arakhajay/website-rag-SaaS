# Execution

This directory acts as **Layer 3: Execution** in the 3-Layer Architecture.

## Purpose
This folder contains deterministic scripts (Python, TypeScript, Node.js) that perform specific, reliable tasks. These scripts are called by the Agent (Layer 2) based on instructions in Directives (Layer 1).

## Usage
- Scripts here should be standalone or clearly documented.
- Dependencies are currently managed in `../sitebot/package.json` for existing scripts.
- When running scripts here, ensure you have the necessary environment variables (typically from `../sitebot/.env.local`).

## Current Scripts
- `check-apis.js`: Verifies API connections (OpenAI, Pinecone, Firecrawl, Supabase).
- `get-user-id.ts`: Fetches a user ID from Supabase.
- `find-id.js`: Utility to find IDs.
