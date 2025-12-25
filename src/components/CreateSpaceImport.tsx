import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { decodePersonaFromUrl, addCustomPersona } from "@/lib/personas"
import { Loader2, AlertCircle, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateSpaceImport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [personaName, setPersonaName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const data = searchParams.get('data')
    
    if (!data) {
      setStatus('error')
      setErrorMessage('No persona data found in URL')
      return
    }

    try {
      const persona = decodePersonaFromUrl(data)
      
      if (!persona) {
        setStatus('error')
        setErrorMessage('Invalid persona data')
        return
      }

      // Create the persona
      const createdPersona = addCustomPersona(persona)
      setPersonaName(createdPersona.name)
      setStatus('success')

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/spaces/${createdPersona.id}`)
      }, 2000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to import persona')
      console.error('Import error:', error)
    }
  }, [searchParams, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-xl">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
                <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Importing Space...
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Please wait while we create your space
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4"
              >
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Space Created! 🎉
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{personaName}</span> has been added to your spaces
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Redirecting to your new space...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Import Failed
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                {errorMessage}
              </p>
              <Button
                onClick={() => navigate('/spaces')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Go to Spaces
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
