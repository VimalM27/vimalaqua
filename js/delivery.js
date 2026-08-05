// Vimal Farms - Delivery Date Estimator (rule-based, no courier API yet)
// This gives customers a rough estimate. When you connect a courier/tracking
// app (Shipway, Track123, etc.) later, replace estimateDeliveryDays() with
// a real API call to get accurate zone-based transit times.

document.addEventListener('DOMContentLoaded', function () {
  function estimateDeliveryDays(pincode) {
    const firstDigit = pincode.charAt(0);
    // Tamil Nadu pincodes mostly start with 6 - fastest (local)
    if (firstDigit === '6') return 2;
    // Neighbouring south Indian states
    if (['5', '7'].includes(firstDigit)) return 4;
    // Rest of India
    return 6;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  document.querySelectorAll('.product-card').forEach(card => {
    const wrapper = document.createElement('div');
    wrapper.className = 'delivery-check';
    wrapper.innerHTML = `
      <input type="text" maxlength="6" placeholder="Enter Pincode" class="pincode-input" inputmode="numeric">
      <button type="button" class="check-delivery-btn">Check Delivery</button>
      <p class="delivery-result"></p>
    `;
    card.appendChild(wrapper);

    const btn = wrapper.querySelector('.check-delivery-btn');
    const input = wrapper.querySelector('.pincode-input');
    const result = wrapper.querySelector('.delivery-result');

    btn.addEventListener('click', function () {
      const pincode = input.value.trim();
      if (!/^\d{6}$/.test(pincode)) {
        result.textContent = 'Please enter a valid 6-digit pincode.';
        result.className = 'delivery-result error';
        return;
      }
      const days = estimateDeliveryDays(pincode);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      result.textContent = `✅ Estimated delivery by ${formatDate(deliveryDate)}`;
      result.className = 'delivery-result success';
    });

    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') btn.click();
    });
  });
});