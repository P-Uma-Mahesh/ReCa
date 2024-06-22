
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Assuming you have some cart data and total amount calculated


async function handleCheckout() {
    let totalAmount =document.querySelector("#totalAmount");

    const userId = getCookie('uid');
    if (!userId) {
        alert('User not logged in');
        return;
    }

    const response = await fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: totalAmount.value, // Ensure this value is available in scope
            currency: 'INR',
            receipt: `receipt_${new Date().getTime()}`,
        }),
    });

    const order = await response.json();

    const options = {
        key: 'rzp_live_1j2EriedZMsgq4', // Use the correct key from Razorpay dashboard
        amount: order.amount,
        currency: order.currency,
        name: 'RECA',
        description: 'Test Transaction',
        order_id: order.id,
        handler: async function (response) {
            console.log("function is working");
            const verifyResponse = await fetch('/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: response.razorpay_order_id,
                    payment_id: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    userId: userId,
                }),
            });

            const verifyResult = await verifyResponse.json();
            console.log(verifyResult);
            if (verifyResult.success) {
                alert('Payment successful and order created');
            } else {
                alert('Payment verification failed');
            }
        },
    };

    const rzp = new Razorpay(options);
    rzp.open();
}
