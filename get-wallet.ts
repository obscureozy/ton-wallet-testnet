/**
 * get-wallet.ts
 * 
 * This script connects to the TON testnet and retrieves information about a wallet
 * using a mnemonic phrase. It checks if the wallet is deployed and displays its
 * address, balance, and sequence number.
 */

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, WalletContractV5R1, TonClient, fromNano } from "@ton/ton";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const mnemonic = process.env.MNEMONIC;

if (!mnemonic) {
    throw new Error("MNEMONIC is not set in .env file");
}

// Type assertion after validation
const validatedMnemonic = mnemonic as string;

/**
 * Main function that:
 * 1. Creates a wallet from the mnemonic
 * 2. Connects to the TON testnet
 * 3. Checks if the wallet is deployed
 * 4. Displays wallet information and balance
 */
async function main() {
    // Generate wallet key pair from mnemonic
    const key = await mnemonicToWalletKey(validatedMnemonic.split(" "));
    
    // Create wallet contract instance
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: key.publicKey,
    });

    // Connect to TON testnet
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const provider = new TonClient({ endpoint });

    // Display wallet address information
    console.log("Wallet address:", wallet.address.toString({ testOnly: true }));
    console.log("Workchain:", wallet.address.workChain);
 
    // Check if wallet is deployed on the network
    const isDeployed = await provider.isContractDeployed(wallet.address);
    if (!isDeployed) {
        console.log("\n⚠️  Wallet is not deployed on the testnet.");
        console.log("To deploy your wallet, you need to send some testnet TON to this address.");
        console.log("You can get testnet TON from a faucet like: https://t.me/testgiver_ton_bot");
        console.log("After receiving testnet TON, the wallet will be automatically deployed.");
        return;
    }

    // If wallet is deployed, get and display additional information
    const walletContract = provider.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("\nWallet is deployed!");
    console.log("Current sequence number:", seqno);

    // Get and display wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Current balance:", fromNano(balance), "TON");
}

// Run the main function and handle any errors
main().catch(console.error);
