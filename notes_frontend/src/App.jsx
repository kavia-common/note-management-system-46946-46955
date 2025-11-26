import { useEffect, useMemo, useRef, useState } from 'react';
import { useTizenKeys } from './hooks/useTizenKeys';
import { listNotes, getNote, createNote, updateNote, deleteNote } from './notesStore';
import './App.css';

function Header({ onAdd, count }) {
  return (
    <header
      className="header"
      role="banner"
      aria-label="Notes app header"
    >
      <div className="branding">
        <span className="logo" aria-hidden="true">📝</span>
        <h1 className="title">Notes</h1>
        <span className="count" aria-live="polite" aria-atomic="true">
          {count} {count === 1 ? 'note' : 'notes'}
        </span>
      </div>
      <button
        className="btn btn-primary"
        onClick={onAdd}
        aria-label="Add note"
        title="Add note"
      >
        + Add Note
      </button>
    </header>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <div className="searchbar">
      <label htmlFor="search" className="visually-hidden">Search notes</label>
      <input
        id="search"
        type="text"
        value={query}
        placeholder="Search notes…"
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search notes"
      />
    </div>
  );
}

function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  listRef,
}) {
  return (
    <ul className="notes-list" role="listbox" aria-label="Notes list" ref={listRef}>
      {notes.length === 0 && (
        <li className="empty" aria-live="polite">No notes yet</li>
      )}
      {notes.map((n, idx) => (
        <li
          key={n.id}
          role="option"
          aria-selected={selectedId === n.id}
          tabIndex={0}
          className={`note-item ${selectedId === n.id ? 'selected' : ''}`}
          data-index={idx}
          onClick={() => onSelect(n.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSelect(n.id);
          }}
        >
          <div className="note-title" title={n.title}>{n.title || 'Untitled'}</div>
          <div className="note-meta">
            <time dateTime={n.updatedAt}>
              {new Date(n.updatedAt).toLocaleString()}
            </time>
            <button
              className="btn btn-danger btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(n.id);
              }}
              aria-label={`Delete note ${n.title}`}
              title="Delete note"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DetailPane({
  selected,
  title,
  body,
  setTitle,
  setBody,
  onSave,
  onNew,
  error,
  statusRef,
}) {
  return (
    <section className="detail" aria-label="Note detail and editor">
      {selected ? (
        <form
          className="editor"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              aria-invalid={!!error}
            />
            {error && <div className="error" role="alert">{error}</div>}
          </div>
          <div className="field">
            <label htmlFor="body">Body</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note here…"
              rows={12}
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-secondary" onClick={onNew}>
              New Note
            </button>
          </div>
          <div className="status" aria-live="polite" aria-atomic="true" ref={statusRef} />
        </form>
      ) : (
        <div className="empty-detail">
          <p>Select a note from the list or create a new one.</p>
          <button className="btn btn-primary" onClick={onNew}>Create your first note</button>
        </div>
      )}
    </section>
  );
}

function App() {
  // Seed with empty array if none
  useEffect(() => {
    if (!localStorage.getItem('notes_v1')) {
      localStorage.setItem('notes_v1', JSON.stringify([]));
    }
  }, []);

  const [notes, setNotes] = useState(() => listNotes());
  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState(getNote(selectedId)?.title || '');
  const [body, setBody] = useState(getNote(selectedId)?.body || '');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const statusRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q),
    );
  }, [notes, query]);

  // Sync editor with selected note
  useEffect(() => {
    const n = getNote(selectedId);
    setTitle(n?.title || '');
    setBody(n?.body || '');
    setError('');
  }, [selectedId]);

  function refresh() {
    setNotes(listNotes());
  }

  function handleAdd() {
    const note = createNote({ title: 'New Note', body: '' });
    refresh();
    setSelectedId(note.id);
    // Focus title after creation (Tizen remote users can press Enter to edit)
    setTimeout(() => {
      const titleEl = document.getElementById('title');
      titleEl?.focus();
      titleEl?.select();
    }, 0);
    announce('Note created');
  }

  function handleDelete(id) {
    const toDelete = getNote(id);
    deleteNote(id);
    refresh();
    if (selectedId === id) {
      setSelectedId(listNotes()[0]?.id || null);
    }
    announce(`Deleted ${toDelete?.title || 'note'}`);
  }

  function handleSave() {
    const t = title.trim();
    if (!t) {
      setError('Title is required.');
      announce('Error: title is required');
      return;
    }
    if (!selectedId) {
      // creating if none selected (should not happen normally)
      const note = createNote({ title: t, body });
      setSelectedId(note.id);
    } else {
      updateNote(selectedId, { title: t, body });
    }
    refresh();
    setError('');
    announce('Saved');
  }

  function announce(message) {
    if (statusRef.current) {
      statusRef.current.textContent = message;
      // Clear after a short delay to avoid repeated reads by screen readers
      setTimeout(() => {
        if (statusRef.current) statusRef.current.textContent = '';
      }, 1500);
    }
  }

  // Keyboard navigation for remote
  useTizenKeys({
    onUp: () => {
      if (!listRef.current) return;
      const items = Array.from(listRef.current.querySelectorAll('.note-item'));
      if (!items.length) return;
      const currentIdx = items.findIndex((el) =>
        el.classList.contains('focused'),
      );
      const nextIdx = currentIdx <= 0 ? 0 : currentIdx - 1;
      items.forEach((el) => el.classList.remove('focused'));
      items[nextIdx].classList.add('focused');
      items[nextIdx].scrollIntoView({ block: 'nearest' });
    },
    onDown: () => {
      if (!listRef.current) return;
      const items = Array.from(listRef.current.querySelectorAll('.note-item'));
      if (!items.length) return;
      const currentIdx = items.findIndex((el) =>
        el.classList.contains('focused'),
      );
      const nextIdx =
        currentIdx === -1
          ? 0
          : Math.min(items.length - 1, currentIdx + 1);
      items.forEach((el) => el.classList.remove('focused'));
      items[nextIdx].classList.add('focused');
      items[nextIdx].scrollIntoView({ block: 'nearest' });
    },
    onEnter: () => {
      if (!listRef.current) return;
      const focused = listRef.current.querySelector('.note-item.focused');
      if (focused) {
        const idx = Number(focused.getAttribute('data-index'));
        const id = filtered[idx]?.id;
        if (id) setSelectedId(id);
        return;
      }
      // If nothing focused, focus first item or the Save button in editor
      const first = listRef.current.querySelector('.note-item');
      if (first) {
        first.classList.add('focused');
        first.scrollIntoView({ block: 'nearest' });
      } else {
        document.querySelector('.detail .btn-primary')?.focus();
      }
    },
    onBack: () => {
      // Deselect note
      setSelectedId(null);
    },
  });

  return (
    <div className="app-root" role="application" aria-label="Notes application">
      <Header onAdd={handleAdd} count={notes.length} />
      <main className="main">
        <aside className="sidebar" aria-label="Notes sidebar">
          <SearchBar query={query} setQuery={setQuery} />
          <NotesList
            notes={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onDelete={handleDelete}
            listRef={listRef}
          />
        </aside>
        <DetailPane
          selected={selectedId}
          title={title}
          body={body}
          setTitle={setTitle}
          setBody={setBody}
          onSave={handleSave}
          onNew={handleAdd}
          error={error}
          statusRef={statusRef}
        />
      </main>
    </div>
  );
}

export default App;
