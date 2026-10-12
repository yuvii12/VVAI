
/* =========================================================
   VASTU VIHAR - PROPERTY PRICE CALCULATOR
   Calculates estimated property price from area and rate.
========================================================= */

VV.pages.priceCalculator = (function () {
  const { inr } = VV.utils;

  function render(root) {
    root.innerHTML = `
      <div class="page-container">
        <div class="hero-banner">
          <div>
            <h2>🏠 Property Price Calculator</h2>
            <p>
              Calculate the estimated property price using area,
              rate per square foot, additional charges and discount.
            </p>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-top:20px;">
          <h3>Property Details</h3>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:20px;">

            <div>
              <label class="form-label" for="price-area">
                Property Area (sq. ft.)
              </label>
              <input
                id="price-area"
                class="form-input"
                type="number"
                min="0"
                step="0.01"
                value="1000"
              >
            </div>

            <div>
              <label class="form-label" for="price-rate">
                Rate per sq. ft. (₹)
              </label>
              <input
                id="price-rate"
                class="form-input"
                type="number"
                min="0"
                step="0.01"
                value="3000"
              >
            </div>

            <div>
              <label class="form-label" for="price-charges">
                Additional Charges (₹)
              </label>
              <input
                id="price-charges"
                class="form-input"
                type="number"
                min="0"
                step="0.01"
                value="0"
              >
            </div>

            <div>
              <label class="form-label" for="price-discount">
                Discount (₹)
              </label>
              <input
                id="price-discount"
                class="form-input"
                type="number"
                min="0"
                step="0.01"
                value="0"
              >
            </div>

          </div>

          <div
            id="price-error"
            role="alert"
            style="color:#dc2626;margin-top:12px;"
          ></div>

          <div
           <div
            class="price-result"
            style="margin-top:24px;padding:22px;border-radius:12px;
            background:var(--surface-muted, #f1f5f9);
            border:1px solid var(--border-color);"
          >
           
            <div class="price-result-label">Base Property Price</div>
            <h2 id="price-base" style="margin:8px 0 20px;">₹30,00,000</h2>


            <div style="display:flex;justify-content:space-between;gap:12px;margin:12px 0;">
              <span>Additional Charges</span>
              <strong id="price-extra">₹0</strong>
            </div>

            <div style="display:flex;justify-content:space-between;gap:12px;margin:12px 0;">
              <span>Discount</span>
              <strong id="price-discount-result">₹0</strong>
            </div>

            <hr style="border:0;border-top:1px solid var(--border-color);">

            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:18px;">
              <strong>Estimated Total Price</strong>
              <strong id="price-total" style="font-size:24px;color:var(--primary);">
                ₹30,00,000
              </strong>
            </div>

           
            
            <p class="price-note" style="margin-top:14px;">
            Formula: Area × Rate + Additional Charges − Discount.
            GST, registration fees and stamp duty are not included.
            </p>


          </div>
        </div>
      </div>
    `;

    const areaInput = root.querySelector("#price-area");
    const rateInput = root.querySelector("#price-rate");
    const chargesInput = root.querySelector("#price-charges");
    const discountInput = root.querySelector("#price-discount");

    const baseOutput = root.querySelector("#price-base");
    const extraOutput = root.querySelector("#price-extra");
    const discountOutput = root.querySelector("#price-discount-result");
    const totalOutput = root.querySelector("#price-total");
    const errorOutput = root.querySelector("#price-error");

    function calculatePrice() {
      const area = Number(areaInput.value);
      const rate = Number(rateInput.value);
      const charges = Number(chargesInput.value);
      const discount = Number(discountInput.value);

      const values = [area, rate, charges, discount];

      if (
        values.some((value) => !Number.isFinite(value) || value < 0) ||
        [areaInput, rateInput, chargesInput, discountInput]
          .some((input) => input.value.trim() === "")
      ) {
        errorOutput.textContent =
          "Please enter valid non-negative values in every field.";

        baseOutput.textContent = "—";
        extraOutput.textContent = "—";
        discountOutput.textContent = "—";
        totalOutput.textContent = "—";
        return;
      }

      const basePrice = area * rate;

      if (!Number.isFinite(basePrice) ||
          !Number.isFinite(basePrice + charges)) {
        errorOutput.textContent = "The entered values are too large.";
        baseOutput.textContent = "—";
        extraOutput.textContent = "—";
        discountOutput.textContent = "—";
        totalOutput.textContent = "—";
        return;
      }

      if (discount > basePrice + charges) {
        errorOutput.textContent =
          "Discount cannot exceed the total before discount.";

        baseOutput.textContent = `₹${inr(basePrice)}`;
        extraOutput.textContent = `₹${inr(charges)}`;
        discountOutput.textContent = `₹${inr(discount)}`;
        totalOutput.textContent = "—";
        return;
      }

      const totalPrice = basePrice + charges - discount;

      errorOutput.textContent = "";
      baseOutput.textContent = `₹${inr(basePrice)}`;
      extraOutput.textContent = `₹${inr(charges)}`;
      discountOutput.textContent = `₹${inr(discount)}`;
      totalOutput.textContent = `₹${inr(totalPrice)}`;
    }

    [
      areaInput,
      rateInput,
      chargesInput,
      discountInput
    ].forEach((input) => {
      input.addEventListener("input", calculatePrice);
    });

    calculatePrice();
  }

  return { render };
})();
