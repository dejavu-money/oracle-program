# Dejavu Oracle Program

## Tests
As we get the prices using the chainlink feeds, we must to run the tests on Devnet because the feed program is deployed there.

### How to prepare tests environment locally

first, you need to create the authority wallet for the program 
```bash
# run this command on the root folder
solana-keygen new -o id.json --no-passphrase
```

then, you have to create the program keypair

```bash
# run this command on the root folder
solana-keygen new -o program-keypair.json --no-passphrase
```

then, you have to put the program_id on `programs/oracle/src/lib.rs` 
```bash
# this command show the public address of your program-key-air
solana address -k program-keypair.json
```

```rust
declare_id!("YOUR_PROGRAM_ID");
```

and finally we run the tests using docker
```
docker build -f Dockerfile.ci -t oracle-ci  .
docker run oracle-ci sh ./.ci/tests.sh
```

## CI / CD

We have set up the CI/CD in this project using Github actions, we have a pipeline that updates the program_id automatically. 

For the pipeline to work, you have to put the value "YOUR_PROGRAM_ID" on declare_id! Macro otherwise, the pipeline will fail.

## Program

Devnet Program (Testing):
CXCE5fYFEuGShPKXGTYafxr3iChkBzgxCcAx1TABXJ1D (we use this address to run the integration tests)

Devnet program: 
BFGzZeqA47Kgxv7x1D1bZ7RENbjgV1FjrDd3z7Pse9Q4

Mainnet program: 
TODO

