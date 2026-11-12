#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token,  Address, Env};

#[contract]
pub struct Wallet;

#[contracttype]
pub enum Datakey{
    Owner, 
    Agent,
    Token,
    Maxpay,
    Allowed(Address)
}


#[contractimpl]
impl Wallet {
    pub fn init(env: Env, owner: Address, agent:Address, token:Address, max_pay:i128) {
        owner.require_auth();  

        if env.storage().instance().has(&Datakey::Owner){
            panic!("already initialized")
        }
         env.storage().instance().set(&Datakey::Owner, &owner);
        env.storage().instance().set(&Datakey::Agent, &agent);
        env.storage().instance().set(&Datakey::Token, &token);
        env.storage().instance().set(&Datakey::Maxpay, &max_pay);
    
    }
    pub fn allow(env:Env, payee:Address){
        let owner:Address = env.storage().instance().get(&Datakey::Owner).unwrap();
        owner.require_auth();
        env.storage().persistent().set(&Datakey::Allowed(payee), &true)
    }
    pub fn is_allowed(env:Env, payee:Address) -> bool{
        env.storage().persistent().get(&Datakey::Allowed(payee)).unwrap_or(false)

    }

    pub fn pay(env:Env, payee:Address, amount:i128){
        let agent:Address = env.storage().instance().get(&Datakey::Agent).unwrap();
        agent.require_auth();

        if amount <=0{
            panic!("amount must be greater than 0")
        }
        let max:i128 = env.storage().instance().get(&Datakey::Maxpay).unwrap();

        if amount > max {
            panic!("over limit")
        }
        let allowed:bool = env.storage().persistent().get(&Datakey::Allowed(payee.clone())).unwrap_or(false);

        if !allowed{
            panic!("payee not allowed")
        }
        let token_addr:Address = env.storage().instance().get(&Datakey::Token).unwrap();
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&env.current_contract_address(), &payee, &amount);
    }
    pub fn set_limit(env:Env, new_max_pay:i128){
        let owner:Address = env.storage().instance().get(&Datakey::Owner).unwrap();
        owner.require_auth();

        env.storage().instance().set(&Datakey::Maxpay, &new_max_pay);

    }
    pub fn balance(env: Env) -> i128 {
    let token_addr: Address = env.storage().instance().get(&Datakey::Token).unwrap();
    let client = token::Client::new(&env, &token_addr);
    client.balance(&env.current_contract_address())
}

pub fn curr_max(env:Env, payee:Address) -> bool{
        env.storage().instance().get(&Datakey::Maxpay).unwrap()

    }
   
}

