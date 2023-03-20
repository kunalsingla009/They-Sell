// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Operational is Ownable {
    uint256 public fee;
    bytes32 public keyhash;
    uint256 private order_counter = 778;
    uint256 private goods_counter = 777;

    struct Goods {
        address good_owner;
        uint256 id;
        string name;
        uint256 token_amount;
        string image_uri;
        string description;
        uint256 index_all_goods;
        uint256 index_seller_goods;
    }

    struct Order {
        uint256 order_id;
        address seller_address;
        address buyer_address;
        uint256[] goods_ids;
        uint256 total_bill;
        bool isDelivered;
    }

    Goods[] public all_goods;

    mapping(address => Goods[]) public seller_to_goods;
    mapping(uint256 => Goods) public id_to_good;
    mapping(uint256 => Order) public id_to_order;
    //TODO: remove public and make a function that uses msg.sender
    mapping(address => uint256[]) public buyer_to_orders;
    mapping(address => uint256[]) public seller_to_orders;
    mapping(address => uint256) public seller_to_amount_payable;

    constructor(){}

    function addGoods(
        address _seller_address,
        string memory _name,
        uint256 _token_amount,
        string memory _image_uri,
        string memory _description
    ) public {
        Goods memory new_good = Goods(
            _seller_address,
            goods_counter,
            _name,
            _token_amount,
            _image_uri,
            _description,
            all_goods.length,
            seller_to_goods[_seller_address].length
        );
        id_to_good[goods_counter] = new_good;
        seller_to_goods[new_good.good_owner].push(new_good);
        all_goods.push(new_good);
        goods_counter ++;
    }

    function getAllGoods() public view returns (Goods[] memory) {
        return all_goods;
    }

    function getGoodBySeller(address _seller_address)
        public
        view
        returns (Goods[] memory)
    {
        return seller_to_goods[_seller_address];
    }

    function deleteGood(
        address _seller_address,
        uint256 index1,
        uint256 index2
    ) public onlyOwner {
        require(index1 < all_goods.length, "Index doesn't exists");
        require(
            index2 < seller_to_goods[_seller_address].length,
            "Index doesn't exists"
        );
        delete all_goods[index1];
        delete id_to_good[seller_to_goods[_seller_address][index2].id];
        delete seller_to_goods[_seller_address][index2];
    }

    function placeOrder(
        address _our_token,
        address _buyer_address,
        uint256[] memory _goods_ids
    ) public returns (uint256) {
        IERC20 our_token = IERC20(_our_token);

        uint256 _total_amount = 0;
        address _seller_address = id_to_good[_goods_ids[0]].good_owner;

        for (uint256 index = 0; index < _goods_ids.length; index++) {
            _total_amount += id_to_good[_goods_ids[index]].token_amount;
        }

        require(
            our_token.allowance(_buyer_address, address(this)) >=
                _total_amount,
            "Allowance is not enought"
        );

        require(
            our_token.transferFrom(
                _buyer_address,
                address(this),
                _total_amount
            ),
            "Something went wrong!"
        );

        Order memory new_order = Order(
            order_counter,
            _seller_address,
            _buyer_address,
            _goods_ids,
            _total_amount,
            false
        );

        id_to_order[order_counter] = new_order;
        buyer_to_orders[_buyer_address].push(order_counter);

        seller_to_orders[_seller_address].push(order_counter);

        order_counter++;
    }

    function idDelivered(uint256 _order_id) public onlyOwner {
        id_to_order[_order_id].isDelivered = true;
        seller_to_amount_payable[id_to_order[_order_id].seller_address] += id_to_order[_order_id].total_bill;
    }

    function sellerWithdraw(address _our_token, address seller_address)
        public
        onlyOwner
    {
        IERC20 our_token = IERC20(_our_token);
        require(
            our_token.transfer(
                seller_address,
                seller_to_amount_payable[seller_address]
            ),
            "Failed to transfer"
        );
        seller_to_amount_payable[seller_address] = 0;
    }
}
