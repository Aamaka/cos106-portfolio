/* ==========================================================
   Contact form validation
   Checks: no empty fields, valid email format,
   phone number contains digits only.
   ========================================================== */

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DIGITS_ONLY = /^\d+$/;

// Each rule returns an error message, or an empty string if valid
const rules = {
  name: function (value) {
    if (value === "") return "Enter your full name.";
    return "";
  },
  email: function (value) {
    if (value === "") return "Enter your email address.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
    return "";
  },
  phone: function (value) {
    if (value === "") return "Enter your phone number.";
    if (!DIGITS_ONLY.test(value)) return "Use digits only, with no spaces, dashes or + sign.";
    if (value.length < 7 || value.length > 15) return "Phone numbers should be 7 to 15 digits long.";
    return "";
  },
  message: function (value) {
    if (value === "") return "Enter a message.";
    return "";
  }
};

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + "-error");
  const wrapper = input.closest(".field");

  errorSpan.textContent = message;
  wrapper.classList.toggle("field--invalid", message !== "");
  input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

function validateField(fieldId) {
  const value = document.getElementById(fieldId).value.trim();
  const message = rules[fieldId](value);
  showError(fieldId, message);
  return message === "";
}

// Re-check a field as soon as the user leaves it
Object.keys(rules).forEach(function (fieldId) {
  const input = document.getElementById(fieldId);
  input.addEventListener("blur", function () {
    if (input.value.trim() !== "") validateField(fieldId);
  });
  input.addEventListener("input", function () {
    if (input.closest(".field").classList.contains("field--invalid")) {
      validateField(fieldId);
    }
  });
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const fieldIds = Object.keys(rules);
  const results = fieldIds.map(validateField);
  const firstInvalid = fieldIds.find(function (id, index) {
    return !results[index];
  });

  if (firstInvalid) {
    formStatus.className = "form-status form-status--error";
    formStatus.textContent = "Please fix the highlighted fields and try again.";
    document.getElementById(firstInvalid).focus();
    return;
  }

  // No server for this project, so the send is simulated
  const name = document.getElementById("name").value.trim().split(" ")[0];
  formStatus.className = "form-status form-status--success";
  formStatus.textContent = "Thanks, " + name + "! Your message has been sent.";
  contactForm.reset();
});
