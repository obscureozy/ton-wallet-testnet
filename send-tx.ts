import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, WalletContractV5R1, TonClient, fromNano, toNano } from "@ton/ton";
import pkg from '@ton/core';
import * as dotenv from 'dotenv';

const { Cell, Address, beginCell } = pkg;

// Load environment variables
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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const key = await mnemonicToWalletKey(validatedMnemonic.split(" "));
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: key.publicKey,
    });
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const provider = new TonClient({ endpoint });
 
    if (!await provider.isContractDeployed(wallet.address)) {
        throw new Error("Wallet is not deployed");
    }

    const walletContract = provider.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("seqno:", seqno);

    // Create empty message body since we're just sending TON
    const messageBody = beginCell().endCell();

    console.log(`Sending ${validatedAmount} TON to ${validatedRecipientAddress}...`);
    
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
    let currentSeqno = seqno;
    while (currentSeqno === seqno) {
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("\x1b[32m%s\x1b[0m", "Transaction sent successfully ✓");
}

main().catch(console.error);