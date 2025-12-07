# Legacy Admin Editors

## Purpose
This directory contains archived versions of the page editor components that are no longer actively used in the application.

## Archived Files
- **PageEditor.jsx** - Original basic page editor
- **PageEditorAdvanced_BACKUP.jsx** - Backup version of advanced editor
- **PageEditorAdvanced_NEW.jsx** - Experimental version of advanced editor
- **PageEditorBuilder.jsx** - Squarespace-style builder interface
- **PageEditorModern.jsx** - Modern redesign attempt

## Currently Active Editor
The application uses **PageEditorAdvanced.jsx** located in:
`frontend/src/pages/admin/PageEditorAdvanced.jsx`

This is the only editor referenced in the routing configuration (App.js).

## Why These Files Were Archived
These files represent various iterations and experimental versions of the page editor that were created during development but are no longer integrated into the application's routing or import structure. They are preserved here for:

- Historical reference
- Code examples and patterns
- Potential future feature extraction
- Rollback capability if needed

## Do Not Delete
These files are kept for reference purposes. If you need to reference old implementation patterns or restore functionality, check these files first.

## Last Updated
December 7, 2025 - Phase 1bis cleanup
