# Problem 3: Code Review & Refactoring

## Computational Inefficiencies and Anti-Patterns

### 1. **Type Safety Issues**

#### 1.1 Missing `blockchain` property in interface
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
}
```
The `WalletBalance` interface is missing the `blockchain` property, but it's accessed in the code via `balance.blockchain`. This causes a TypeScript error.

#### 1.2 Using `any` type
```typescript
const getPriority = (blockchain: any): number => {
```
Using `any` defeats the purpose of TypeScript. Should use a proper union type or enum.

#### 1.3 Empty interface extension
```typescript
interface Props extends BoxProps {

}
```
Empty interface extension is unnecessary. Should either add properties or use `BoxProps` directly.

---

### 2. **Logic Errors**

#### 2.1 Undefined variable `lhsPriority`
```typescript
if (lhsPriority > -99) {  // ❌ lhsPriority is never defined
```
The variable `lhsPriority` is used but never declared. It should be `balancePriority`.

#### 2.2 Inverted filter logic
```typescript
if (balance.amount <= 0) {
  return true;  // ❌ This KEEPS balances with 0 or negative amounts
}
```
The filter logic is inverted. It returns `true` for balances with `amount <= 0`, which keeps them. Typically, you want to filter OUT zero/negative balances.

#### 2.3 Missing return value in sort comparator
```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// ❌ Missing: return 0 when equal
```
Sort comparator must return `0` when values are equal for consistent behavior.

---

### 3. **Computational Inefficiencies**

#### 3.1 Function recreated on every render
```typescript
const WalletPage: React.FC<Props> = (props: Props) => {
  // ...
  const getPriority = (blockchain: any): number => {  // ❌ Recreated every render
```
`getPriority` is a pure function that doesn't depend on component state or props. It should be defined outside the component to avoid recreation on each render.

#### 3.2 Unnecessary dependency in `useMemo`
```typescript
const sortedBalances = useMemo(() => {
  // ... prices is NOT used in this computation
}, [balances, prices]);  // ❌ prices is unnecessary
```
`prices` is included in the dependency array but not used in the memoized computation. This causes unnecessary recalculations when prices change.

#### 3.3 `formattedBalances` not memoized
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})
```
This runs on every render. Should be memoized with `useMemo`.

#### 3.4 Wrong variable used for rendering
```typescript
const formattedBalances = sortedBalances.map(...)  // Creates formatted balances

const rows = sortedBalances.map(...)  // ❌ Uses sortedBalances instead of formattedBalances
```
`formattedBalances` is computed but never used. `rows` incorrectly maps over `sortedBalances` while expecting `FormattedWalletBalance` type.

---

### 4. **React Anti-Patterns**

#### 4.1 Using array index as key
```typescript
<WalletRow 
  key={index}  // ❌ Using index as key
```
Using array index as key can cause rendering issues when the list is reordered or items are added/removed. Should use a unique identifier like `balance.currency`.

#### 4.2 Unused destructured variable
```typescript
const { children, ...rest } = props;  // ❌ children is never used
```
`children` is destructured but never rendered or used.

---

### 5. **Code Style Issues**

#### 5.1 Inconsistent indentation
The code mixes tabs and spaces, making it hard to read.

#### 5.2 Inconsistent formatting
Missing semicolons in some places, inconsistent use of return statements.

---

## Refactored Code

```typescript
import React, { useMemo } from 'react';

// Types
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

// Pure function defined outside component - not recreated on renders
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized: filter, sort, and format in one pass
  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Keep balances with valid priority AND positive amount
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // Sort by priority descending
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]); // Only depends on balances

  // Memoize rows to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // Use unique identifier instead of index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
```

---

## Summary of Improvements

| Issue | Original | Refactored |
|-------|----------|------------|
| Type safety | `any` type, missing properties | Proper types with `Blockchain` union |
| `getPriority` location | Inside component (recreated) | Outside component (constant) |
| Filter logic | Inverted, undefined variable | Correct logic with `priority > -99 && amount > 0` |
| Sort comparator | Missing return 0 | Simplified with subtraction |
| Memoization | Partial, wrong dependencies | Complete with correct dependencies |
| List key | Array index | Unique `currency` identifier |
| Unused variables | `children` destructured | Removed |
| Code flow | Format then use wrong variable | Single chain: filter → sort → format |
