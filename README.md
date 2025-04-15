# TON Wallet Testnet

Bunch of simple scripts to create a wallet, check the wallend and send TON coins on the testnet.

## Security Notice

⚠️ **IMPORTANT**: Never commit your `.env` file or share your mnemonic phrase. These are sensitive credentials that control access to your wallet.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ton-wallet-testnet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your credentials:
   - Add your wallet mnemonic phrase
   - Set the recipient address
   - Set the amount of TON to send

## Usage

Run the script:
```bash
npx ts-node <file-name>.ts
```

## Security Best Practices

- Keep your mnemonic phrase secure and never share it
- Use different wallets for development and production
- Regularly check your wallet's transaction history
- Consider using a hardware wallet for significant amounts

## License

MIT
