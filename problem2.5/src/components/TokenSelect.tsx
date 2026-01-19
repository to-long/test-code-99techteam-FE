import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { Token } from '../hooks/useTokenPrices';
import { Modal } from './ui/Modal';

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  tokens: Token[];
  label?: string;
  error?: string;
  className?: string;
  excludeToken?: string;
  enableQuickSelect?: boolean;
}

const POPULAR_TOKENS = ['ETH', 'USDC', 'WBTC', 'ATOM', 'BUSD', 'OSMO', 'OKB'];

export const TokenSelect = memo(
  ({
    value,
    onChange,
    tokens,
    label,
    error,
    className,
    excludeToken,
    enableQuickSelect = false,
  }: TokenSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const selectedToken = useMemo(() => tokens.find((t) => t.currency === value), [tokens, value]);

    const filteredTokens = useMemo(
      () => tokens.filter((t) => t.currency.toLowerCase().includes(search.toLowerCase())),
      [tokens, search]
    );

    const quickAccessTokens = useMemo(() => {
      // Show popular tokens that are NOT excluded
      // We keep the currently selected one in the list for visual stability
      return tokens
        .filter((t) => POPULAR_TOKENS.includes(t.currency) && t.currency !== excludeToken)
        .slice(0, 5);
    }, [tokens, excludeToken]);

    const handleSelect = (currency: string) => {
      onChange(currency);
      setIsOpen(false);
      setSearch('');
      setIsHovering(false);
    };

    return (
      <>
        <div
          className={clsx('flex flex-col gap-1.5 relative z-20', className)}
          onMouseEnter={() => enableQuickSelect && setIsHovering(true)}
          onMouseLeave={() => enableQuickSelect && setIsHovering(false)}
        >
          {label && <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={clsx(
                'group relative flex items-center justify-between gap-2 pl-3 pr-2 h-10 min-w-[140px] rounded-full transition-all duration-300 w-full overflow-hidden',
                // Glass Effect
                'backdrop-blur-md',
                // Reflection/Shine
                'after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:pointer-events-none',
                selectedToken
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10 shadow-sm'
                  : 'bg-blue-500/30 border border-blue-400/30 hover:bg-blue-500/40 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]',
                error && 'border-red-500/50 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {selectedToken ? (
                  <>
                    <img
                      src={selectedToken.icon}
                      alt={selectedToken.currency}
                      className="w-6 h-6 object-contain rounded-full bg-white/5 shrink-0"
                    />
                    <span className="text-base font-semibold text-white tracking-wide truncate">
                      {selectedToken.currency}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold pl-1 whitespace-nowrap">Select Token</span>
                )}
              </div>
              <ChevronDown
                className={clsx(
                  'w-4 h-4 transition-transform duration-300 opacity-70 group-hover:opacity-100 shrink-0',
                  isOpen ? 'rotate-180' : ''
                )}
              />
            </button>

            {/* Quick Select Hover Menu */}
            <AnimatePresence>
              {enableQuickSelect && isHovering && quickAccessTokens.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-2 h-10 flex items-center gap-1.5 z-50 pointer-events-none"
                >
                  <div className="flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl pointer-events-auto">
                    {quickAccessTokens.map((token) => (
                      <button
                        type="button"
                        key={token.currency}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(token.currency);
                        }}
                        className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all hover:scale-110 group/item"
                        title={token.currency}
                      >
                        <img
                          src={token.icon}
                          alt={token.currency}
                          className="w-6 h-6 object-contain rounded-full"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && <span className="text-xs text-red-400 ml-1 font-medium">{error}</span>}
        </div>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Select a Token"
          className="h-[600px]"
        >
          <div className="p-4 space-y-4 h-full flex flex-col">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or paste address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all"
                autoFocus
              />
            </div>

            {/* Token List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
              {filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map((token) => {
                    const isSelected = token.currency === value;
                    const isDisabled = token.currency === excludeToken;
                    return (
                      <button
                        key={token.currency}
                        onClick={() => !isDisabled && handleSelect(token.currency)}
                        disabled={isDisabled}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group',
                          isSelected
                            ? 'bg-blue-500/10 border border-blue-500/20'
                            : isDisabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={token.icon}
                            alt={token.currency}
                            className="w-9 h-9 object-contain rounded-full bg-white/5"
                          />
                          <div className="flex flex-col items-start">
                            <span
                              className={clsx(
                                'font-semibold text-base',
                                isSelected ? 'text-blue-400' : 'text-white'
                              )}
                            >
                              {token.currency}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              ${token.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No tokens found</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </>
    );
  }
);
