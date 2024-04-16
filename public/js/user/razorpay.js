const payBtn = document.getElementById('payButton');

const orderID = payBtn.getAttribute('order-id').trim();
payBtn.addEventListener('click', function () {


    fetch('/razorPay/createOrder/' + orderID, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {

            if (!data.success) {


                notificationMessage.hidden = false;

                messageLine.classList.add('red');

                messageLine.innerText = data.message;

                window.scrollTo(0, 0)


                setTimeout(() => {

                    notificationMessage.hidden = true;
                    messageLine.classList.remove('red');
                }, 3000);

                return
            }

            var options = {
                key: 'rzp_test_z0qARFiG7IOgrd',
                amount: data.order.amount,
                currency: 'INR',
                order_id: data.order.id,
                handler: function (response) {
                    if (response.razorpay_payment_id) {
                        // Payment success
                        alert('Payment successfully done');

                        // Send a success request to your server.
                        fetch('/razorPay/payment-success', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data.order),
                        })
                            .then(successResponse => successResponse.json())
                            .then(successData => {

                                if (successData.success) {

                                    notificationMessage.hidden = false;

                                    messageLine.classList.add('green');

                                    messageLine.innerText = successData.message;

                                    window.scrollTo(0, 0)


                                    setTimeout(() => {

                                        notificationMessage.hidden = true;
                                        messageLine.classList.remove('green');


                                    }, 3000);
                                    alert('check sucess razerpay')
                                        window.location.href = '/orders'

                                    
                                    return

                                } else {
                                    notificationMessage.hidden = false;

                                    messageLine.classList.add('red');

                                    messageLine.innerText = successData.message;

                                    window.scrollTo(0, 0)


                                    setTimeout(() => {

                                        notificationMessage.hidden = true;
                                        messageLine.classList.remove('red');
                                    }, 3000);

                                    return

                                }

                            })
                            .catch(successError => {
                                console.error('Error notifying server of payment success:', successError);
                            });
                    } else {
                        // Payment failure
                        alert('Payment failed');
                    }
                },
            };

            var rzp = new Razorpay(options);
            rzp.open();
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
        });
});
