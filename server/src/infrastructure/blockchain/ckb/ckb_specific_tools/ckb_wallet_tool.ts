
import * as crypto from "crypto";
import * as cccModule from '@ckb-ccc/core';

// ─── Config ────────────────────────────────────────────────────────────────────

export const ccc = (cccModule as any).default || cccModule;
export const cccClient = new ccc.ClientPublicTestnet();


export function generatePrivateKey(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return "0x" + [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function generateLockArgs(privateKey: string): string {
    // Blake160 hash of the compressed public key → used as lock args
    const args = ccc.hd.key.privateKeyToBlake160(privateKey);
    return args;
}



// ─── Derive CKB address from a private key ─────────────────────────────────────
export async function getAddress(privateKey: string): Promise<string> {
    try {
        const signer = new ccc.SignerCkbPrivateKey(cccClient, privateKey);
        return (await signer.getAddressObjSecp256k1()).toString();
    } catch (error) {
        console.error('Error getting address:', error);
        throw new Error('Failed to derive address from private key');
    }
}

export const walletTools = [];
