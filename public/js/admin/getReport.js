const getBtn = document.getElementById('getReport');

const getExcelBtn = document.getElementById('getExcelBtn');

const getPDFBtn = document.getElementById('getPDF');

const startingDateInput = document.getElementById('startingDate');
const endingDateInput = document.getElementById('endingDate');

getBtn.addEventListener('click', (e) => {

    const startingDate = startingDateInput.value;
    const endingDate = endingDateInput.value;

alert('hai get report');
    console.log(startingDate, endingDate);

    url = window.location.pathname;

    window.location.href = url + `?startingDate=${startingDate}&endingDate=${endingDate}`;
});


getExcelBtn.addEventListener('click', (e) => {

    const startingDate = startingDateInput.value;
    const endingDate = endingDateInput.value;


    console.log(startingDate, endingDate);

    url = window.location.pathname;

    window.location.href = url + `/excel?startingDate=${startingDate}&endingDate=${endingDate}`;
});



getPDFBtn.addEventListener('click', (e) => {
    const startingDate = startingDateInput.value;
    const endingDate = endingDateInput.value;

    console.log('Starting Date:', startingDate);
    console.log('Ending Date:', endingDate);

    const url = window.location.pathname;
    const downloadURL = `${url}/pdf/download?startingDate=${startingDate}&endingDate=${endingDate}`;
alert('hai psd');
    console.log('Download URL:', downloadURL);

    window.location.href = downloadURL;
});