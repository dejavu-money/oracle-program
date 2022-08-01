import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Oracle } from "../target/types/oracle";
import { assert } from "chai";
// import { BN } from "bn.js";

describe("oracle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Oracle as Program<Oracle>;

  describe("#create_authorizer()", async () => {
    it("create an authorizer account", async () => {
      console.log('address: ');
      console.log(program.programId.toString());

      const [oracleAuthorizer] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      await program
        .methods
        .createAuthorizer()
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
      const [oracleAuthorizer] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      const [oracleItem] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from('counter')],
        program.programId
      );
  
      await program
        .methods
        .createOracle()
        .accounts({
          oracleAuthorizer: oracleAuthorizer,
          oracleItem: oracleItem,
          user: provider.wallet.publicKey,
          feedAccount: oracleItem
        })
        .rpc();
  
      const oracleItemData = await program.account.oracleItem.fetch(oracleItem);
  
      assert.ok(
        oracleItemData.authority.equals(oracleAuthorizer)
      );

    });
  });
});
