from brownie import TheyCoin, config, network
from scripts.helpfulScripts import getAccount
from web3 import Web3
import requests
from scripts.helpfulScripts import fundWithLink


def deploy_token():
    account = getAccount()
    initial_supply = Web3.toWei("10000", "ether")
    our_token = TheyCoin.deploy(initial_supply, {"from": account}, publish_source=config["networks"][network.show_active()]["verify"])
    print(our_token)


def transfer_to_user(user_address, amount):
    res = requests.get("https://min-api.cryptocompare.com/data/price?fsym=INR&tsyms=ETH").json()
    inr_to_eth = res["ETH"] * amount
    account = getAccount()
    our_token = TheyCoin[-1]
    tx_fund = fundWithLink(our_token, amount=Web3.toWei(0.01, "ether"))
    tx_fund.wait(1)
    tx = our_token.payUser(our_token, user_address, {"from": account, "value": Web3.toWei(inr_to_eth, "ether")})
    tx.wait(1)
    print("Transfer has been made!")
    print("Tokens will be sent soon!")


def main():
    deploy_token()

    transfer_to_user("", 500)