 // PUBLIC_INTERFACE
 export function listNotes() {
   /** Returns all notes from localStorage. */
   const raw = localStorage.getItem('notes_v1');
   if (!raw) return [];
   try {
     const data = JSON.parse(raw);
     return Array.isArray(data) ? data : [];
   } catch {
     return [];
   }
 }
 
 // PUBLIC_INTERFACE
 export function getNote(id) {
   /** Returns a single note by id from localStorage. */
   return listNotes().find((n) => n.id === id) || null;
 }
 
 // PUBLIC_INTERFACE
 export function createNote({ title, body }) {
   /** Creates a new note and persists it in localStorage. */
   const trimmedTitle = (title || '').trim();
   const now = new Date().toISOString();
   const note = {
     id: uid(),
     title: trimmedTitle || 'Untitled',
     body: body || '',
     createdAt: now,
     updatedAt: now,
   };
   const current = listNotes();
   const next = [note, ...current];
   localStorage.setItem('notes_v1', JSON.stringify(next));
   return note;
 }
 
 // PUBLIC_INTERFACE
 export function updateNote(id, data) {
   /** Updates an existing note and persists it in localStorage. */
   const current = listNotes();
   const idx = current.findIndex((n) => n.id === id);
   if (idx === -1) return null;
   const now = new Date().toISOString();
   const updated = { ...current[idx], ...data, updatedAt: now };
   const next = [...current];
   next[idx] = updated;
   localStorage.setItem('notes_v1', JSON.stringify(next));
   return updated;
 }
 
 // PUBLIC_INTERFACE
 export function deleteNote(id) {
   /** Deletes a note by id and updates localStorage. */
   const current = listNotes();
   const next = current.filter((n) => n.id !== id);
   localStorage.setItem('notes_v1', JSON.stringify(next));
   return true;
 }
 
 // Internal ID generator
 function uid() {
   return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
 }
