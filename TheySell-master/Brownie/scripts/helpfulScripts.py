from brownie import network, accounts, config, Contract, LinkToken
from web3 import Web3

FORKED_LOCAL_ENVIRONMENTS = ["mainnet-fork", "mainnet-fork-dev"]
LOCAL_BLOCKCHAINS = ["development", "ganache-local"]


def getAccount(index=None, id=None, from_key="from_key1"):
    if index:
        return accounts[0]

    if id:
        return accounts.load(id)

    if network.show_active() in LOCAL_BLOCKCHAINS or network.show_active() in FORKED_LOCAL_ENVIRONMENTS:
        return accounts[0]

    return accounts.add(config["wallets"][from_key])


contract_to_mock = {
    "link_token": LinkToken,
}


def getContract(contract_name):
    '''
    This function will grab the contract address from the brownie config if defined, otherwise it will 
    deploy a mock version of the contract, and return the mock contract

        Args:
            contract_name(string)

        Returns:
            brownie.network.contract.ProjectContract: The most recently deployed version of this contract.
    '''
    contract_type = contract_to_mock[contract_name]

    if network.show_active() in LOCAL_BLOCKCHAINS:
        if len(contract_type) <= 0:
            deployMocks()
        contract = contract_type[-1]
    else:
        contract_address = config["networks"][network.show_active()][contract_name]
        contract = Contract.from_abi(contract_type._name, contract_address, contract_type.abi)

    return contract


def deployMocks():
    print(f"Active network is {network.show_active()}")
    print("Deploying mocks..")

    account = getAccount()

    # Here we deploy the mock only when no mock is deployed previously

    link_token = LinkToken.deploy({"from": account})

    # VRFCoordinatorMock.deploy(link_token.address, {"from": account})

    print("Mocks Deployed")


def fundWithLink(contract_address, account=None, link_token=None, amount=Web3.toWei(1, "ether")):
    account = account if account else getAccount()
    link_token = link_token if link_token else getContract("link_token")
    tx = link_token.transfer(contract_address, amount, {"from": account})
    tx.wait(1)
    print(f"Funded contract! {contract_address}")
    return tx
