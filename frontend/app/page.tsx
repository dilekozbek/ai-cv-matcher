'use client'

import { useState } from 'react'

type MatchResult = {
  score: number
  matched_skills: string[]
  missing_skills: string[]
  summary: string
}

const MAX_QUERIES_PER_SESSION = 5

export default function Home() {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queryCount, setQueryCount] = useState(0)

  const queriesLeft = MAX_QUERIES_PER_SESSION - queryCount

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!cvFile || !jdText.trim()) {
      setError('CV and job description are required')
      return
    }

    if (queryCount >= MAX_QUERIES_PER_SESSION) {
      setError(`Session limit reached (${MAX_QUERIES_PER_SESSION} queries). Refresh the page to reset.`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('cv_file', cvFile)
    formData.append('jd_text', jdText)

    try {
      const res = await fetch('http://localhost:8000/match', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Something went wrong')
      }
      const data: MatchResult = await res.json()
      setResult(data)
      setQueryCount((c) => c + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor =
    result && result.score >= 70
      ? 'from-emerald-500 to-teal-600'
      : result && result.score >= 40
        ? 'from-amber-500 to-orange-600'
        : 'from-rose-500 to-pink-600'

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50 to-emerald-50">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10 text-center">
          <div className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-orange-700 bg-orange-100 rounded-full">
            AI · RAG · Match
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-800 to-emerald-700">
            CV ↔ JD Matcher
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Upload your CV, paste a job description, get an instant fit analysis.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white/70 backdrop-blur-xl border border-white/40 p-7 rounded-2xl shadow-xl shadow-orange-100/50"
        >
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-900">CV (PDF)</label>
            <label className="group flex items-center gap-3 cursor-pointer border-2 border-dashed border-orange-400 hover:border-orange-600 rounded-xl p-4 transition-colors">
              <span className="bg-slate-900 group-hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Choose file
              </span>
              <span className="text-slate-700 text-sm truncate">
                {cvFile ? cvFile.name : 'No file selected'}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-900">Job Description</label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={8}
              placeholder="Paste the job description here..."
              className="w-full border-2 border-orange-400 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:border-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || queriesLeft <= 0}
            className="w-full bg-gradient-to-r from-orange-600 via-orange-800 to-emerald-700 hover:from-orange-700 hover:via-orange-900 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? 'Analyzing…' : 'Analyze Match'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            {queriesLeft > 0
              ? `${queriesLeft} of ${MAX_QUERIES_PER_SESSION} queries left in this session`
              : 'Session limit reached — refresh the page to reset.'}
          </p>
        </form>

        {error && (
          <div className="mt-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-7 rounded-2xl shadow-xl shadow-orange-100/50">
              <div className="flex items-center gap-6 mb-4">
                <div
                  className={`flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${scoreColor} text-white shadow-lg`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-extrabold leading-none">{result.score}</div>
                    <div className="text-xs opacity-80 mt-0.5">/ 100</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Match Score</div>
                  <p className="text-slate-700 mt-1 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills.length === 0 ? (
                    <span className="text-sm text-slate-400">No matches found</span>
                  ) : (
                    result.matched_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-semibold text-rose-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.length === 0 ? (
                    <span className="text-sm text-slate-400">Nothing missing</span>
                  ) : (
                    result.missing_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-sm"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
