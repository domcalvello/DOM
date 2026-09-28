const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const preferredScrollBehavior = () => reducedMotionQuery.matches ? 'auto' : 'smooth';

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
  });

  primaryNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    }
  });
}

const servicePackages = {
  'Website Visual Upgrade': [
    'Level 1 — Quick Fix — $49',
    'Level 2 — Visual Upgrade — $99',
    'Level 3 — Page Polish — $179',
  ],
  'Website Hero / Digital Artwork': ['Basic — $39', 'Standard — $69', 'Premium — $119'],
  'eBay & Collectibles Listing Images': ['5 Images — $25', '15 Images — $49', '30 Images — $79'],
  'Logo & Web Asset Kit': ['Basic — $29', 'Standard — $49', 'Premium — $79'],
  'Product Visualization': ['Basic — $59', 'Standard — $99', 'Premium — $149'],
  'Something Else': ['Custom scope'],
};

const projectForm = document.querySelector('[data-project-form]');
const serviceSelect = document.querySelector('#project-service');
const packageSelect = document.querySelector('#project-package');
const descriptionField = document.querySelector('#project-description');
const nameField = document.querySelector('#project-name');
const emailField = document.querySelector('#project-email');
const linkField = document.querySelector('#project-link');
const fileField = document.querySelector('#project-files');
const fileStatus = document.querySelector('[data-file-status]');
const formStatus = document.querySelector('[data-form-status]');

function updatePackageOptions(service, preferredPackage = '') {
  if (!packageSelect) return;

  packageSelect.replaceChildren();
  const packages = servicePackages[service];

  if (!packages) {
    const option = new Option('Choose a service first', '');
    packageSelect.add(option);
    packageSelect.disabled = true;
    return;
  }

  packageSelect.disabled = false;
  packageSelect.add(new Option('Choose a package', ''));

  packages.forEach((packageName) => {
    const option = new Option(packageName, packageName);
    if (preferredPackage && packageName.toLowerCase().includes(preferredPackage.toLowerCase())) {
      option.selected = true;
    }
    packageSelect.add(option);
  });
}

function setProjectSelection(service, packageName = '') {
  if (!serviceSelect || !packageSelect) return;
  serviceSelect.value = service;
  updatePackageOptions(service, packageName);
  document.querySelector('#start')?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
  window.setTimeout(() => descriptionField?.focus({ preventScroll: true }), 650);
}

serviceSelect?.addEventListener('change', () => {
  updatePackageOptions(serviceSelect.value);
  validateField(serviceSelect);
});

document.querySelectorAll('[data-package-picker]').forEach((picker) => {
  const panels = picker.parentElement.querySelectorAll('.package-panel');
  picker.addEventListener('change', (event) => {
    const radio = event.target.closest('input[type="radio"]');
    if (!radio) return;
    panels.forEach((panel) => {
      panel.hidden = panel.id !== radio.dataset.panel;
    });
  });
});

document.querySelectorAll('[data-service-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    const product = button.closest('[data-service]');
    const selected = product?.querySelector('input[type="radio"]:checked');
    const [packageName] = (selected?.value || '').split('|');
    setProjectSelection(product?.dataset.service || '', packageName);
  });
});

document.querySelectorAll('[data-direct-service]').forEach((button) => {
  button.addEventListener('click', () => {
    setProjectSelection(button.dataset.directService || '', button.dataset.directPackage || '');
  });
});

const searchForm = document.querySelector('[data-service-search]');
const searchInput = document.querySelector('#service-search-input');
const searchStatus = document.querySelector('[data-search-status]');
const serviceProducts = [...document.querySelectorAll('[data-service]')];
const noResults = document.querySelector('[data-no-results]');

