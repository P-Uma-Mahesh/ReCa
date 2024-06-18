document.addEventListener('DOMContentLoaded', () => {
    const toggleOrdersButton = document.getElementById('toggle-orders');
    const toggleSoldButton = document.getElementById('toggle-sold');
    const orderedItems = document.getElementById('ordered-items');
    const soldItems = document.getElementById('sold-items');
  
    toggleOrdersButton.addEventListener('click', () => {
      toggleOrdersButton.classList.add('active');
      toggleSoldButton.classList.remove('active');
      orderedItems.classList.add('active');
      soldItems.classList.remove('active');
    });
  
    toggleSoldButton.addEventListener('click', () => {
      toggleOrdersButton.classList.remove('active');
      toggleSoldButton.classList.add('active');
      orderedItems.classList.remove('active');
      soldItems.classList.add('active');
    });
  });
  