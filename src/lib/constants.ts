import { BN } from '@coral-xyz/anchor';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createApi } from '@ton-community/assets-sdk';

export const ZERO_BN = new BN(0);

export const FEE_BPS = new BN(100);
export const BPS_DENOMINATOR = new BN(10_000);

export const TOKEN_DECIMALS = 9;
export const DECIMAL_FACTOR = new BN(10).pow(new BN(TOKEN_DECIMALS));

export const SOL_DECIMALS = 9;
export const LAMPORTS_PER_SOL_BN = new BN(LAMPORTS_PER_SOL);

export const TOKEN_TOTAL_SUPPLY = new BN(1_000_000_000).mul(DECIMAL_FACTOR);

export const INITIAL_TOKEN_RESERVE = new BN(793_100_000).mul(DECIMAL_FACTOR);

export const SOL_DELTA = new BN(30).mul(LAMPORTS_PER_SOL_BN);
export const TOKEN_DELTA = new BN(279_900_000).mul(DECIMAL_FACTOR);

export const SCALE_FACTOR = new BN(10).pow(new BN(9));

export const DEVNET_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=3914c338-e2f9-456d-916e-f1b9014e59a3';

export const MAINNET_ENDPOINT = 'https://doralyn-onotsf-fast-mainnet.helius-rpc.com';

export const WSOLMint = new PublicKey('So11111111111111111111111111111111111111112');

export const CONNECTION = new Connection(MAINNET_ENDPOINT);

export const TREASURY = new PublicKey('EKi6xXtmKAEgHzRkXxAq6G99sZf28wPD9AKNmKsC2DJ1');

export const NETWORK = process.env.NODE_ENV == 'production' ? 'mainnet' : 'testnet';

export const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
export const pinataGatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
export const pinataGatewayToken = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

export const TX_VALID_DURATION = 1000 * 60 * 5; // 5 mins
