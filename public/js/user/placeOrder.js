
const placeCODorder = document.getElementById('codOrderPlacement');

const orderId = placeCODorder.getAttribute('order-id');

placeCODorder.addEventListener('click', (e) => {
    
    fetch('/placeOrder/cod', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({ orderId: orderId }),
    })
        .then(response => response.json())
        .catch(error => {

            notificationMessage.hidden = false;

            messageLine.classList.add('red');

            messageLine.innerText = 'Failed  due to network/serverError';

            window.scrollTo(0, 0)


            setTimeout(() => {

                notificationMessage.hidden = true;
                messageLine.classList.remove('red');
            }, 3000)

            console.error('Error:', error);
        })
        .then(data => {

            if (data.success) {

                console.log('success')

                notificationMessage.hidden = false;

                messageLine.classList.add('green');

                messageLine.innerText = data.message;

                window.scrollTo(0, 0)


                setTimeout(() => {

                    notificationMessage.hidden = true;
                    messageLine.classList.remove('green');

                    window.location.href = '/orders'
                }, 3000)





            } else {



                notificationMessage.hidden = false;

                messageLine.classList.add('red');

                messageLine.innerText = data.message;

                window.scrollTo(0, 0)


                setTimeout(() => {

                    notificationMessage.hidden = true;
                    messageLine.classList.remove('red');
                }, 3000)
            }
        })
        .catch(error => {

            // Handle network or other errors here
            console.error('Error:', error);
            console.log(error);
        });





})