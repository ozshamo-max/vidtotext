export default function LanguageSelector({ value, onChange, disabled }) {
  const btn = (lang, flag, label) => (
    <button
      key={lang}
      onClick={() => onChange(lang)}
      disabled={disabled}
      className={[
        'flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all border-2',
        value === lang
          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {flag} {label}
    </button>
  )

  return (
    <div className="flex gap-3">
      {btn('he', '🇮🇱', 'עברית')}
      {btn('en', '🇬🇧', 'English')}
    </div>
  )
}
