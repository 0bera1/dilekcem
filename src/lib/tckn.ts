/** T.C. kimlik numarası doğrulama algoritması (11 hane, 10. ve 11. hane sağlama). */
export function isValidTckn(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false
  const d = value.split('').map(Number)
  const at = (i: number): number => d[i] ?? 0
  const odd = at(0) + at(2) + at(4) + at(6) + at(8)
  const even = at(1) + at(3) + at(5) + at(7)
  const tenth = (((odd * 7 - even) % 10) + 10) % 10
  if (tenth !== at(9)) return false
  const sum = d.slice(0, 10).reduce((a, b) => a + b, 0)
  return sum % 10 === at(10)
}
