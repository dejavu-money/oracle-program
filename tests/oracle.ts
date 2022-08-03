import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Oracle } from "../target/types/oracle";
import { assert } from "chai";
import { BN } from "bn.js";

const ORACLE_CLOSE = 1 * 60; // 1 minutes

describe("oracle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Oracle as Program<Oracle>;
  let authId;
  
  describe("#create_authorizer()", async () => {
    it("create an authorizer account", async () => {
      authId = new Date().getTime();

      const [oracleAuthorizer] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`id-${authId}`)],
        program.programId
      );

      await program
        .methods
        .createAuthorizer(new BN(authId), new BN(ORACLE_CLOSE))
        .accounts({
          oracleAuthorizer: oracleAuthorizer,
          user: provider.wallet.publicKey
        })
        .rpc();
  
      const oracleAuthorizerData = await program.account.oracleAuthorizer.fetch(oracleAuthorizer);
  
      assert.ok(
        oracleAuthorizerData.authority.equals(provider.wallet.publicKey)
      );

      assert.ok(
        oracleAuthorizerData.createdAt.toNumber() < new Date().getTime()
      );

    });
  });

  describe("#create_oracle()", async () => {
    it("create an oracle account", async () => {
      const oracleId = new Date().getTime();
      const [oracleAuthorizer] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`id-${authId}`)],
        program.programId
      );

      const [oracleItem] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`id-${oracleId}`)],
        program.programId
      );

      const feedAccount = new anchor.web3.PublicKey("HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6");
      const chainLinkProgramAccount = new anchor.web3.PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny")
  
      await program
        .methods
        .createOracle(new BN(oracleId))
        .accounts({
          oracleAuthorizer: oracleAuthorizer,
          oracleItem: oracleItem,
          user: provider.wallet.publicKey,
          feedAccount: feedAccount,
          chainlinkProgram: chainLinkProgramAccount
        })
        .rpc();
  
      const oracleItemData = await program.account.oracleItem.fetch(oracleItem);

      console.log(JSON.stringify(oracleItemData));
      console.log(oracleItemData.round.toNumber())
  
      assert.ok(
        oracleItemData.authority.equals(oracleAuthorizer)
      );

    });
  });
});
