import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Oracle } from "../target/types/oracle";
import { assert } from "chai";
import { BN } from "bn.js";

describe("oracle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Oracle as Program<Oracle>;

  describe("#initialize()", async () => {
    it("initializes the oracle item account", async () => {
      const [oracleItemAccount, _] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from("counter")],
        program.programId
      );
  
  
      await program
        .methods
        .initialize()
        .accounts({
          oracleItem: oracleItemAccount,
          user: provider.wallet.publicKey
        })
        .rpc();
  
      const oracleItemAccountData = await program.account.oracleItem.fetch(oracleItemAccount);
  
      assert.ok(
        oracleItemAccountData.startedAt !== null,
        'started_at should be initialized'
      );
  
      assert.ok(
        oracleItemAccountData.finishedAt === null,
        'finished_at should be null'
      );
  
      assert.ok(
        oracleItemAccountData.authority.equals(provider.wallet.publicKey),
        'authority should be assigned'
      );
    });
  });

  describe("#put()", async () => {
    it("sets oracle value ", async () => {
      const [oracleItemAccount, _] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from("counter")],
        program.programId
      );
  
      await program
        .methods
        .put(5000)
        .accounts({
          oracleItem: oracleItemAccount,
          user: provider.wallet.publicKey
        })
        .rpc();
  
      const oracleItemAccountData = await program.account.oracleItem.fetch(oracleItemAccount);
  
      assert.ok(
        oracleItemAccountData.finishedAt !== null,
        'finished_at should be assigned'
      );
  
      assert.ok(
        oracleItemAccountData.value === 5000,
        'finished_at should be assigned'
      );
  
      assert.ok(
        oracleItemAccountData.authority.equals(provider.wallet.publicKey),
        'authority should be assigned'
      );
    });
  });


});
