# Problem 2: Token Swap Form

A fancy currency swap form built with React and TypeScript.

## Preview

A modern token swap interface that allows users to exchange tokens with real-time price calculations and wallet balance validation.

## Prerequisites

Before running this project, make sure you have the following installed globally:

### 1. Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify installation:
```bash
bun --version
```

### 2. Install pnpm

```bash
# Using npm
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm
```

Verify installation:
```bash
pnpm --version
```

## Tech Stack

- **Runtime**: Bun / Node.js
- **Framework**: React 19 with TypeScript
- **Build Tool**: [Rsbuild](https://rsbuild.dev/) - Fast Rust-based build tool
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Yup validation
- **State Management**: Zustand
- **Data Source**: [Switcheo API](https://interview.switcheo.com/prices.json)

## Getting Started

### Install dependencies

```bash
cd problem2
pnpm install
```

### Start development server

```bash
pnpm dev
```

The app will be available at http://localhost:3000

### Build for production

```bash
pnpm build
```

### Preview production build

```bash
pnpm preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |

## Project Structure

```
problem2/
├── public/
│   └── icons/              # Token icons
├── src/
│   ├── components/
│   │   ├── SwapForm.tsx    # Main swap form component
│   │   ├── TokenSelector.tsx # Token dropdown selector
│   │   └── WalletBalance.tsx # Wallet balance display
│   ├── hooks/
│   │   ├── useSwapValidation.ts # Yup validation hook
│   │   └── useTokens.ts    # Token data hook
│   ├── store/
│   │   └── useWalletStore.ts # Zustand store for wallet state
│   ├── constants.ts        # Token icons mapping
│   ├── App.tsx             # Main app component
│   ├── index.tsx           # Entry point
│   └── index.css           # Global styles with Tailwind
├── package.json
├── rsbuild.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Features

### Token Swap Form
- Select "From" and "To" tokens from dropdown
- Real-time exchange rate calculation
- USD value display for amounts
- Animated token selector with search

### Wallet Balance
- Displays all tokens in wallet with USD values
- Sorted by USD value (highest first)
- Total portfolio balance calculation
- Scrollable token list

### Form Validation (Yup)
- Required amount validation
- Number format validation
- Balance check (amount ≤ wallet balance)
- Real-time error feedback

### UX Features
- "Max" button to use full balance
- Swap tokens button (↕️)
- Loading state with spinner
- Responsive design
- Smooth animations

## API

Exchange rates are fetched from:
```
https://interview.switcheo.com/prices.json
```

The app fetches prices on startup and uses them for:
- Exchange rate calculations
- USD value conversions
- Wallet balance display

## Environment

The app runs on port 3000 by default. Configure in `rsbuild.config.ts` if needed.
