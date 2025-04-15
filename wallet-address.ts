import { mnemonicToWalletKey } from "@ton/crypto"
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const mnemonic = process.env.MNEMONIC;

if (!mnemonic) {
    throw new Error("MNEMONIC is not set in .env file");
}

// Type assertion after validation
const validatedMnemonic = mnemonic as string;

async function main() {
    const key = await mnemonicToWalletKey(validatedMnemonic.split(" "));
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: key.publicKey,
    });
    console.log(wallet.address.toString({ testOnly: true }));
    console.log("workchain:", wallet.address.workChain);
}

main().catch(console.error);