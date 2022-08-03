import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Oracle } from "../target/types/oracle";
import { assert } from "chai";
import { BN } from "bn.js";

const ORACLE_CLOSES_IN = 0; // seconds

describe("oracle", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Oracle as Program<Oracle>;
  let oracleAuthAccount;
  let oracleItemAccount;
  
  describe("#create_authorizer()", async () => {
    it("create an authorizer account", async () => {
      const authId = new Date().getTime();

      const [oracleAuthorizer] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`id-${authId}`)],
        program.programId
      );

      oracleAuthAccount = oracleAuthorizer;

      await program
        .methods
        .createAuthorizer(new BN(authId), new BN(ORACLE_CLOSES_IN))
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
    it("creates an oracle account", async () => {
      const oracleId = new Date().getTime();

      const [oracleItem] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`id-${oracleId}`)],
        program.programId
      );

      oracleItemAccount = oracleItem;

      const feedAccount = new anchor.web3.PublicKey("HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6");
      const chainLinkProgramAccount = new anchor.web3.PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny")
  
      await program
        .methods
        .createOracle(new BN(oracleId))
        .accounts({
          oracleAuthorizer: oracleAuthAccount,
          oracleItem: oracleItem,
          user: provider.wallet.publicKey,
          feedAccount: feedAccount,
          chainlinkProgram: chainLinkProgramAccount
        })
        .rpc();
  
      const oracleItemData = await program.account.oracleItem.fetch(oracleItem);

      assert.ok(
        oracleItemData.authority.equals(oracleAuthAccount)
      );
    });
  });

  describe("#update_oracle()", async () => {
    it("updates an oracle account", async () => {

      const feedAccount = new anchor.web3.PublicKey("HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6");
      const chainLinkProgramAccount = new anchor.web3.PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny")
  
      await program
        .methods
        .updateOracle()
        .accounts({
          oracleItem: oracleItemAccount,
          oracleAuthorizer: oracleAuthAccount,
          user: provider.wallet.publicKey,
          feedAccount: feedAccount,
          chainlinkProgram: chainLinkProgramAccount
        })
        .rpc();
  
      const oracleItemData = await program.account.oracleItem.fetch(oracleItemAccount);

      // assert.ok(
      //   oracleItemData.authority.equals(oracleAuthorizer)
      // );
    });
  });
});
