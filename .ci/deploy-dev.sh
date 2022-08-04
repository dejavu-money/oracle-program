#!/bin/bash
set -e

# default provider Devnet

export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export ANCHOR_WALLET='./id.json'

# Airdrop some sols to the wallet
solana airdrop 2 $(solana-keygen pubkey $ANCHOR_WALLET) --url https://api.devnet.solana.com && solana airdrop 2 $(solana-keygen pubkey $ANCHOR_WALLET) --url https://api.devnet.solana.com

# Build program
anchor build --provider.cluster devnet

# Copy binary to anchor
mkdir -p ./target/deploy/
cp ./program-keypair.json ./target/deploy/oracle-keypair.json
cp ./programs/oracle/target/deploy/oracle.so ./target/deploy/oracle.so

# deploy program to the Devnet

anchor deploy --provider.cluster devnet
