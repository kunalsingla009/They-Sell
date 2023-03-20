const web = new Web3("https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b")
token_contract_details = JSON.parse(localStorage.getItem("token_contract"))
operations_contract_details = JSON.parse(localStorage.getItem("operations_contract"))
var token_contract = new web.eth.Contract(token_contract_details[0], token_contract_details[1])
var operations_contract = new web.eth.Contract(operations_contract_details[0], operations_contract_details[1])
var current_user_account = ""
var good_ids = ""

window.addEventListener('load', async () => {

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            current_user_account = accounts[0]
            $("#seller_address").val(current_user_account)
        } catch (error) {
            if (error.code === 4001) {
                // User rejected request
            }

            setError(error);
        }
        window.ethereum.on('accountsChanged', (accounts) => {
            current_user_account = accounts[0]
            $("#seller_address").val(current_user_account)
        });

    } else {
        window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
    }
})



if (localStorage.getItem('cart') == null) {
    var cart = {};
} else {
    cart = JSON.parse(localStorage.getItem('cart'));
}
var sum = 0;
for (var item in cart) {
    if (cart[item][0] == 0) {
        delete cart[item];
    }
    else {
        sum = sum + cart[item][0];
    }
}
localStorage.setItem('cart', JSON.stringify(cart));
document.getElementById('num_element').innerHTML = sum;


var totprice = 0
var finalprice = 0
if ($.isEmptyObject(cart)) {
    alert("Your cart is empty,please add some items to your cart before checking out!")
    document.location = '/shop';
} else {
    for (item in cart) {
        let name = cart[item][1];
        let qty = cart[item][0];
        let price = cart[item][2];
        totprice = qty * price;
        finalprice = finalprice + totprice;
        mystr = `<li class="list-group-item d-flex justify-content-between lh-condensed">
            <div>
                <h6 style="color: #782E9A" class="my-0">${name}</h6>
                <small style="color: #F9A926">Quantity:${qty}</small>
            </div>
            <span style="color: #F9A926">${totprice}</span>
        </li>`
        $('#items').append(mystr);
    }
    mystr = `<li class="list-group-item d-flex justify-content-between">
        <span style="color: #782E9A">Total (They Coin)</span>
        <strong style="color: #F9A926">AC <span id='totalPrice'>${finalprice}</span></strong>
    </li>`;
    $('#items').append(mystr);
}
$('#itemsJson').val(JSON.stringify(cart));


function saveOrderToDatabase(hash, good_ids) {
    document.getElementById("loader_container").hidden = false
    document.getElementById("main_container").hidden = true
    $("#loader_text").text("Paying")
    web.eth.getTransactionReceipt(hash, async function (err, receipt) {
        if (err) {
            console.log(err)
        }

        if (receipt !== null) {
            try {
                good_ids = Object.keys(cart).map(function (v) { return v.slice(2) })
                document.getElementById("loader_container").hidden = true
                document.getElementById("main_container").hidden = false
                latest_order_id = operations_contract.methods.getLatestOrder(current_user_account).call()
                console.log("latest order id: ", await latest_order_id)
                json_cart = JSON.stringify(cart)
                $("#order_id").val(await latest_order_id)
                $('#itemsJson').val(json_cart);
                $('#itemsJson').val(json_cart);
                $('#item_ids').val(JSON.stringify(good_ids));
                $('#buyer_address').val(current_user_account);
                $('#seller_address').val(localStorage.getItem("seller_in_cart"));
                $('#amount').val($('#totalPrice').html());
                await latest_order_id
                var form_data = $("#checkout_form")

                $.ajax({
                    type: form_data.attr('method'),
                    url: form_data.attr('action'),
                    data: form_data.serialize(),
                    success: function (data) {
                        alert("Order place with order id: "  + data.order_id)
                        window.location = "/shop/"
                    },
                });

            } catch (e) {
                console.log(e)
            }
            console.log("Placed order")
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                saveOrderToDatabase(hash);
            }, 1000);
        }
    });
}


function payForOrder(hash, good_ids) {
    document.getElementById("loader_container").hidden = false
    document.getElementById("main_container").hidden = true
    $("#loader_text").text("Approving")
    web.eth.getTransactionReceipt(hash, async function (err, receipt) {
        if (err) {
            console.log(err)
        }

        if (receipt !== null) {
            try {``
                good_ids = Object.keys(cart).map(function (v) { return v.slice(2) })
                good_qtys = Object.values(cart).map(function (v) { return v[0] })
                transaction2 = operations_contract.methods.placeOrder(token_contract_details[1], current_user_account, good_ids, good_qtys, JSON.stringify(good_ids), JSON.stringify(good_qtys))
                tx2 = await send(transaction2)
                saveOrderToDatabase(tx2.toString(), good_ids)
            } catch (e) {
                console.log(e)
            }
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                payForOrder(hash, good_ids);
            }, 1000);
        }
    });
}


async function send(transaction, value = 0) {
    const params = [{
        from: current_user_account,
        to: transaction._parent._address,
        data: transaction.encodeABI(),
        gas: web.utils.toHex(1000000),
        gasPrice: web.utils.toHex(10e10),
        value: web.utils.toHex(value)
    },]

    sending_tx = window.ethereum.request({
        method: 'eth_sendTransaction',
        params,
    })

    await sending_tx;
    return await sending_tx
}


$("#checkout_form").submit(async function (e) {
    e.preventDefault();
    good_ids = Object.keys(cart).map(function (v) { return v.slice(2) })
    confirmed_total = 0
    let promises = [];
    for (const item_id of good_ids) {
        amount = operations_contract.methods.id_to_good(item_id).call()
        promises.push(amount)
        amount = JSON.parse(JSON.stringify(await amount))["token_amount"]
        confirmed_total = confirmed_total + (await amount * cart["pr" + item_id][0])
    }
    const results = await Promise.all(promises);
    confirmed_total = await confirmed_total.toString()
    transaction1 = token_contract.methods.approve(operations_contract_details[1], confirmed_total)
    tx = await send(transaction1)
    payForOrder(tx.toString(), good_ids)
})