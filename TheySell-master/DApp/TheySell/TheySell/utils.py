import os
import requests
from web3.middleware import geth_poa_middleware
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

infura_url = "https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b"

web = Web3(Web3.HTTPProvider(infura_url))
web.middleware_onion.inject(geth_poa_middleware, layer=0)

web.eth.default_account = web.eth.account.privateKeyToAccount(os.getenv("PRIVATE_KEY")).address

# Operations
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}

operations_abi = requests.get("https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0x7A4Ac61702820B44048099425b9Ac37a0931C06b&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG", headers=headers).json()['result']

operations_address = "0x7A4Ac61702820B44048099425b9Ac37a0931C06b"

operations_contract = web.eth.contract(abi=operations_abi, address=operations_address)

# Token
token_address = "0x7Dd436Fb09aa3946ab85074308055c62733aEb64"


def upload_to_ipfs(_image):
    ipfs_url = "http://127.0.0.1:5001"
    end_point = "/api/v0/add"

    # upload
    response = requests.post(ipfs_url + end_point, files={"file": _image})
    ipfs_hash = response.json()["Hash"]
    image_uri = f"https://ipfs.io/ipfs/{ipfs_hash}?filename={_image}"
    print(image_uri)
    return image_uri


def final_is_delivered(order_id):
    is_already_payed = operations_contract.functions.id_to_order(order_id).call()[-1]
    if not is_already_payed:
        nonce = web.eth.get_transaction_count(web.toChecksumAddress(web.eth.default_account))
        deliver_tx = operations_contract.functions.idDelivered(order_id).buildTransaction({
                'chainId': 4,
                'gas': 700000,
                'maxFeePerGas': web.toWei('2', 'gwei'),
                'maxPriorityFeePerGas': web.toWei('1', 'gwei'),
                'nonce': nonce,
                })
        signed_tx = web.eth.account.sign_transaction(deliver_tx, private_key=os.getenv("PRIVATE_KEY"))
        receipt = web.eth.send_raw_transaction(signed_tx.rawTransaction)
        web.eth.wait_for_transaction_receipt(receipt)
    print("Order marked as delivered!")
