// No real backend yet (that's Phase 7's job with Redux + a mock API).
// This exists purely to give useOptimistic something real to hide:
// a delay, and a small chance of failure.
export function fakeSaveExpense(expense) {
  return new Promise((resolve, reject) => {
    const delay = 2500;
    setTimeout(() => {
      const didFail = Math.random() < 0.15 // ~15% simulated failure rate
      if (didFail) {
        reject(new Error('Simulated network failure'))
      } else {
        resolve(expense)
      }
    }, delay)
  })
}
