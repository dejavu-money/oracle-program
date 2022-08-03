use anchor_lang::prelude::*;
use chainlink_solana as chainlink;

declare_id!("3mDomzG84KDcBkoVgekMc8p8LR86nCQeyDAPPjjKKxec");

#[account]
pub struct Decimal {
    pub value: i128,
    pub decimals: u32,
}

#[program]
pub mod oracle {
    use super::*;

    pub fn create_oracle(ctx: Context<CreateOracle>, _oracle_id: i64) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        ctx.accounts.oracle_item.authority = ctx.accounts.oracle_authorizer.key();
        ctx.accounts.oracle_item.started_at = timestamp;
        ctx.accounts.oracle_item.closed_at = timestamp + ctx.accounts.oracle_authorizer.closed_seconds;

        // get decimal value from chainlink program
        let decimals = chainlink::decimals(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.feed_account.to_account_info()
        )?;

         // get round value from chainlink program
        let round = chainlink::latest_round_data(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.feed_account.to_account_info()
        )?;

        ctx.accounts.oracle_item.decimals = decimals;
        ctx.accounts.oracle_item.round = round.answer;

        Ok(())
    }

    pub fn create_authorizer(ctx: Context<CreateAuthorizer>, _auth_id: i64, closed_seconds: i64) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        ctx.accounts.oracle_authorizer.authority = *ctx.accounts.user.key;
        ctx.accounts.oracle_authorizer.created_at = timestamp;
        ctx.accounts.oracle_authorizer.closed_seconds = closed_seconds;

        Ok(())
    }

    pub fn update_oracle(ctx: Context<UpdateOracle>) -> Result<()> {
        let oracle_item = &ctx.accounts.oracle_item;
        let timestamp = Clock::get()?.unix_timestamp;

        if oracle_item.finished_at != None {
            return err!(Errors::OracleExpired);   
        }

        if oracle_item.closed_at > timestamp {
            return err!(Errors::TimeInvalid);   
        }

         // get decimal value from chainlink program
        let decimals = chainlink::decimals(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.feed_account.to_account_info()
        )?;
         // get round value from chainlink program
        let round = chainlink::latest_round_data(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.feed_account.to_account_info()
        )?;

        ctx.accounts.oracle_item.decimals = decimals;
        ctx.accounts.oracle_item.round = round.answer;
        ctx.accounts.oracle_item.finished_at = Some(timestamp);


        Ok(())
    }
}


#[account]
pub struct FeedItem {
}

#[account]
pub struct OracleAuthorizer {
    authority: Pubkey, // 32
    created_at: i64, // 8
    closed_seconds: i64 // 8
}

#[account]
pub struct OracleItem {
    authority: Pubkey, // 32
    chainlink_feed: Pubkey, // 32
    started_at: i64, // 8
    closed_at: i64, // 8
    finished_at: Option<i64>, // 8
    decimals: u8,
    round: i128
}

#[derive(Accounts)]
#[instruction(auth_id: i64)]
pub struct CreateAuthorizer<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 8 + 8,
        seeds = [user.key().as_ref(), format!("id-{}", auth_id).as_bytes().as_ref()], 
        bump
    )]
    oracle_authorizer: Account<'info, OracleAuthorizer>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(oracle_id: i64)]
pub struct CreateOracle<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 16,
        seeds = [user.key().as_ref(), format!("id-{}", oracle_id).as_bytes().as_ref()], 
        bump,
        constraint = oracle_authorizer.authority == *user.key
    )]
    oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
    oracle_authorizer: Account<'info, OracleAuthorizer>,
    /// CHECK: Todo
    feed_account: UncheckedAccount<'info>,
    /// CHECK: This is the Chainlink program library
    pub chainlink_program: AccountInfo<'info>
}


#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(
        mut,
        constraint = oracle_item.authority == *user.key
    )]
    oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    user: Signer<'info>,
    /// CHECK: Todo
    feed_account: UncheckedAccount<'info>,
    /// CHECK: This is the Chainlink program library
    pub chainlink_program: AccountInfo<'info>
}

// errors

#[error_code]
pub enum Errors {
    #[msg("the current timestamp should be greater than closed_at")]
    TimeInvalid,
    #[msg("Oracle expired")]
    OracleExpired
}
