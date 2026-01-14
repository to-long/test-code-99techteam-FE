import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SwapForm } from './components/SwapForm';
import { WalletBalance } from './components/WalletBalance';
import { useWalletStore } from './store/useWalletStore';

export default function App() {
  const { fetchExchangeRates, isLoading, error } = useWalletStore();
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading exchange rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-amber-500/20 border border-amber-500/50 rounded-xl p-6">
          <p className="text-amber-400 font-medium mb-2">Failed to load exchange rates</p>
          <p className="text-white/60 text-sm">{error}</p>
          <button
            onClick={() => fetchExchangeRates()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Center - Swap Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Token Swap
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Exchange tokens instantly</p>
        </div>

        <SwapForm />
      </motion.div>

      {/* Right - Wallet Panel */}
      <AnimatePresence mode="wait">
        {isWalletOpen ? (
          <motion.div
            key="wallet"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full md:w-80 z-50"
          >
            <WalletBalance onClose={() => setIsWalletOpen(false)} />
          </motion.div>
        ) : (
          <motion.button
            key="toggle"
            type="button"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            exit={{ x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={() => setIsWalletOpen(true)}
            className="fixed right-0 top-0 -translate-y-1/2 z-50 w-12 h-24 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 border-r-0 rounded-l-2xl flex flex-col items-center justify-center gap-2 transition-colors"
            aria-label="Open wallet"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
