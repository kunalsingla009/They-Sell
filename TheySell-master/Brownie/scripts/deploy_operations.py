from brownie import Operational, TheyCoin, config, network
from scripts.helpfulScripts import getAccount, fundWithLink
from web3 import Web3

def deploy_operations():
    account = getAccount()
    deploy_tx = Operational.deploy(
        {"from":account},
        publish_source=config["networks"][network.show_active()]["verify"])
    print(deploy_tx)


def add_goods(seller_address, name, token_amount, image_uri, description):
    account = getAccount()
    operationals = Operational[-1]
    tx_fund = fundWithLink(operationals, amount=config["networks"][network.show_active()]["fee"])
    tx_fund.wait(1)
    tx_add = operationals.addGoods(seller_address, name, token_amount, image_uri, description, {"from": account})
    tx_add.wait(1)
    print("The good will be added and displayed soon!")


def get_all_goods():
    operationals = Operational[-1]
    print("All goods are:\n")
    all_items = operationals.getAllGoods()
    for item in all_items:
        if item[0] != '0x0000000000000000000000000000000000000000':
            print(item)
            print("\n")


def get_good_by_seller(seller_address):
    operationals = Operational[-1]
    print(f"\nAll goods of seller {seller_address} are:\n")

    all_items = operationals.getGoodBySeller(seller_address)
    for item in all_items:
        if item[0] != '0x0000000000000000000000000000000000000000':
            print(item)
            print("\n")


def get_specific_good(index):
    operationals = Operational[-1]
    item = operationals.all_goods(index)
    return item


def delete_good(seller_address, index1, index2):
    account = getAccount()
    operationals = Operational[-1]
    if get_specific_good(index1)[0] != "0x0000000000000000000000000000000000000000":
        tx_delete = operationals.deleteGood(seller_address, index1, index2, {"from": account})
        tx_delete.wait(1)
        print("Deleted the specified good!")
    else:
        print("Item is already deleted")


def place_order(buyer_address, goods_ids):
    account = getAccount(from_key="from_key3")
    operationals = Operational[-1]
    our_coin = TheyCoin[-1]
    # To be performed on the frontend
    approve_tx = our_coin.approve(operationals, Web3.toWei(35, "ether"), {"from": account})
    approve_tx.wait(1)

    place_order_tx = operationals.placeOrder(our_coin, buyer_address, goods_ids, {"from": account})
    place_order_tx.wait(1)
    print("Placed the order!")


def is_delivered(order_id):
    account = getAccount()
    operationals = Operational[-1]

    delivered_tx = operationals.idDelivered(order_id, {"from": account})
    delivered_tx.wait(1)

    print("Good has been delivered")


def withdrawSeller(seller_address):
    account = getAccount()
    operationals = Operational[-1]
    our_coin = TheyCoin[-1]

    withdraw_tx = operationals.sellerWithdraw(our_coin, seller_address, {"from":account})
    withdraw_tx.wait(1)

    print("Money has been withrawn!!")


def main():

    # deploy_operations()

    # add_goods("", "Test good1", 10, "", "This is first test")

    # add_goods("", "Test good2", 15, "", "This is second test")

    # add_goods("", "Test good3", 20, "", "This is third test")

    # place_order("",[, ])

    # place_order("", [])

    # is_delivered(777)

    # is_delivered(778)

    # withdrawSeller("")

    # withdrawSeller("")

    # get_all_goods()

    # get_good_by_seller("")

    # delete_good("", 0, 0)

    # get_all_goods()

    # get_good_by_seller("")

    # get_good_by_seller("")