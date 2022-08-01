use anchor_lang::prelude::*;

declare_id!("3mDomzG84KDcBkoVgekMc8p8LR86nCQeyDAPPjjKKxec");
const ONE_HOUR_TO_SECONDS: i64 = 1 * 60 * 60;

#[program]
pub mod oracle {
    use super::*;

    pub fn create_oracle(ctx: Context<CreateOracle>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        ctx.accounts.oracle_item.authority = ctx.accounts.oracle_authorizer.key();
        ctx.accounts.oracle_item.started_at = timestamp;
        ctx.accounts.oracle_item.closed_at = timestamp + ONE_HOUR_TO_SECONDS;
        // ctx.accounts.
        // ctx.accounts.oracle_item

        // OracleItem.try_from_slice();
        // ctx.accounts.feed_account.data
        // ctx.accounts.oracle_item
        // ctx.remaining_accounts[0].owner;
        // ctx.accounts

        Ok(())
    }

    pub fn create_authorizer(ctx: Context<CreateAuthorizer>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        ctx.accounts.oracle_authorizer.authority = *ctx.accounts.user.key;
        ctx.accounts.oracle_authorizer.created_at = timestamp;

        Ok(())
    }

    pub fn update_oracle(ctx: Context<UpdateOracle>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        ctx.accounts.oracle_item.value = Some(0);
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
    created_at: i64 // 8
}

#[account]
pub struct OracleItem {
    authority: Pubkey, // 32
    chainlink_feed: Pubkey, // 32
    started_at: i64, // 8
    closed_at: i64, // 8
    finished_at: Option<i64>, // 8
    value: Option<u32> // 4
}

#[derive(Accounts)]
pub struct CreateAuthorizer<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 8,
        seeds = [user.key().as_ref()], 
        bump
    )]
    oracle_authorizer: Account<'info, OracleAuthorizer>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CreateOracle<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 32 + 8 + 8 + 8 + 4,
        seeds = [user.key().as_ref(), b"counter".as_ref()], 
        bump,
        constraint = oracle_authorizer.authority == *user.key
    )]
    oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
    oracle_authorizer: Account<'info, OracleAuthorizer>,
    /// CHECK: Todo
    feed_account: UncheckedAccount<'info>
}


#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(
        mut,
        constraint = oracle_item.authority == *user.key,
        constraint = oracle_item.value == None
    )]
    oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    user: Signer<'info>,
}
