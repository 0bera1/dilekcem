let started = false

/** Loads the export libraries and fonts once the user starts typing, so downloads also work offline. */
export function prefetchExporters(): void {
  if (started) return
  started = true
  void import('./pdf')
    .then((m) => m.loadPdfFonts())
    .catch(() => {
      started = false
    })
  void import('./docx').catch(() => {
    started = false
  })
  void import('./ics').catch(() => {
    started = false
  })
}
