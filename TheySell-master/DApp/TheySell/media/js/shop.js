var current_user_account = ""
var token_contract = ""
var operations_contract = ""
const address_token_contract = "0x7Dd436Fb09aa3946ab85074308055c62733aEb64"
const address_sell_operations = "0x7A4Ac61702820B44048099425b9Ac37a0931C06b"

const web = new Web3("https://rinkeby.infura.io/v3/384b2420ae804f5ca4b5d6aa630f3c7b")


$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0x7Dd436Fb09aa3946ab85074308055c62733aEb64&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        token_contract = new web.eth.Contract(JSON.parse(data.result), address_token_contract)
        localStorage.setItem('token_contract', JSON.stringify([JSON.parse(data.result), address_token_contract]))
    }
});

$.ajax({
    url: "https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=0x7A4Ac61702820B44048099425b9Ac37a0931C06b&apikey=39MRYT8W4D35AH26BJZVGQ1KK19SR5XWXG",
    dataType: "json",
    success: function (data) {
        operations_contract = new web.eth.Contract(JSON.parse(data.result), address_sell_operations)
        getAllGoods()
        localStorage.setItem('operations_contract', JSON.stringify([JSON.parse(data.result), address_sell_operations]))
    }
});


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

async function getAllGoods(){

    all_sellers = await operations_contract.methods.getAllSellers().call()
    seller_to_goods = {};
    all_prods = []

    for (let index = 0; index < all_sellers.length; index++) {
        seller_to_goods[all_sellers[index]] = await operations_contract.methods.getGoodBySeller(all_sellers[index]).call()
    }
    for(let seller_index=0; seller_index < all_sellers.length; seller_index++){
        $("#shopping_container").append(`
            <h1 style="font-weight: 900;font-size:30px;color: #23211f;font-family: 'Open Sans Condensed';padding-top:30px;color: #782E9A">Seller Id: ${all_sellers[seller_index]}</h1>
        `)

        var $carousel_slide = $(`<div id="demo${seller_index}" class="col carousel slide my-3" data-ride="carousel"></div>`)

        var $indicator_list = $(`<ul class="carousel-indicators"></ul>`)

        $indicator_list.append(`<li data-target="#demo${seller_index}" data-slide-to="0" class="active"></li>`)

        var n = seller_to_goods[all_sellers[seller_index]].length
        var nSlides = (n / 4) + Math.ceil((n / 4) - (n / 4))

        for (let range_index = 1; range_index < nSlides; range_index++) {
            $indicator_list.append(`<li data-target="#demo${seller_index}" data-slide-to="${range_index}"></li>`)
        }

        $carousel_slide.append($indicator_list)

        $carousel_inner = $(`<div class="container carousel-inner no-padding"></div>`)

        $carousel_item = $(`<div class="carousel-item active"></div>`)

        for (let goods_index = 0; goods_index < seller_to_goods[all_sellers[seller_index]].length; goods_index++) {
            curr_good = seller_to_goods[all_sellers[seller_index]][goods_index]
            $carousel_item.append(`
            <div class="col-xs-3 col-sm-3 col-md-3" id="card_main">
                <div class="card align-items-center" style="width: 18rem;text-align: center;border:1px solid #F4EEA9">
                    <img id="imagepr${curr_good["id"]}" src='${curr_good["image_uri"]}' class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 style="font-weight: 900;text-transform: uppercase;font-size:30px;color: #782E9A;font-family: 'Open Sans Condensed';" class="card-title" id="namepr${curr_good["id"]}">${curr_good["name"]}</h5>
                        <p id="sellerpr${curr_good["id"]}" hidden>${curr_good["good_owner"]}</p>
                        <p style="font-family: 'Open Sans Condensed';font-size: 17px;opacity: 0.8;color:#F9A926" class="card-text">${curr_good["description"]}</p>
                        <h6 class="card-text" style="font-weight: 800;color: #782E9A"><span id="pricepr${curr_good["id"]}"> ${curr_good["token_amount"] / (10**18)}</span> AC</h6>
                        <span id="divpr${curr_good["id"]}" class="divpr">
                            <button id="pr${curr_good["id"]}" onclick="addtoCart(this.id)" class="btn cart" style="background-color:#F9A926;color:white">Add to cart</button></span>
                    </div>
                </div>
            </div>
            `)

            if(goods_index > 0 && goods_index % 4 == 0 && goods_index != seller_to_goods[all_sellers[seller_index]].length){
                $carousel_inner.append($carousel_item)
                $carousel_item = $(`<div class="carousel-item"></div>`)
            }
            
        }

        $carousel_inner.append($carousel_item)

        $carousel_slide.append($carousel_inner)
        
        $container_row = $(`<div class="row"></div>`).append($carousel_slide)

        $("#shopping_container").append($container_row)

    };
    if (localStorage.getItem('cart') == null) {
        localStorage.setItem("seller_in_cart", "")
        var cart = {};
    } else {
        cart = JSON.parse(localStorage.getItem('cart'));
        is_start = 2;
        updateCart(cart);
    }
    for (var item in cart) {
        localStorage.setItem("seller_in_cart", cart[item][4])
        document.getElementById('div' + item).innerHTML = `<button id="A${item}" class="btn cart" style="background-color:#F9A926;color:white" disabled>Added to cart</button>`;
    }
    updatePopover(cart);
}