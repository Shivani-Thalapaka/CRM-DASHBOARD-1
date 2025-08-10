// Email validation - accepts various email formats but rejects only numbers or only alphabets
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required and must be a string' };
  }

  // Check if email contains only numbers
  if (/^\d+$/.test(email)) {
    return { isValid: false, message: 'Invalid email format: cannot contain only numbers' };
  }

  // Check if email contains only alphabets
  if (/^[a-zA-Z]+$/.test(email)) {
    return { isValid: false, message: 'Invalid email format: cannot contain only alphabets' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true };
};

// Phone validation
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'Phone is required and must be a string' };
  }

  // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,20}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, message: 'Invalid phone number format' };
  }

  return { isValid: true };
};

// Name validation
const validateName = (name) => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required and cannot be empty' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  return { isValid: true };
};

// Generic required field validation
const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Validate customer data
const validateCustomer = (customerData) => {
  const errors = [];

  const nameValidation = validateName(customerData.name);
  if (!nameValidation.isValid) errors.push(nameValidation.message);

  const emailValidation = validateEmail(customerData.email);
  if (!emailValidation.isValid) errors.push(emailValidation.message);

  const phoneValidation = validatePhone(customerData.phone);
  if (!phoneValidation.isValid) errors.push(phoneValidation.message);

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate lead data
const validateLead = (leadData) => {
  const errors = [];

  if (!leadData.customer_id || isNaN(leadData.customer_id)) {
    errors.push('Valid customer_id is required');
  }

  const sourceValidation = validateRequired(leadData.lead_source, 'Lead source');
  if (!sourceValidation.isValid) errors.push(sourceValidation.message);

  const statusValidation = validateRequired(leadData.status, 'Status');
  if (!statusValidation.isValid) errors.push(statusValidation.message);

  if (leadData.value && (isNaN(leadData.value) || leadData.value < 0)) {
    errors.push('Lead value must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate contact data
const validateContact = (contactData) => {
  const errors = [];

  if (!contactData.customer_id || isNaN(contactData.customer_id)) {
    errors.push('Valid customer_id is required');
  }

  const typeValidation = validateRequired(contactData.contact_type, 'Contact type');
  if (!typeValidation.isValid) errors.push(typeValidation.message);

  const valueValidation = validateRequired(contactData.contact_value, 'Contact value');
  if (!valueValidation.isValid) errors.push(valueValidation.message);

  // Validate contact value based on type
  if (contactData.contact_type === 'email') {
    const emailValidation = validateEmail(contactData.contact_value);
    if (!emailValidation.isValid) errors.push(emailValidation.message);
  } else if (contactData.contact_type === 'phone') {
    const phoneValidation = validatePhone(contactData.contact_value);
    if (!phoneValidation.isValid) errors.push(phoneValidation.message);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validateName,
  validateRequired,
  validateCustomer,
  validateLead,
  validateContact
};