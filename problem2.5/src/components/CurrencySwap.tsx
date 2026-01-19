import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { TokenSelect } from './TokenSelect';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const swapSchema = z
  .object({
    amount: z
      .number({ invalid_type_error: 'Please enter a valid amount' })
      .positive('Amount must be greater than 0')
      .optional(),
    fromCurrency: z.string().min(1, 'Select a token'),
    toCurrency: z.string().min(1, 'Select a token'),
  })
  .refine((data) => data.fromCurrency !== data.toCurrency, {
    message: 'Select a different token',
    path: ['toCurrency'],
  });

type SwapFormData = z.infer<typeof swapSchema>;

const DEFAULT_FROM_CURRENCY = 'ETH';
const DEFAULT_TO_CURRENCY = '';
const STORAGE_KEY_FROM = 'currency-swap-from';
const STORAGE_KEY_TO = 'currency-swap-to';

export const CurrencySwap = () => {
  const { tokens, isLoading, error: pricesError } = useTokenPrices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Track which input controlled the calculation last
  const [activeInput, setActiveInput] = useState<'from' | 'to'>('from');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    mode: 'onChange',
    defaultValues: {
      amount: undefined,
      fromCurrency: sessionStorage.getItem(STORAGE_KEY_FROM) || DEFAULT_FROM_CURRENCY,
      toCurrency: sessionStorage.getItem(STORAGE_KEY_TO) || DEFAULT_TO_CURRENCY,
    },
  });

  const fromCurrency = watch('fromCurrency');
  const toCurrency = watch('toCurrency');
  const amount = watch('amount');

  // Persist selections
  useEffect(() => {
    if (fromCurrency) sessionStorage.setItem(STORAGE_KEY_FROM, fromCurrency);
    if (toCurrency) sessionStorage.setItem(STORAGE_KEY_TO, toCurrency);
  }, [fromCurrency, toCurrency]);

  // Local state for display values
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');

  // Exchange Rate Logic
  const exchangeRate = useMemo(() => {
    const fromToken = tokens.find((t) => t.currency === fromCurrency);
    const toToken = tokens.find((t) => t.currency === toCurrency);
    if (!fromToken || !toToken || !toToken.price) return 0;
    return fromToken.price / toToken.price;
  }, [tokens, fromCurrency, toCurrency]);

  // Sync Logic
  const handleFromChange = useCallback(
    (value: string) => {
      setActiveInput('from');
      setFromAmount(value);

      // Update form for validation
      const num = Number.parseFloat(value);
      setValue('amount', isNaN(num) ? undefined : num, { shouldValidate: true });

      if (value && !isNaN(Number.parseFloat(value)) && exchangeRate) {
        const computed = (Number.parseFloat(value) * exchangeRate).toFixed(6);
        // Remove trailing zeros if needed, or keep precision
        setToAmount(Number.parseFloat(computed).toString());
      } else {
        setToAmount('');
      }
    },
    [exchangeRate, setValue]
  );

  const handleToChange = useCallback(
    (value: string) => {
      setActiveInput('to');
      setToAmount(value);

      if (value && !isNaN(Number.parseFloat(value)) && exchangeRate) {
        const computed = (Number.parseFloat(value) / exchangeRate).toFixed(6);
        setFromAmount(Number.parseFloat(computed).toString());

        // Update form validation with the COMPUTED from amount
        setValue('amount', Number.parseFloat(computed), { shouldValidate: true });
      } else {
        setFromAmount('');
        setValue('amount', undefined, { shouldValidate: true });
      }
    },
    [exchangeRate, setValue]
  );

  // When currency changes, recalculate based on last active input
  useEffect(() => {
    if (activeInput === 'from') {
      if (fromAmount) handleFromChange(fromAmount);
    } else {
      if (toAmount) handleToChange(toAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency]);

  const handleSwapDirection = () => {
    // Swap currencies
    setValue('fromCurrency', toCurrency);
    setValue('toCurrency', fromCurrency);
    // The useEffect above will trigger recalculation
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    setSuccessMessage(`Swapped ${fromAmount} ${fromCurrency} for ${toAmount} ${toCurrency}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (pricesError) {
    return (
      <div className="text-red-400 p-4 border border-red-500/20 rounded-xl bg-red-900/10 text-center">
        Failed to load prices. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] relative">
      <Card className="relative z-10 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
          {/* FROM Section */}
          <div
            className="bg-[#1b1b1b]/50 hover:bg-[#1b1b1b] rounded-[20px] p-4 transition-colors cursor-text"
            onClick={(e) => {
              // Prevent focus if clicking the token select button
              if (!(e.target as HTMLElement).closest('button')) {
                fromInputRef.current?.focus();
              }
            }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">From</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                ref={fromInputRef}
                type="number"
                step="any"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleFromChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full bg-transparent text-4xl font-medium text-white placeholder-gray-600 focus:outline-none no-spinner"
                autoComplete="off"
              />
              <div className="shrink-0">
                <Controller
                  name="fromCurrency"
                  control={control}
                  render={({ field }) => (
                    <TokenSelect
                      {...field}
                      tokens={tokens}
                      label=""
                      error={errors.fromCurrency?.message}
                      excludeToken={toCurrency}
                    />
                  )}
                />
              </div>
            </div>
            {/* USD Price Display */}
            <div className="h-6 mt-4">
              {fromAmount && !isNaN(Number.parseFloat(fromAmount)) && (
                <div className="text-sm text-gray-500 font-medium font-mono">
                  $
                  {(
                    Number.parseFloat(fromAmount) *
                    (tokens.find((t) => t.currency === fromCurrency)?.price || 0)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
            </div>

            {errors.amount && (
              <div className="mt-2 text-red-400 text-xs font-medium">{errors.amount.message}</div>
            )}
          </div>

          {/* Swap Switcher */}
          <div className="relative h-2 flex items-center justify-center z-10">
            <div className="absolute inset-x-0 h-[1px] bg-transparent" />
            <motion.button
              type="button"
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapDirection}
              className="relative bg-[#1b1b1b] p-2 rounded-xl border-4 border-[#09090b] text-blue-400 hover:text-white transition-colors"
            >
              <ArrowDownUp className="w-5 h-5" />
            </motion.button>
          </div>

          {/* TO Section */}
          <div
            className="bg-[#1b1b1b]/50 hover:bg-[#1b1b1b] rounded-[20px] p-4 transition-colors cursor-text"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('button')) {
                toInputRef.current?.focus();
              }
            }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">To</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                ref={toInputRef}
                type="number"
                step="any"
                placeholder="0.00"
                value={toAmount}
                onChange={(e) => handleToChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full bg-transparent text-4xl font-medium text-white placeholder-gray-600 focus:outline-none no-spinner"
                autoComplete="off"
              />
                <div className="shrink-0">
                <Controller
                  name="toCurrency"
                  control={control}
                  render={({ field }) => (
                    <TokenSelect
                      {...field}
                      tokens={tokens}
                      label=""
                      error={errors.toCurrency?.message}
                      excludeToken={fromCurrency}
                      enableQuickSelect={true}
                    />
                  )}
                />
              </div>
            </div>
            {/* USD Price Display */}
            <div className="h-6 mt-4">
              {toAmount && !isNaN(Number.parseFloat(toAmount)) && (
                <div className="text-sm text-gray-500 font-medium font-mono">
                  $
                  {(
                    Number.parseFloat(toAmount) *
                    (tokens.find((t) => t.currency === toCurrency)?.price || 0)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-lg"
            disabled={!isValid || isSubmitting || isLoading || !amount}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Swapping...' : 'Confirm Swap'}
          </Button>

        </form>
      </Card>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-center text-sm font-medium backdrop-blur-md z-20"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
