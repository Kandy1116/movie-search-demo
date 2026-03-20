import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';

function MovieSearch() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [sort, setSort] = useState('title-asc');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [minRating, setMinRating] = useState('0');

  const abortRef = useRef(null);
  const detailsCache = useRef({});

  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
  const debouncedSearch = useMemo(() => debounce(doSearch, 350), []);

  function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const isOpen = panel?.style.display !== 'block';
    if (isOpen) {
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }

  async function doSearch(q) {
    // --- DEBUGGING STARTS HERE ---
    console.log('1. API Key being used by the app:', OMDB_API_KEY);
    
    if (!q || q.trim().length < 2) {
      setItems([]);
      return;
    }
    if (!OMDB_API_KEY) {
      console.error('2. ERROR: No API Key was found. Check the .env.local file.');
      setItems([]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q)}&type=movie&page=1`;
      console.log('3. Fetching data from this URL:', url);

      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Search failed with status: ${res.status}`);
      
      const data = await res.json();
      console.log('4. Received response from API:', data);

      if (data.Response === 'True') {
        setItems(data.Search || []);
      } else {
        setItems([]);
        console.error('5. API returned an error message:', data.Error);
      }
    } catch (e) {
      console.error('6. A critical error occurred during the fetch:', e);
      if (e.name !== 'AbortError') {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
    // --- DEBUGGING ENDS HERE ---
  }

  async function fetchAndCacheDetails(imdbID) {
    if (!imdbID) return null;
    if (detailsCache.current[imdbID]) return detailsCache.current[imdbID];
    try {
      const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=short`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const d = await res.json();
      if (d.Response === 'True') {
        detailsCache.current[imdbID] = d;
        return d;
      }
    } catch {
      return null;
    }
    return null;
  }

  function parseYearValue(yearStr) {
    if (!yearStr) return null;
    const m = String(yearStr).match(/\\d{4}/);
    return m ? parseInt(m[0], 10) : null;
  }

  function matchesYearFilter(item, from, to) {
    const y = parseYearValue(item.Year);
    if (!y) return false;
    if (from && y < from) return false;
    if (to && y > to) return false;
    return true;
  }

  function matchesRatingFilter(item, minR) {
    const d = detailsCache.current[item.imdbID];
    if (d && d.imdbRating && d.imdbRating !== 'N/A') {
      const val = parseFloat(d.imdbRating);
      return val >= minR;
    }
    fetchAndCacheDetails(item.imdbID).then(() => {}).catch(() => {});
    return true;
  }

  const filtered = useMemo(() => {
    let list = Array.from(items || []);
    const from = yearFrom ? parseInt(yearFrom, 10) : null;
    const to = yearTo ? parseInt(yearTo, 10) : null;
    const minR = minRating ? parseFloat(minRating) : 0;

    if (from || to) {
      list = list.filter((i) => matchesYearFilter(i, from, to));
    }
    if (minR > 0) {
      list = list.filter((i) => matchesRatingFilter(i, minR));
    }
    list.sort((a, b) => {
      const ta = (a.Title || '').toLowerCase();
      const tb = (b.Title || '').toLowerCase();
      if (sort === 'title-asc') return ta < tb ? -1 : ta > tb ? 1 : 0;
      return ta > tb ? -1 : ta < tb ? 1 : 0;
    });
    return list;
  }, [items, sort, yearFrom, yearTo, minRating]);

  async function openDetails(id) {
    if (!id || !OMDB_API_KEY) return;
    setLoading(true);
    try {
      const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Details fetch failed');
      const d = await res.json();
      if (d.Response === 'True') {
        setModalData(d);
        setModalOpen(true);
      }
    } catch {
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery('');
    setItems([]);
  }

  useEffect(() => {
    const handler = setTimeout(() => debouncedSearch(query), 0);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="nav-left">
            <Link to="/" className="nav-home-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/search" className="nav-link active">Search</Link>
          </div>
          <div className="nav-right">
            <h1 className="logo">Movie Search Demo</h1>
          </div>
          <div className="search-group">
            <input
              id="searchInput"
              type="search"
              placeholder="Search movies, actors..."
              aria-label="Search movies"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button id="clearBtn" title="Clear" onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {!OMDB_API_KEY && (
          <div className="error-message" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <strong>Configuration Error:</strong> No API key found. Please create a <code>.env</code> file with <code>VITE_OMDB_API_KEY=your_key_here</code>.
          </div>
        )}
        <section className="controls">
          <button
            id="filterToggle"
            className="filter-toggle"
            onClick={toggleFilterPanel}
          >
            <span>Filters</span>
            <span style={{ fontSize: '0.8em' }}>▼</span>
          </button>
          <div id="filterPanel" className="filter-panel" style={{ display: 'none' }}>
            <div className="filters">
              <label className="filter-item">
                Sort
                <select id="sortSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="title-asc">Title A–Z</option>
                  <option value="title-desc">Title Z–A</option>
                </select>
              </label>

              <label className="filter-item">
                Year From
                <input
                  id="yearFrom"
                  type="number"
                  min="1800"
                  max="2100"
                  placeholder="1990"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
              </label>
              <label className="filter-item">
                Year To
                <input
                  id="yearTo"
                  type="number"
                  min="1800"
                  max="2100"
                  placeholder="2025"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </label>

              <label className="filter-item">
                Min Rating
                <select id="minRating" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                  <option value="0">Any</option>
                  <option value="9">9+</option>
                  <option value="8">8+</option>
                  <option value="7">7+</option>
                  <option value="6">6+</option>
                  <option value="5">5+</option>
                </select>
              </label>

              <div className="filter-actions">
                <button
                  id="clearFilters"
                  onClick={() => {
                    setSort('title-asc');
                    setYearFrom('');
                    setYearTo('');
                    setMinRating('0');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="results" className="results-grid" aria-live="polite">
          {filtered.map((i) => {
            const poster =
              i.Poster && i.Poster !== 'N/A'
                ? i.Poster
                : 'https://via.placeholder.com/300x450?text=No+Image';
            const year = i.Year ? `${i.Year}` : '';
            return (
              <article
                className="card"
                key={i.imdbID}
                tabIndex={0}
                onClick={() => openDetails(i.imdbID)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openDetails(i.imdbID);
                }}
              >
                <img className="poster" src={poster} alt={`${i.Title} poster`} loading="lazy" />
                <div className="info">
                  <div className="title" title={i.Title}>{i.Title}</div>
                  <div className="meta">
                    <span className="year">{year}</span>
                    {detailsCache.current[i.imdbID]?.imdbRating &&
                    detailsCache.current[i.imdbID].imdbRating !== 'N/A' && (
                      <span className="rating">
                        ★ {detailsCache.current[i.imdbID].imdbRating}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {loading && <div id="loading" className="loading">Loading…</div>}

        {modalOpen && modalData && (
          <div id="modal" className="modal" aria-hidden="false">
            <div
              className="modal-backdrop"
              id="modalBackdrop"
              onClick={() => setModalOpen(false)}
            ></div>
            <dialog className="modal-dialog" id="modalDialog" open>
              <button
                className="modal-close"
                id="modalClose"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
              <div id="modalContent">
                <div className="modal-body">
                  <img
                    className="modal-poster"
                    src={
                      modalData.Poster && modalData.Poster !== 'N/A'
                        ? modalData.Poster
                        : 'https://via.placeholder.com/500x750?text=No+Image'
                    }
                    alt={`${modalData.Title} poster`}
                  />
                  <div className="modal-content-wrapper">
                    <div className="modal-title">
                      {modalData.Title} <span className="year">({modalData.Year})</span>
                    </div>
                    
                    <div className="modal-tags">
                      {modalData.Genre && modalData.Genre.split(', ').map(genre => (
                        <span key={genre} className="tag">{genre}</span>
                      ))}
                      {modalData.Rated && <span className="tag" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>{modalData.Rated}</span>}
                    </div>

                    <div className="modal-overview">
                      {modalData.Plot || 'No description available.'}
                    </div>

                    <div className="modal-stats">
                      <div className="stat-item">
                        <strong>IMDb Rating</strong>
                        <span>{modalData.imdbRating !== 'N/A' ? `★ ${modalData.imdbRating}` : 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <strong>Runtime</strong>
                        <span>{modalData.Runtime}</span>
                      </div>
                      <div className="stat-item">
                        <strong>Director</strong>
                        <span>{modalData.Director}</span>
                      </div>
                      <div className="stat-item">
                        <strong>Actors</strong>
                        <span>{modalData.Actors}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                      <a
                        href={`https://www.imdb.com/title/${modalData.imdbID}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f5c518',
                          color: '#000000',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e2b616'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f5c518'}
                      >
                        View on IMDb ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© 2026 Movie Search Demo</p>
        </div>
      </footer>
    </>
  );
}

export default MovieSearch;