function filterServices(rawQuery, shouldScroll = false) {
  const query = rawQuery.trim().toLowerCase();
  let matchCount = 0;
  let firstMatch = null;

  serviceProducts.forEach((product) => {
    const haystack = `${product.dataset.service} ${product.dataset.keywords}`.toLowerCase();
    const matches = !query || haystack.includes(query);
    product.hidden = !matches;
    if (matches) {
      matchCount += 1;
      firstMatch ||= product;
    }
  });

  if (noResults) noResults.hidden = matchCount !== 0;
  if (searchStatus) {
    searchStatus.textContent = query
      ? `${matchCount} service${matchCount === 1 ? '' : 's'} found`
      : '';
  }

  if (shouldScroll && firstMatch) {
    firstMatch.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
  } else if (shouldScroll && !firstMatch) {
    noResults?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'center' });
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  filterServices(searchInput?.value || '', true);
});

searchInput?.addEventListener('input', () => {
  filterServices(searchInput.value);
});

function errorElementFor(field) {
  return document.querySelector(`[data-error-for="${field.id}"]`);
}

function validateField(field) {
  if (!field) return true;
  const error = errorElementFor(field);
  let message = '';

  if (field.validity.valueMissing) {
    message = 'Please complete this field.';
  } else if (field.validity.typeMismatch) {
    message = field.type === 'email' ? 'Enter a valid email address.' : 'Enter a complete URL, including https://.';
  } else if (field.validity.tooShort) {
    message = `Add a little more detail (${field.minLength} characters minimum).`;
  }

  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
  return !message;
}

projectForm?.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
  });
});

fileField?.addEventListener('change', () => {
  const files = [...fileField.files];
  if (!fileStatus) return;
  fileStatus.textContent = files.length
    ? `${files.length} file${files.length === 1 ? '' : 's'} selected. Attach ${files.length === 1 ? 'it' : 'them'} when the prepared email opens.`
    : 'Files stay on your device until you attach them to the prepared email.';
});

function projectBrief() {
  const files = [...(fileField?.files || [])].map((file) => file.name);
  return [
    `Name: ${nameField?.value.trim() || ''}`,
    `Email: ${emailField?.value.trim() || ''}`,
    `Service: ${serviceSelect?.value || ''}`,
    `Package: ${packageSelect?.value || ''}`,
    `Reference link: ${linkField?.value.trim() || 'Not provided'}`,
    `Files selected for manual attachment: ${files.length ? files.join(', ') : 'None'}`,
    '',
    'Project details:',
    descriptionField?.value.trim() || '',
  ].join('\n');
}

projectForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const requiredFields = [serviceSelect, packageSelect, descriptionField, nameField, emailField, linkField].filter(Boolean);
  const isValid = requiredFields.map(validateField).every(Boolean);

  if (!isValid) {
    const firstInvalid = projectForm.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    if (formStatus) {
      formStatus.textContent = 'Check the highlighted fields, then submit again.';
      formStatus.style.color = 'var(--red)';
    }
    return;
  }

  const subject = `DOM project inquiry — ${serviceSelect.value}`;
  const body = projectBrief();
  if (formStatus) {
    formStatus.textContent = 'Your project email is ready. Attach any selected files before sending.';
    formStatus.style.color = 'var(--green)';
  }
  window.location.href = `mailto:domcalvello@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelector('[data-copy-brief]')?.addEventListener('click', async () => {
  if (!projectForm) return;
  const button = document.querySelector('[data-copy-brief]');
  try {
    await navigator.clipboard.writeText(projectBrief());
    button.textContent = 'Brief Copied';
    if (formStatus) {
      formStatus.textContent = 'Project details copied to your clipboard.';
      formStatus.style.color = 'var(--green)';
    }
    window.setTimeout(() => { button.textContent = 'Copy Project Brief'; }, 1800);
  } catch {
    if (formStatus) {
      formStatus.textContent = 'Copying was blocked. Select the form text manually or submit to prepare the email.';
      formStatus.style.color = 'var(--red)';
    }
  }
});

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

const reduceMotion = reducedMotionQuery.matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}
