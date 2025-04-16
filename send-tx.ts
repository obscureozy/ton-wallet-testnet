/**
 * send-tx.ts
 * 
 * This script sends TON coins from one wallet to another on the TON testnet.
 * It uses a mnemonic phrase to access the sender's wallet and requires
 * the recipient's address and amount to be specified in the .env file.
 */

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, WalletContractV5R1, TonClient, fromNano, toNano } from "@ton/ton";
import pkg from '@ton/core';
import * as dotenv from 'dotenv';

const { Cell, Address, beginCell } = pkg;

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const mnemonic = process.env.MNEMONIC;
const recipientAddress = process.env.RECIPIENT_ADDRESS;
const amount = process.env.AMOUNT;

if (!mnemonic) {
    throw new Error("MNEMONIC is not set in .env file");
}
if (!recipientAddress) {
    throw new Error("RECIPIENT_ADDRESS is not set in .env file");
}
if (!amount) {
    throw new Error("AMOUNT is not set in .env file");
}

// Type assertions after validation
const validatedMnemonic = mnemonic as string;
const validatedRecipientAddress = recipientAddress as string;
const validatedAmount = amount as string;

/**
 * Utility function to pause execution for a specified time
 * @param ms - Number of milliseconds to sleep
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function that:
 * 1. Creates a wallet from the mnemonic
 * 2. Connects to the TON testnet
 * 3. Creates and sends a transfer transaction
 * 4. Waits for transaction confirmation
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
 
    // Check if wallet is deployed
    if (!await provider.isContractDeployed(wallet.address)) {
        throw new Error("Wallet is not deployed");
    }

    // Open wallet contract and get current sequence number
    const walletContract = provider.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("seqno:", seqno);

    // Create empty message body since we're just sending TON
    const messageBody = beginCell().endCell();

    // Display transaction details
    console.log(`Sending ${validatedAmount} TON to ${validatedRecipientAddress}...`);
    
    // Send the transfer transaction
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno,
        messages: [
            {
                info: {
                    type: 'internal',
                    dest: Address.parse(validatedRecipientAddress),
                    value: { coins: toNano(validatedAmount) },
                    bounce: false,
                    ihrDisabled: true,
                    bounced: false,
                    ihrFee: 0n,
                    forwardFee: 0n,
                    createdAt: 0,
                    createdLt: 0n,
                },
                body: messageBody,
            }
        ],
    });

    // Wait for transaction confirmation by checking sequence number
    let currentSeqno = seqno;
    while (currentSeqno === seqno) {
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    
    // Display success message
    console.log("\x1b[32m%s\x1b[0m", "Transaction sent successfully ✓");
}

// Run the main function and handle any errors
main().catch(console.error);