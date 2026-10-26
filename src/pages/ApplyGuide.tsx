import { DecisionFinder } from '../components/DecisionFinder'
import { Seo } from '../components/Seo'
import s from './Pages.module.css'

export default function ApplyGuide() {
  return (
    <div className={s.page}>
      <Seo
        title="Başvuru yolu bulucu: nereye başvurmalıyım?"
        description="Sorununuzu birkaç soruyla belirleyin; size uygun dilekçe şablonunu ve başvuru merciini gösterelim."
        path="/basvuru-yolu"
      />
      <h1 className={s.h1}>Nereye başvurmalıyım?</h1>
      <p className={s.lead}>Sorunuzu birkaç adımda daraltalım ve sizi doğru şablona götürelim.</p>
      <div className={s.card}>
        <DecisionFinder />
      </div>
    </div>
  )
}
