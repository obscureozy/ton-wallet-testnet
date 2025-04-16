/**
 * wallet-address.ts
 * 
 * This script generates and displays a TON wallet address from a mnemonic phrase.
 * It's useful for getting the address of a wallet before it's deployed on the network.
 */

import { mnemonicToWalletKey } from "@ton/crypto"
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
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
 * 2. Displays the wallet's address and workchain
 */
async function main() {
    // Generate wallet key pair from mnemonic
    const key = await mnemonicToWalletKey(validatedMnemonic.split(" "));
    
    // Create wallet contract instance
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: key.publicKey,
    });

    // Display wallet address in testnet format
    console.log(wallet.address.toString({ testOnly: true }));
    
    // Display wallet workchain
    console.log("workchain:", wallet.address.workChain);
}

// Run the main function and handle any errors
main().catch(console.error);