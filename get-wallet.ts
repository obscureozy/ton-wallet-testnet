import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, WalletContractV5R1, TonClient, fromNano } from "@ton/ton";
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
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const provider = new TonClient({ endpoint });

    console.log("Wallet address:", wallet.address.toString({ testOnly: true }));
    console.log("Workchain:", wallet.address.workChain);
 
    const isDeployed = await provider.isContractDeployed(wallet.address);
    if (!isDeployed) {
        console.log("\n⚠️  Wallet is not deployed on the testnet.");
        console.log("To deploy your wallet, you need to send some testnet TON to this address.");
        console.log("You can get testnet TON from a faucet like: https://t.me/testgiver_ton_bot");
        console.log("After receiving testnet TON, the wallet will be automatically deployed.");
        return;
    }

    const walletContract = provider.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("\nWallet is deployed!");
    console.log("Current sequence number:", seqno);

    const balance = await provider.getBalance(wallet.address);
    console.log("Current balance:", fromNano(balance), "TON");
}

main().catch(console.error);
