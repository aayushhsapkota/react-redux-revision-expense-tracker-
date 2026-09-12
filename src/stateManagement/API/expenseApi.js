import { axiosInstance, mockAdapter } from './index'

const PAGE_SIZE = 10

// Fake "database" — seeded once from the SAME localStorage key the app has
// used since Phase 2, so whatever you already added carries over once we
// switch the app onto Redux in Step 4. From here on, this array — not
// React state — is the source of truth; the app will FETCH from it.
function loadDB() {
  try {
    const stored = window.localStorage.getItem('expenses')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveDB(nextDb) {
  try {
    window.localStorage.setItem('expenses', JSON.stringify(nextDb))
  } catch (error) {
    console.error('Failed to persist mock DB:', error)
  }
}

let db = loadDB()

// --- Mock handlers: define how each endpoint behaves ------------------

mockAdapter.onGet('/expenses').reply((config) => {
  const { page = 1, filterBy = '', sortBy = 'date-desc', searchTitle = '', searchNote = '' } =
    config.params || {} //if config.params is undefined, then desstructing will assign default values to page, filterBy, sortBy, searchTitle, and searchNote as given.

  //The callback function is called by filter for each item, and its returned boolean tells filter whether to keep that item.
  let filtered = filterBy ? db.filter((e) => e.category === filterBy) : db 

  if (searchTitle || searchNote) { //if either searchTitle or searchNote is provided, 
    filtered = filtered.filter((e) => {
      const titleMatch = searchTitle && e.title.toLowerCase().includes(searchTitle.toLowerCase()) //.includes returns true if the title of the expense includes the searchTitle string (case-insensitive)
      const noteMatch =
        searchNote && e.note && e.note.toLowerCase().includes(searchNote.toLowerCase()) //.includes returns true if the note of the expense includes the searchNote string (case-insensitive)
      return titleMatch || noteMatch //
    })
  }

    // Totals reflect the WHOLE database — same as every phase since Phase 3 —
  // not just what matches the active filter/search. Only the LIST (below)
  // is supposed to narrow down; "Grand Total" and "By category" have always
  // meant the whole picture.
  const total = db.reduce((sum, e) => sum + e.amount, 0)
  const categoryTotals = db.reduce((totals, e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount
    return totals
  }, {})


  const [field, direction] = sortBy.split('-')
  // `a` and `b` are the two expenses being compared.
    // `a - b` gives a negative number when `a` is smaller, so `a` comes first (ascending).
    // `b - a` does the opposite, putting the larger value first (descending).
  const sorted = [...filtered].sort((a, b) => {
    if (field === 'date') {
      return direction === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    }
    return direction === 'asc' ? a.amount - b.amount : b.amount - a.amount
  })

  // Calculate how many pages are needed to display all sorted expenses.
// Math.ceil() rounds up because even one remaining expense needs a full page.
// Math.max(1, ...) ensures there is always at least 1 page.
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)) 

  // Calculate the starting index for the current page.
// Example: with PAGE_SIZE = 10, page 1 starts at index 0,
// page 2 starts at index 10, page 3 starts at index 20.
  const start = (page - 1) * PAGE_SIZE 
  const pageData = sorted.slice(start, start + PAGE_SIZE)

  return [200, { data: pageData, pageCount, total, categoryTotals }]
})

mockAdapter.onGet(/\/expenses\/[\w-]+$/).reply((config) => {
  const id = config.url.split('/').pop()
  const expense = db.find((e) => e.id === id)
  return expense ? [200, { data: expense }] : [404, { message: 'Expense not found' }]
})

mockAdapter.onPost('/expenses').reply((config) => {
  // Same simulated-flakiness idea as Phase 5's fakeExpenseApi.js.
  if (Math.random() < 0.15) {
    return [500, { message: 'Simulated server error' }]
  }
  const newExpense = JSON.parse(config.data)
  db = [newExpense, ...db]
  saveDB(db)
  return [201, { data: newExpense }]
})

mockAdapter.onPut(/\/expenses\/[\w-]+$/).reply((config) => {
  const updated = JSON.parse(config.data)
  db = db.map((e) => (e.id === updated.id ? updated : e))
  saveDB(db)
  return [200, { data: updated }]
})

mockAdapter.onDelete(/\/expenses\/[\w-]+$/).reply((config) => {
  const id = config.url.split('/').pop()
  db = db.filter((e) => e.id !== id)
  saveDB(db)
  return [200, { data: { id } }]
})

// --- The actual per-domain API functions — these are what thunks call --

export const GetAllExpenseAPI = ({ page = 1, filterBy = '', sortBy = 'date-desc', searchBy = {} } = {}) => 
  //default values for the parameters, so if no arguments are passed, it will use these defaults.
  axiosInstance.get('/expenses', {
    params: {
      page,
      filterBy,
      sortBy,
      searchTitle: searchBy.title || '',
      searchNote: searchBy.note || '',
    },
  })

export const GetExpenseByIdAPI = (id) => axiosInstance.get(`/expenses/${id}`)

export const CreateExpenseAPI = (expense) => axiosInstance.post('/expenses', expense)

export const UpdateExpenseAPI = (expense) => axiosInstance.put(`/expenses/${expense.id}`, expense)

export const DeleteExpenseAPI = (id) => axiosInstance.delete(`/expenses/${id}`)
