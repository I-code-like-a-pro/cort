import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  Keypair,
  nativeToScVal,
} from "@stellar/stellar-sdk";

export type PayResult = { ok: true; hash: string } | { ok: false; reason: string };

const server = new rpc.Server("https://soroban-testnet.stellar.org");
const keypair = Keypair.fromSecret(process.env.AGENT_SECRET!);
const contract = new Contract(process.env.WALLET_ID!);

export async function pay(payee: string, amount: number): Promise<PayResult> {
  try {
    const account = await server.getAccount(keypair.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call("pay", new Address(payee).toScVal(), nativeToScVal(BigInt(amount), { type: "i128" }))
      )
      .setTimeout(60)
      .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    const sent = await server.sendTransaction(prepared);
    let result = await server.getTransaction(sent.hash);
    while (result.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1400));
      result = await server.getTransaction(sent.hash);
    }
    if (result.status === "SUCCESS") {
      return { ok: true, hash: sent.hash };
    }
    return { ok: false, reason: "transaction failed on-chain" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "blocked by wallet rules or network error: " + message };
  }
}
