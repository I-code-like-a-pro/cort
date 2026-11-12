import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  Keypair,
  scValToNative,
} from "@stellar/stellar-sdk";

const server = new rpc.Server("https://soroban-testnet.stellar.org");

const clean = (s: string | undefined) => (s || "").replace(/[^A-Z0-9]/g, "");

// Public testnet XLM token contract. Override with TOKEN_ID in .env if needed.
const TOKEN_ID =
  clean(process.env.TOKEN_ID) || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const WALLET_ID = clean(process.env.WALLET_ID);

// Read-only: asks the token contract for the wallet's balance. Sends nothing.
export async function getWalletBalanceXlm(): Promise<number> {
  const source = Keypair.fromSecret(process.env.AGENT_SECRET!).publicKey();
  const account = await server.getAccount(source);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(new Contract(TOKEN_ID).call("balance", new Address(WALLET_ID).toScVal()))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if ("error" in sim && sim.error) throw new Error("balance lookup failed");

  const stroops = scValToNative((sim as any).result.retval) as bigint;
  return Number(stroops) / 10_000_000;
}
