import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [formError, setFormError] = useState('')
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
  })

  const usersPerPage = 10

  // Load the user list when the page first opens.
  useEffect(() => {
    getUsers()
  }, [])

  async function getUsers() {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('https://dummyjson.com/users?limit=100')

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch {
      setError('We could not load the user directory. Check your connection and try again.')
    }

    setIsLoading(false)
  }

  // Build a new list containing only people that match the search.
  const filteredUsers = users.filter((user) => {
    const search = searchText.toLowerCase()
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const email = user.email.toLowerCase()
    const company = user.company?.name?.toLowerCase() || ''

    return fullName.includes(search) || email.includes(search) || company.includes(search)
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))
  const firstUserIndex = (currentPage - 1) * usersPerPage
  const pageUsers = filteredUsers.slice(firstUserIndex, firstUserIndex + usersPerPage)

  function handleSearch(event) {
    setSearchText(event.target.value)
    setCurrentPage(1)
  }

  function handleFormChange(event) {
    const fieldName = event.target.name
    const fieldValue = event.target.value

    setNewUser({ ...newUser, [fieldName]: fieldValue })
  }

  function addUser(event) {
    event.preventDefault()

    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim()) {
      setFormError('Please enter a first name, last name, and email.')
      return
    }

    const userToAdd = {
      id: Date.now(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      image: '',
      phone: '—',
      company: { name: newUser.company || '—' },
    }

    setUsers([userToAdd, ...users])
    setNewUser({ firstName: '', lastName: '', email: '', company: '' })
    setFormError('')
    setShowForm(false)
    setSearchText('')
    setCurrentPage(1)
  }

  return (
    <main className={isDarkMode ? 'app-shell dark-theme' : 'app-shell'}>
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Peoplewise home">
          <span className="brand-mark">TD</span>
          <span>Team directory</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#users">
            <span className="nav-icon">▦</span> People <span className="nav-count">{users.length || '—'}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <div className="profile-avatar">KP</div>
            <div><strong>Kevin Paul</strong><small>Workspace admin</small></div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <section className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>People</strong></div>
          <div className="topbar-right">
            <button
              className="theme-button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDarkMode ? ' Light mode' : ' Dark mode'}
            </button>
            <div className="top-avatar">KP</div>
          </div>
        </header>

        <div className="content" id="users">
          <div className="heading-row">
            <div><h1>People</h1><p className="subtitle">View and manage people in your directory.</p></div>
            <button className="primary-button" onClick={() => setShowForm(true)}><span>＋</span> Add person</button>
          </div>

          <section className="summary-row" aria-label="Directory summary">
            <div className="summary-card">
              <div className="summary-icon people-icon"></div>
              <div><span>Total people</span><strong>{isLoading ? '—' : users.length}</strong></div>
              <span className="summary-note">in directory</span>
            </div>
            {/* <div className="summary-card">
              <div className="summary-icon team-icon">⌂</div>
              <div><span>Teams represented</span><strong>{isLoading ? '—' : new Set(users.map((user) => user.company?.name)).size}</strong></div>
              <span className="summary-note">across the org</span>
            </div> */}
          </section>

          <section className="directory-card">
            <div className="directory-heading">
              <div><h2>Directory <span className="count-pill">{isLoading ? '…' : filteredUsers.length}</span></h2><p>Search people by name, email, or company.</p></div>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <span className="search-icon">⌕</span>
                <input aria-label="Search people" placeholder="Search by name, email, company..." value={searchText} onChange={handleSearch} />
                <kbd>⌘ K</kbd>
              </label>
              <button className="sort-button" onClick={() => setUsers([...users].sort((a, b) => a.firstName.localeCompare(b.firstName)))}>↕ <span>Sort</span></button>
            </div>

            <div className="table-wrap">
              <table>
                <thead><tr><th>PERSON</th><th>EMAIL ADDRESS</th><th>PHONE</th><th>COMPANY</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {isLoading && <tr><td colSpan="5"><div className="state-box"><span className="spinner" /><strong>Gathering your people</strong><span>Just a moment while we load the directory.</span></div></td></tr>}
                  {!isLoading && error && <tr><td colSpan="5"><div className="state-box error-state"><div className="state-icon">!</div><strong>Could not load people</strong><span>{error}</span><button className="retry-button" onClick={getUsers}>Try again <span>↻</span></button></div></td></tr>}
                  {!isLoading && !error && pageUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td><div className="person-cell"><div className={`person-avatar avatar-${index % 6}`}>{user.image ? <img src={user.image} alt="" /> : `${user.firstName[0]}${user.lastName[0]}`}</div><div><strong>{user.firstName} {user.lastName}</strong><small>{user.company?.title || 'Team member'}</small></div></div></td>
                      <td className="email-cell">{user.email}</td>
                      <td className="phone-cell">{user.phone || '—'}</td>
                      <td><span className="company-cell"><span className="company-dot" />{user.company?.name || '—'}</span></td>
                      <td><button className="row-menu" aria-label={`More actions for ${user.firstName}`}>···</button></td>
                    </tr>
                  ))}
                  {!isLoading && !error && pageUsers.length === 0 && <tr><td colSpan="5"><div className="state-box empty-state"><div className="empty-search">⌕</div><strong>No people found</strong><span>{searchText ? `No matches for “${searchText}”. Try another search.` : 'Your directory is empty. Add someone to get started.'}</span>{searchText && <button className="clear-button" onClick={() => { setSearchText(''); setCurrentPage(1) }}>Clear search</button>}</div></td></tr>}
                </tbody>
              </table>
            </div>

            {!isLoading && !error && <footer className="table-footer">
              <span>Showing <strong>{filteredUsers.length ? firstUserIndex + 1 : 0}–{Math.min(firstUserIndex + usersPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> people</span>
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>← <span>Previous</span></button>
                <div className="page-numbers">{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} className={currentPage === pageNumber ? 'selected' : ''} onClick={() => setCurrentPage(pageNumber)}>{pageNumber}</button>)}</div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><span>Next</span> →</button>
              </div>
            </footer>}
          </section>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
        <section className="person-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
          <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button>
          <div className="modal-icon">＋</div>
          <h2 id="form-title">Add a person</h2>
          <p className="modal-intro">Bring someone new into your directory.</p>
          <form onSubmit={addUser}>
            <div className="form-grid">
              <label>First name <input autoFocus name="firstName" value={newUser.firstName} onChange={handleFormChange} placeholder="e.g. Alex" /></label>
              <label>Last name <input name="lastName" value={newUser.lastName} onChange={handleFormChange} placeholder="e.g. Morgan" /></label>
            </div>
            <label>Email address <input type="email" name="email" value={newUser.email} onChange={handleFormChange} placeholder="alex@company.com" /></label>
            <label>Company <input name="company" value={newUser.company} onChange={handleFormChange} placeholder="e.g. Acme Inc." /></label>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-actions"><button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">Add person <span>→</span></button></div>
          </form>
        </section>
      </div>}
    </main>
  )
}

export default App
