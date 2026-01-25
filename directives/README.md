# Directives

This directory acts as **Layer 1: Directive** in the 3-Layer Architecture.

## Purpose
Directives are Standard Operating Procedures (SOPs) written in Markdown. They define **what** to do, while the Agent (Layer 2) orchestrates the work, and the Scripts (Layer 3, in `../execution`) perform the deterministic tasks.

## Structure
- Store your `.md` directive files here.
- Reference scripts located in `../execution/`.

## Example
1. Read a directive here (e.g., `deploy_app.md`).
2. Follow the steps.
3. Run the associated script `../execution/deploy_script.py` (or .js/.ts).
