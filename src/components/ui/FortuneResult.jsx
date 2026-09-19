export default function FortuneResult({ visible = false, fortune = null, alreadyRead = false, onReset = null }) {
  if (!fortune) return null

  return (
    <div className={`fortune-result ${visible ? 'visible' : ''}`} aria-hidden={!visible}>
      <div className="fortune-card">
        <div className="fortune-kicker">{alreadyRead ? 'Quẻ hôm nay đã gieo' : '✦ quẻ của bạn ✦'}</div>
        <h1 className="fortune-name">{fortune.name}</h1>
        <p className="fortune-desc">{fortune.description}</p>
        {onReset && (
          <button type="button" className="fortune-reroll" onClick={onReset}>
            ✦ Rút lại ✦
          </button>
        )}
      </div>
    </div>
  )
}