import clsx from 'clsx';
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
}

export const TokenSelect = memo(
  ({ value, onChange, tokens, label, error, className }: TokenSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedToken = useMemo(() => tokens.find((t) => t.currency === value), [tokens, value]);

    const filteredTokens = useMemo(
      () => tokens.filter((t) => t.currency.toLowerCase().includes(search.toLowerCase())),
      [tokens, search]
    );

    const handleSelect = (currency: string) => {
      onChange(currency);
      setIsOpen(false);
      setSearch('');
    };

    return (
      <>
        <div className={clsx('flex flex-col gap-1.5', className)}>
          {label && <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={clsx(
              'group relative flex items-center justify-between gap-2 pl-3 pr-2 h-10 min-w-[140px] rounded-full transition-all duration-300',
              selectedToken
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-sm'
                : 'bg-blue-600/90 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/50',
              error && 'border-red-500/50 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
            )}
          >
            <div className="flex items-center gap-2">
              {selectedToken ? (
                <>
                  <img
                    src={selectedToken.icon}
                    alt={selectedToken.currency}
                    className="w-6 h-6 object-contain rounded-full bg-white/5"
                  />
                  <span className="text-base font-semibold text-white tracking-wide">
                    {selectedToken.currency}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold pl-1 whitespace-nowrap">Select Token</span>
              )}
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-300 opacity-70 group-hover:opacity-100',
                isOpen ? 'rotate-180' : ''
              )}
            />
          </button>

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
                    return (
                      <button
                        key={token.currency}
                        onClick={() => handleSelect(token.currency)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group',
                          isSelected
                            ? 'bg-blue-500/10 border border-blue-500/20'
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
