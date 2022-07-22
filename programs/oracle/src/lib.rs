use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod oracle {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;

        ctx.accounts.oracle_item.authority = *ctx.accounts.user.key;
        ctx.accounts.oracle_item.started_at = Some(timestamp);

        Ok(())
    }

    pub fn put(ctx: Context<PutCommand>, value: u32) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;

        ctx.accounts.oracle_item.value = Some(value);
        ctx.accounts.oracle_item.finished_at = Some(timestamp);

        Ok(())
    }
}


#[account]
#[derive(Default)]
pub struct OracleItem {
    pub id: i8,
    pub started_at: Option<i64>,
    pub finished_at: Option<i64>,
    pub authority: Pubkey,
    pub value: Option<u32>
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 1 + 9 + 9 + 32 + 5,
        seeds = [user.key().as_ref(), b"counter".as_ref()], 
        bump
    )]
    pub oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct PutCommand<'info> {
    #[account(
        mut,
        constraint = oracle_item.authority == *user.key,
        constraint = oracle_item.value == None
    )]
    pub oracle_item: Account<'info, OracleItem>,
    #[account(mut)]
    pub user: Signer<'info>,
}
