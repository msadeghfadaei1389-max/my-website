const cart = JSON.parse(
    localStorage.getItem("cart")
) || [];


const cartButton =
    document.getElementById("cartButton");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

const checkoutOverlay =
    document.getElementById("checkoutOverlay");

const closeCheckout =
    document.getElementById("closeCheckout");

const checkoutForm =
    document.getElementById("checkoutForm");

const toast =
    document.getElementById("toast");

const menuBtn =
    document.getElementById("menuBtn");

const navMenu =
    document.getElementById("navMenu");


// باز و بسته شدن منوی موبایل

menuBtn.addEventListener(
    "click",
    function () {

        navMenu.classList.toggle("active");

    }
);


// افزودن محصول به سبد

document
    .querySelectorAll(".add-to-cart")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.dataset.id;

                const name =
                    button.dataset.name;

                const price =
                    Number(
                        button.dataset.price
                    );


                const product =
                    cart.find(
                        function (item) {

                            return item.id === id;

                        }
                    );


                if (product) {

                    product.quantity++;

                } else {

                    cart.push({

                        id: id,

                        name: name,

                        price: price,

                        quantity: 1

                    });

                }


                saveCart();

                updateCart();

                showToast(
                    "محصول به سبد خرید اضافه شد 🛒"
                );

            }
        );

    });


// ذخیره سبد خرید

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// نمایش سبد

function updateCart() {

    cartItems.innerHTML = "";


    let count = 0;

    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <p class="empty-cart">

                سبد خرید شما خالی است.

            </p>

        `;

    }


    cart.forEach(
        function (item, index) {

            count += item.quantity;

            total +=
                item.price *
                item.quantity;


            const itemElement =
                document.createElement("div");


            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div>

                    <h4>
                        ${item.name}
                    </h4>

                    <div class="cart-item-price">

                        ${formatPrice(
                            item.price
                        )}

                        تومان

                    </div>


                    <div class="quantity-controls">

                        <button
                            class="increase"
                            data-index="${index}">

                            +

                        </button>


                        <span>

                            ${item.quantity}

                        </span>


                        <button
                            class="decrease"
                            data-index="${index}">

                            −

                        </button>

                    </div>

                </div>


                <button
                    class="remove-item"
                    data-index="${index}">

                    🗑️

                </button>

            `;


            cartItems.appendChild(
                itemElement
            );

        }
    );


    cartCount.textContent = count;


    cartTotal.textContent =

        formatPrice(total) +

        " تومان";


    saveCart();

}


// کلیک روی دکمه‌های داخل سبد

cartItems.addEventListener(
    "click",
    function (event) {


        const index =
            event.target.dataset.index;


        if (
            event.target.classList.contains(
                "increase"
            )
        ) {

            cart[index].quantity++;

        }


        if (
            event.target.classList.contains(
                "decrease"
            )
        ) {

            cart[index].quantity--;


            if (
                cart[index].quantity <= 0
            ) {

                cart.splice(
                    index,
                    1
                );

            }

        }


        if (
            event.target.classList.contains(
                "remove-item"
            )
        ) {

            cart.splice(
                index,
                1
            );

        }


        updateCart();

    }
);


// باز کردن سبد

cartButton.addEventListener(
    "click",
    function () {

        cartOverlay.classList.add(
            "active"
        );

    }
);


// بستن سبد

closeCart.addEventListener(
    "click",
    function () {

        cartOverlay.classList.remove(
            "active"
        );

    }
);


// بستن با کلیک روی پس‌زمینه

cartOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === cartOverlay
        ) {

            cartOverlay.classList.remove(
                "active"
            );

        }

    }
);


// رفتن به فرم سفارش

checkoutButton.addEventListener(
    "click",
    function () {

        if (
            cart.length === 0
        ) {

            showToast(
                "سبد خرید خالی است."
            );

            return;

        }


        cartOverlay.classList.remove(
            "active"
        );


        checkoutOverlay.classList.add(
            "active"
        );

    }
);


// بستن فرم سفارش

closeCheckout.addEventListener(
    "click",
    function () {

        checkoutOverlay.classList.remove(
            "active"
        );

    }
);


// ثبت سفارش

checkoutForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const customerName =
            document.getElementById(
                "customerName"
            ).value;


        const customerPhone =
            document.getElementById(
                "customerPhone"
            ).value;


        const total =

            cart.reduce(
                function (
                    sum,
                    item
                ) {

                    return (

                        sum +

                        item.price *

                        item.quantity

                    );

                },

                0
            );


        showToast(
            "سفارش شما با موفقیت ثبت شد! 🎉"
        );


        alert(

            "نام مشتری: " +

            customerName +

            "\nشماره تماس: " +

            customerPhone +

            "\nمبلغ سفارش: " +

            formatPrice(total) +

            " تومان"

        );


        // حذف سبد پس از ثبت سفارش

        cart.length = 0;


        saveCart();

        updateCart();


        checkoutForm.reset();


        checkoutOverlay.classList.remove(
            "active"
        );

    }
);


// فرمت قیمت

function formatPrice(number) {

    return new Intl.NumberFormat(
        "fa-IR"
    ).format(number);

}


// نمایش پیام

function showToast(message) {

    toast.textContent = message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },

        3000
    );

}


// راه‌اندازی اولیه

updateCart();