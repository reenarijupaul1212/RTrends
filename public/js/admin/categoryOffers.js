//document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to handle button clicks
    document.querySelectorAll('.deactive').forEach(button => {
        button.addEventListener('click', (event) => {
            const categoryID = event.target.getAttribute('data');
            console.log('Clicked Deactivate for Category ID:', categoryID);

            const data = { categoryID };
            const currentURL = window.location.origin;

            fetch(currentURL + '/admin/categoryOffer/deactivate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (response.redirected) {
                    // Redirect to the URL received in the response
                    window.location.href = response.url;
                } else if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                } else {
                    // Continue processing the response, if needed
                    return response.json();
                }
            })
            .then(data => {
                // Handle the JSON response data, if needed
                console.log('Response JSON:', data);
            })
            .catch(error => {
                // Handle fetch errors and show notifications
                console.error('Fetch Error:', error);

                // Example: Show a notification message
                const notificationMessage = document.getElementById('notificationMessage');
                const messageLine = document.getElementById('messageLine');

                notificationMessage.hidden = false;
                messageLine.classList.add('red');
                messageLine.innerText = 'Failed due to network/server error';
                window.scrollTo(0, 0);

                setTimeout(() => {
                    notificationMessage.hidden = true;
                    messageLine.classList.remove('red');
                }, 3000);
            });
        });
    });
//});
