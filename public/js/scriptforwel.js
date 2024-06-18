document.addEventListener('DOMContentLoaded', function() {
    const text = 'Welcome to RECA!';
    let i = 0;
    const speed = 100; // typing speed in milliseconds

    function typeWriter() {
        if (i < text.length) {
            document.querySelector('.typing-animation').innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();
});
