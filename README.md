# AISprints Starter

This repository is a starter template for aisprints. It is designed for experienced human programmers who are well-versed in end-to-end software development to use AI effectively for developing and maintaining software applications.

## Purpose

This starter provides a structured approach to AI-assisted development by offering:

- **Cursor Rules** (`AGENTS.md` and `.cursor\rules`) - Intended to create and maintain comprehensive guidelines and constraints that guide AI behavior during development
- **Technical PRD Templates** (`docs/TECHNICAL_PRD_TEMPLATE.md`) - Standardized templates for documenting technical product requirements, implementation phases, and progress tracking

These resources ensure that AI agents are guided and constrained by established rules and your specific directions, enabling more predictable and maintainable development workflows.

## Getting Started

1. Review the cursor rules in `AGENTS.md` to understand the development guidelines
2. Use the technical PRD template in `docs/TECHNICAL_PRD_TEMPLATE.md` when starting new features
3. Customize the rules and templates to match your project's specific needs

## Project Structure

- `AGENTS.md` - Cursor rules and development guidelines
- `docs/TECHNICAL_PRD_TEMPLATE.md` - Template for technical product requirement documents
- `docs/PROJECT_OVERVIEW.md` - Project-specific documentation

## Technology Stack

This starter is built on:

- [Next.js](https://nextjs.org) - React framework
- [Cloudflare Workers](https://workers.cloudflare.com) - Serverless deployment platform
- [OpenNext.js](https://opennext.js.org/cloudflare) - Next.js adapter for Cloudflare

## Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
```
