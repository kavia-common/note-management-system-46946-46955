# Notes Frontend (Tizen Web, React + Vite)

A basic notes application for Tizen web, featuring create, list, view, edit, and delete. Notes are persisted in `localStorage` under the key `notes_v1`. The UI follows the Ocean Professional theme.

## Run locally (preview on port 3000)

- Install dependencies (already present in this container): `npm install`
- Start dev server: `npm run dev`
- Open the preview at: http://localhost:3000

Alternatively, for a static preview build:
- Build: `npm run build`
- Preview: `npm run preview`

## Using the app

- Add Note: Click the “+ Add Note” button in the header to create a new note.
- Select a Note: Click any note title on the left list to view/edit it.
- Edit: Update the title and body in the right pane and press “Save Changes.”
- Delete: Use the “Delete” button on a note item in the list.
- Search: Use the search box above the list to filter by title/body.
- Keyboard/Remote basics:
  - UP/DOWN to move focus in the list
  - ENTER to select the focused item
  - BACK to deselect and return to the list

Accessibility: Inputs have labels; the app includes an aria-live status region for save/delete feedback.

## Persistence

Notes are stored in browser `localStorage` with the key `notes_v1`. Data persists across page reloads and dev server restarts.

## Tizen packaging (optional)

- Build: `npm run build:tizen`
- Package widget: `npm run package:tizen` (creates `app.wgt` at repo root)

## Tech

- React + Vite
- No external services, no environment variables
- Ocean Professional theme: primary #2563EB, secondary/success #F59E0B, error #EF4444, background #f9fafb, surface #ffffff, text #111827
