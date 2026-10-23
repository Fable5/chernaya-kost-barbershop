/* Быстрая персонализация: все заменяемые сведения собраны в BARBERSHOP_CONFIG. */
const BARBERSHOP_CONFIG = {
  brand: { name: 'ЧЁРНАЯ КОСТЬ', tagline: 'Барберское ремесло. Свой стиль.', description: 'Барбершоп «Чёрная Кость»: мужские и детские стрижки, оформление бороды.' },
  theme: { accent: '#71b7a9', background: '#151513', paper: '#f3eee4' },
  contacts: { phone: '', address: 'Адрес салона уточняется', hours: '09:00–21:00' },
  booking: { times: Array.from({ length: 24 }, (_, index) => { const minutes = 9 * 60 + index * 30; return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`; }) },
  images: {
    hero: 'assets/shop-interior.png',
    barbers: ['assets/shop-entry.png'],
    gallery: [
      { src: 'assets/shop-interior.png', alt: 'Интерьер барбершопа «Чёрная Кость» с кирпичными стенами и резными рамами', caption: 'Интерьер салона' },
      { src: 'assets/shop-entry.png', alt: 'Вход в барбершоп «Чёрная Кость»', caption: 'Входная группа' },
      { src: 'assets/shop-front.png', alt: 'Фасад барбершопа «Чёрная Кость»', caption: 'Фасад салона' }
    ]
  },
  services: [
    { name: 'Мужская стрижка', description: 'Актуальную стоимость и детали услуги уточняйте у салона.', duration: 'Время уточняется', price: 700 },
    { name: 'Оформление бороды', description: 'Актуальную стоимость и детали услуги уточняйте у салона.', duration: 'Время уточняется', price: 600 },
    { name: 'Детская стрижка', description: 'Актуальную стоимость и детали услуги уточняйте у салона.', duration: 'Время уточняется', price: 500 }
  ],
  barbers: [
    { name: 'Мастер салона', specialty: 'Мужские и детские стрижки · борода', experience: 'Имя уточняется' }
  ],
  reviews: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const rubles = value => `${new Intl.NumberFormat('ru-RU').format(value)} <small>₽</small>`;

function applyBrand() {
  $$('[data-brand]').forEach(node => { node.textContent = BARBERSHOP_CONFIG.brand.name; });
  $('[data-tagline]').textContent = BARBERSHOP_CONFIG.brand.tagline;
  $('[data-address]').innerHTML = `${escapeHTML(BARBERSHOP_CONFIG.contacts.address)}<br><small>Уточните у владельца перед публикацией</small>`;
  $('[data-hours]').textContent = BARBERSHOP_CONFIG.contacts.hours;
  $$('[data-phone]').forEach(node => { node.textContent = BARBERSHOP_CONFIG.contacts.phone || 'Телефон уточняется'; });
  $$('[data-phone-link]').forEach(node => {
    if (BARBERSHOP_CONFIG.contacts.phone) node.href = `tel:${BARBERSHOP_CONFIG.contacts.phone.replace(/[^+\d]/g, '')}`;
    else { node.removeAttribute('href'); node.setAttribute('aria-disabled', 'true'); }
  });
  document.title = `${BARBERSHOP_CONFIG.brand.name} — барбершоп с характером`;
  document.querySelector('meta[name="description"]').content = BARBERSHOP_CONFIG.brand.description;
  document.documentElement.style.setProperty('--accent', BARBERSHOP_CONFIG.theme.accent);
  document.documentElement.style.setProperty('--ink', BARBERSHOP_CONFIG.theme.background);
  document.documentElement.style.setProperty('--paper', BARBERSHOP_CONFIG.theme.paper);
}

function setImage(img, src, fallbackLabel) {
  img.src = src;
  img.addEventListener('error', () => {
    img.removeAttribute('src');
    img.alt = `${fallbackLabel}. Изображение временно недоступно.`;
    img.parentElement.classList.add('image-unavailable');
  }, { once: true });
}

function renderServices() {
  $('#service-list').innerHTML = BARBERSHOP_CONFIG.services.map((service, i) => `
    <article class="service-row"><span class="service-number">0${i + 1}</span><h3>${escapeHTML(service.name)}</h3><p>${escapeHTML(service.description)}</p><span class="service-time">${escapeHTML(service.duration)}</span><span class="service-price">${rubles(service.price)}</span></article>`).join('');
  const select = $('#service-select');
  select.insertAdjacentHTML('beforeend', BARBERSHOP_CONFIG.services.map((service, i) => `<option value="${i}">${escapeHTML(service.name)} — ${new Intl.NumberFormat('ru-RU').format(service.price)} ₽</option>`).join(''));
  select.querySelectorAll('option:not([value=""])').forEach((option, i) => {
    const service = BARBERSHOP_CONFIG.services[i];
    option.dataset.meta = `${service.duration} · ${new Intl.NumberFormat('ru-RU').format(service.price)} ₽`;
  });
}

function renderBarbers() {
  $('#barber-grid').innerHTML = BARBERSHOP_CONFIG.barbers.map((barber, i) => `
    <article class="barber-card"><div class="barber-photo"><img loading="lazy" alt="Барбершоп «Чёрная Кость» — ${escapeHTML(barber.name)}"><span class="barber-index">ЧЁРНАЯ КОСТЬ / 0${i + 1}</span></div><div class="barber-info"><h3>${escapeHTML(barber.name)}</h3><p>${escapeHTML(barber.specialty)}</p><span class="barber-exp">${escapeHTML(barber.experience)}</span></div></article>`).join('');
  $$('.barber-photo img').forEach((img, i) => setImage(img, BARBERSHOP_CONFIG.images.barbers[i % BARBERSHOP_CONFIG.images.barbers.length], 'Фотография барбершопа «Чёрная Кость»'));
  $('#barber-select').insertAdjacentHTML('beforeend', BARBERSHOP_CONFIG.barbers.map((barber, i) => `<option value="${i}" data-meta="${escapeHTML(barber.specialty)}">${escapeHTML(barber.name)}</option>`).join(''));
}

const pickerMap = new Map();
const APPOINTMENTS_STORAGE_KEY = 'noirBarbershopAppointments';
let memoryAppointments = [];
let storageUnavailable = false;
let refreshCalendarView = () => {};

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getBookingDateBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  const lastTargetDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  const maxDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(today.getDate(), lastTargetDay));
  return { min: localDateKey(today), max: localDateKey(maxDate) };
}

function readAppointments() {
  try {
    const saved = JSON.parse(localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && ['id', 'name', 'date', 'time', 'service', 'barber'].every(key => typeof item[key] === 'string')) : [];
  } catch {
    storageUnavailable = true;
    return [...memoryAppointments];
  }
}

function writeAppointments(appointments) {
  memoryAppointments = [...appointments];
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    storageUnavailable = false;
    return true;
  } catch {
    storageUnavailable = true;
    return false;
  }
}

function isTimeBooked(date, time, appointments = readAppointments()) {
  return appointments.some(item => item.date === date && item.time === time);
}

function russianPhoneDigits(value) {
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatRussianPhone(value) {
  const digits = russianPhoneDigits(value);
  let formatted = '+7';
  if (digits.length) formatted += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

function russianPhoneCaret(formatted, nationalDigitCount) {
  if (!nationalDigitCount) return 2;
  let count = 0;
  for (let index = 2; index < formatted.length; index++) {
    if (/\d/.test(formatted[index]) && ++count === nationalDigitCount) return index + 1;
  }
  return formatted.length;
}

function initPhoneMask(input) {
  input.value = '+7';
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7';
    if (russianPhoneDigits(input.value).length === 0) input.setSelectionRange(input.value.length, input.value.length);
  });
  input.addEventListener('keydown', event => {
    if ((event.key === 'Backspace' || event.key === 'Delete') && input.selectionStart === input.selectionEnd && input.selectionStart <= 2) event.preventDefault();
  });
  input.addEventListener('input', () => {
    const oldValue = input.value;
    const nationalDigitsBeforeCaret = russianPhoneDigits(oldValue.slice(0, input.selectionStart ?? oldValue.length)).length;
    const formatted = formatRussianPhone(oldValue);
    input.value = formatted;
    const caret = russianPhoneCaret(formatted, nationalDigitsBeforeCaret);
    input.setSelectionRange(caret, caret);
  });
  input.addEventListener('blur', () => {
    if (russianPhoneDigits(input.value).length === 0) input.value = '+7';
  });
}

function getAvailableBookingTimes(date, appointments = readAppointments()) {
  const { min } = getBookingDateBounds();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return BARBERSHOP_CONFIG.booking.times.filter(slot =>
    (date !== min || slot > currentTime) && !isTimeBooked(date, slot, appointments)
  );
}

function setupPicker(select, placeholder) {
  const wrapper = document.createElement('div');
  wrapper.className = `custom-picker${select.id === 'visit-time' ? ' time-picker' : ''}`;
  select.before(wrapper);
  wrapper.append(select);
  const trigger = document.createElement('button');
  trigger.className = 'picker-trigger';
  trigger.type = 'button';
  trigger.id = `${select.id}-trigger`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', `${select.id}-listbox`);
  trigger.setAttribute('aria-describedby', select.id === 'service-select' ? 'service-error' : select.id === 'visit-time' ? 'time-error' : 'barber-error');
  trigger.innerHTML = `<span class="picker-value">${escapeHTML(placeholder)}</span><span class="picker-chevron" aria-hidden="true">⌄</span>`;
  const popover = document.createElement('div');
  popover.className = 'picker-popover';
  popover.id = `${select.id}-popover`;
  popover.hidden = true;
  const list = document.createElement('div');
  list.className = 'picker-options';
  list.id = `${select.id}-listbox`;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', placeholder);
  if (select.id === 'visit-time') list.classList.add('picker-options--time');
  popover.append(list);
  wrapper.append(trigger, popover);
  const picker = { select, wrapper, trigger, popover, list, placeholder };
  pickerMap.set(select.id, picker);
  trigger.addEventListener('click', () => {
    if (trigger.disabled) return;
    const opening = popover.hidden;
    closePickers();
    if (opening) {
      popover.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      (list.querySelector('[aria-selected="true"]') || list.querySelector('[role="option"]'))?.focus();
    }
  });
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); trigger.click(); }
  });
  list.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    select.value = option.dataset.value;
    paintPicker(picker);
    closePickers();
    trigger.focus();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  list.addEventListener('keydown', event => {
    const options = [...list.querySelectorAll('[role="option"]')];
    const current = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      options[(current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
    } else if (event.key === 'Escape') { event.preventDefault(); closePickers(); trigger.focus(); }
  });
  wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) closePicker(picker); });
  paintPicker(picker);
  return picker;
}

function paintPicker(picker) {
  const options = [...picker.select.options].filter(option => option.value !== '');
  const selected = picker.select.selectedOptions[0];
  const label = selected?.value ? selected.textContent.split(' — ')[0] : picker.placeholder;
  picker.trigger.querySelector('.picker-value').textContent = label;
  picker.trigger.classList.toggle('has-value', Boolean(selected?.value));
  picker.list.innerHTML = '';
  options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picker-option';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(option.value === picker.select.value));
    button.dataset.value = option.value;
    const title = document.createElement('span');
    title.textContent = option.textContent.split(' — ')[0];
    button.append(title);
    const meta = option.dataset.meta || (option.textContent.includes(' — ') ? option.textContent.split(' — ').slice(1).join(' — ') : '');
    if (meta) { const detail = document.createElement('small'); detail.textContent = meta; button.append(detail); }
    picker.list.append(button);
  });
  picker.trigger.disabled = picker.select.disabled;
}

function closePicker(picker) {
  picker.popover.hidden = true;
  picker.trigger.setAttribute('aria-expanded', 'false');
}
function closePickers() { pickerMap.forEach(closePicker); }

function setupCalendar(onDateChange) {
  const date = $('#visit-date');
  const trigger = $('#date-picker-trigger');
  const popover = $('#calendar-popover');
  const today = new Date();
  const { min: todayKey, max: maxKey } = getBookingDateBounds();
  date.min = todayKey;
  date.max = maxKey;
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const displayDate = value => value ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Выберите дату';
  const render = () => {
    $('#calendar-month').textContent = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(viewMonth);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(new Date(`${maxKey}T00:00:00`).getFullYear(), new Date(`${maxKey}T00:00:00`).getMonth(), 1);
    $('#calendar-prev').disabled = viewMonth <= minMonth;
    $('#calendar-next').disabled = viewMonth >= maxMonth;
    const appointments = readAppointments();
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const dayCount = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const days = [];
    for (let blank = 0; blank < offset; blank++) days.push('<span class="calendar-empty" aria-hidden="true"></span>');
    for (let day = 1; day <= dayCount; day++) {
      const key = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const bookedSlots = appointments.filter(item => item.date === key).map(item => item.time);
      const availableSlots = getAvailableBookingTimes(key, appointments);
      const fullyBooked = BARBERSHOP_CONFIG.booking.times.length > 0 && availableSlots.length === 0;
      const hasBookings = bookedSlots.length > 0;
      const disabled = key < todayKey || key > maxKey || fullyBooked;
      const ariaLabel = fullyBooked ? `${day}, свободного времени нет` : hasBookings ? `${day}, есть занятые интервалы` : `${day}`;
      days.push(`<button class="calendar-day${key === date.value ? ' is-selected' : ''}${key === todayKey ? ' is-today' : ''}${hasBookings ? ' has-bookings' : ''}${fullyBooked ? ' is-full' : ''}" type="button" data-date="${key}" aria-label="${ariaLabel}" aria-pressed="${key === date.value}"${disabled ? ' disabled' : ''}>${day}</button>`);
    }
    $('#calendar-days').innerHTML = days.join('');
  };
  const setOpen = open => {
    popover.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) render();
  };
  refreshCalendarView = render;
  trigger.closest('.calendar-wrap').addEventListener('focusout', event => {
    if (!trigger.closest('.calendar-wrap').contains(event.relatedTarget)) setOpen(false);
  });
  trigger.addEventListener('click', () => setOpen(popover.hidden));
  $('#calendar-prev').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); render(); });
  $('#calendar-next').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); render(); });
  $('#calendar-days').addEventListener('click', event => {
    const day = event.target.closest('[data-date]');
    if (!day || day.disabled) return;
    date.value = day.dataset.date;
    trigger.querySelector('span').textContent = displayDate(date.value);
    trigger.classList.add('has-value');
    setOpen(false);
    onDateChange();
    date.dispatchEvent(new Event('change', { bubbles: true }));
    trigger.focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!popover.hidden && !popover.parentElement.contains(event.target)) setOpen(false);
    pickerMap.forEach(picker => { if (!picker.wrapper.contains(event.target)) closePicker(picker); });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popover.hidden) { setOpen(false); trigger.focus(); }
  });
  render();
}

function renderAppointments() {
  const appointments = readAppointments().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const list = $('#appointments-list');
  list.replaceChildren();
  $('#appointment-count').textContent = String(appointments.length);
  $('#my-appointments-button').setAttribute('aria-label', `Мои записи: ${appointments.length}`);
  $('#appointments-storage-note').textContent = storageUnavailable ? 'Хранилище браузера недоступно: записи сохраняются только до закрытия этой страницы.' : 'Записи сохраняются только в локальном хранилище этого браузера.';
  if (!appointments.length) {
    const empty = document.createElement('p');
    empty.className = 'appointments-empty';
    empty.textContent = 'Пока нет оформленных записей. Выберите дату, время, услугу и мастера в форме.';
    list.append(empty);
    return;
  }
  appointments.forEach(appointment => {
    const card = document.createElement('article');
    card.className = 'appointment-card';
    const head = document.createElement('div');
    head.className = 'appointment-card-head';
    const date = document.createElement('h3');
    date.textContent = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${appointment.date}T00:00:00`));
    const time = document.createElement('span');
    time.className = 'appointment-time';
    time.textContent = appointment.time;
    head.append(date, time);
    const details = document.createElement('p');
    details.textContent = `${appointment.service} · ${appointment.barber}`;
    const name = document.createElement('small');
    name.textContent = appointment.name;
    const remove = document.createElement('button');
    remove.className = 'appointment-remove';
    remove.type = 'button';
    remove.dataset.removeAppointment = appointment.id;
    remove.textContent = 'Удалить демо-запись';
    const info = document.createElement('div');
    info.className = 'appointment-card-info';
    info.append(head, details, name);
    const actions = document.createElement('div');
    actions.className = 'appointment-card-actions';
    actions.append(remove);
    card.append(info, actions);
    list.append(card);
  });
}

function initAppointments() {
  const dialog = $('#my-appointments-dialog');
  $('#my-appointments-button').addEventListener('click', () => {
    renderAppointments();
    dialog.showModal();
  });
  $('#appointments-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  $('#appointments-list').addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-appointment]');
    if (!remove) return;
    const appointments = readAppointments().filter(item => item.id !== remove.dataset.removeAppointment);
    writeAppointments(appointments);
    renderAppointments();
    refreshCalendarView();
  });
  renderAppointments();
}

function renderGallery() {
  $('#gallery-grid').innerHTML = BARBERSHOP_CONFIG.images.gallery.map(item => `<figure class="gallery-item"><img loading="lazy" alt="${escapeHTML(item.alt)}"><figcaption class="gallery-caption">${escapeHTML(item.caption)}</figcaption></figure>`).join('');
  $$('.gallery-item img').forEach((img, i) => setImage(img, BARBERSHOP_CONFIG.images.gallery[i].src, BARBERSHOP_CONFIG.images.gallery[i].caption));
}

let reviewIndex = 0;
function renderReview() {
  if (!BARBERSHOP_CONFIG.reviews.length) {
    $('#review-card').innerHTML = '<div class="review-placeholder"><span class="review-stars">ЧЁРНАЯ КОСТЬ</span><p class="review-text">Отзывы гостей появятся здесь после согласования с салоном.</p><div class="review-author"><strong>Раздел подготовлен к заполнению</strong></div></div>';
    $('.review-controls')?.setAttribute('hidden', '');
    return;
  }
  const review = BARBERSHOP_CONFIG.reviews[reviewIndex];
  $('#review-card').innerHTML = `<div><div class="review-stars" aria-label="Пять звезд">★★★★★</div><p class="review-text">«${escapeHTML(review.text)}»</p></div><div class="review-author"><strong>${escapeHTML(review.author)}</strong><span>${escapeHTML(review.service)} · отзыв для демонстрации</span></div>`;
  $('#review-count').textContent = `${String(reviewIndex + 1).padStart(2, '0')} / ${String(BARBERSHOP_CONFIG.reviews.length).padStart(2, '0')}`;
}

function initMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); nav.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open);
  });
  $$('a', nav).forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}

function initForm() {
  const form = $('#booking-form');
  const successDialog = $('#booking-success-dialog');
  $('#success-close').addEventListener('click', () => successDialog.close());
  $('#success-open-appointments').addEventListener('click', () => {
    successDialog.close();
    renderAppointments();
    $('#my-appointments-dialog').showModal();
  });
  successDialog.addEventListener('click', event => { if (event.target === successDialog) successDialog.close(); });
  const date = $('#visit-date');
  const time = $('#visit-time');
  const service = $('#service-select');
  const barber = $('#barber-select');
  const phone = $('#client-phone');
  initPhoneMask(phone);
  const dateField = { input: date, error: $('#date-error'), focusTarget: $('#date-picker-trigger'), validate: value => { if (!value) return 'Выберите дату визита.'; const bounds = getBookingDateBounds(); if (value < bounds.min) return 'Нельзя выбрать дату в прошлом.'; if (value > bounds.max) return 'Запись доступна не более чем на три месяца вперёд.'; if (!getAvailableBookingTimes(value).length) return 'На эту дату больше нет свободного времени.'; return true; } };
  const timeField = { input: time, error: $('#time-error'), focusTarget: pickerMap.get('visit-time').trigger, validate: value => value !== '' && getAvailableBookingTimes(date.value).includes(value) || 'Выберите свободное время.' };
  const fields = [
    { input: $('#client-name'), error: $('#name-error'), validate: value => /^[\p{L}][\p{L}\s’'\-]{1,48}$/u.test(value.trim()) || 'Введите имя: минимум 2 буквы, без цифр.' },
    { input: phone, error: $('#phone-error'), validate: value => russianPhoneDigits(value).length === 10 || 'Укажите все 10 цифр номера после +7.' },
    { input: service, error: $('#service-error'), focusTarget: pickerMap.get('service-select').trigger, validate: value => value !== '' || 'Выберите услугу из списка.' },
    dateField,
    timeField,
    { input: barber, error: $('#barber-error'), focusTarget: pickerMap.get('barber-select').trigger, validate: value => value !== '' || 'Выберите мастера.' }
  ];
  fields.forEach(({ input, error, validate }) => {
    const recheck = () => { if (input.getAttribute('aria-invalid') === 'true') showError(fields.find(field => field.input === input), validate(input.value)); };
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
  });
  date.addEventListener('change', () => {
    const selectedDate = date.value;
    const slots = getAvailableBookingTimes(selectedDate);
    time.innerHTML = `<option value="">${slots.length ? 'Выберите время' : 'Нет свободного времени на сегодня'}</option>${slots.map(slot => `<option value="${escapeHTML(slot)}">${escapeHTML(slot)}</option>`).join('')}`;
    time.value = '';
    time.disabled = !selectedDate || slots.length === 0;
    paintPicker(pickerMap.get('visit-time'));
    time.removeAttribute('aria-invalid');
    pickerMap.get('visit-time').trigger.setAttribute('aria-invalid', 'false');
    timeField.error.textContent = '';
    if (date.getAttribute('aria-invalid') === 'true') showError(dateField, dateField.validate(date.value));
  });
  setupCalendar(() => {
    if (date.getAttribute('aria-invalid') === 'true') showError(dateField, dateField.validate(date.value));
  });
  $('#consent').addEventListener('change', () => { if ($('#consent').checked) { $('#consent').removeAttribute('aria-invalid'); $('#consent-error').textContent = ''; } });
  function showError(field, result) {
    const { input, error: errorNode } = field;
    const message = result === true ? '' : result;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (field.focusTarget) field.focusTarget.setAttribute('aria-invalid', String(Boolean(message)));
    errorNode.textContent = message;
    return !message;
  }
  const submitButton = $('.form-submit', form);
  const submitLabel = $('.submit-label', submitButton);
  let submitPending = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submitPending) return;
    submitPending = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.classList.add('is-loading');
    submitLabel.textContent = 'Проверяем…';
    window.setTimeout(() => {
    submitPending = false;
    submitButton.classList.remove('is-loading');
    submitButton.removeAttribute('aria-busy');
    submitLabel.textContent = 'Проверить заявку';
    $('#form-result').textContent = '';
    $('#form-result').classList.remove('is-error');
    let valid = true;
    for (const field of fields) valid = showError(field, field.validate(field.input.value)) && valid;
    const consent = $('#consent');
    const consentValid = consent.checked;
    consent.setAttribute('aria-invalid', String(!consentValid));
    $('#consent-error').textContent = consentValid ? '' : 'Для демонстрационной проверки отметьте согласие.';
    valid = consentValid && valid;
    if (!valid) {
      submitButton.disabled = false;
      submitButton.classList.add('is-invalid');
      window.setTimeout(() => submitButton.classList.remove('is-invalid'), 500);
      $('#form-result').textContent = 'Проверьте поля, отмеченные сообщениями об ошибке.';
      $('#form-result').classList.add('is-error');
      const firstInvalidField = fields.find(field => field.input.getAttribute('aria-invalid') === 'true');
      const firstInvalid = firstInvalidField?.focusTarget || firstInvalidField?.input || $('[aria-invalid="true"]', form);
      firstInvalid?.focus();
      return;
    }
    const appointment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: $('#client-name').value.trim(),
      date: date.value,
      time: time.value,
      service: BARBERSHOP_CONFIG.services[Number(service.value)].name,
      barber: BARBERSHOP_CONFIG.barbers[Number(barber.value)].name
    };
    const saved = writeAppointments([...readAppointments(), appointment]);
    const displayDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${appointment.date}T00:00:00`));
    $('#booking-success-summary').textContent = `${displayDate} · ${appointment.time}\n${appointment.service} с мастером ${appointment.barber}. ${saved ? 'Запись сохранена в этом браузере.' : 'Запись действует в этом сеансе браузера.'}`;
    renderAppointments();
    refreshCalendarView();
    form.reset();
    phone.value = '+7';
    date.value = '';
    $('#date-picker-trigger').querySelector('span').textContent = 'Выберите дату';
    $('#date-picker-trigger').classList.remove('has-value');
    time.innerHTML = '<option value="">Сначала выберите дату</option>';
    time.disabled = true;
    [service, time, barber].forEach(select => { select.value = ''; paintPicker(pickerMap.get(select.id)); });
    fields.forEach(field => {
      field.input.removeAttribute('aria-invalid');
      field.focusTarget?.removeAttribute('aria-invalid');
      field.error.textContent = '';
    });
    $('#consent').removeAttribute('aria-invalid');
    $('#consent-error').textContent = '';
    $('#form-result').textContent = saved
      ? 'Запись сохранена в разделе «Мои записи» этого браузера. Это время занято; другие свободные часы на дату остаются доступны.'
      : 'Запись добавлена в список этого сеанса, но браузер не разрешил сохранить её после закрытия страницы.';
    successDialog.showModal();
    submitButton.classList.add('is-complete');
    submitLabel.textContent = 'Запись оформлена';
    window.setTimeout(() => {
      submitButton.disabled = false;
      submitButton.classList.remove('is-complete');
      submitLabel.textContent = 'Проверить заявку';
    }, 1400);
    }, 420);
  });
}

applyBrand();
setImage($('.hero-image'), BARBERSHOP_CONFIG.images.hero, 'Интерьер демонстрационного барбершопа');
renderServices();
renderBarbers();
renderGallery();
renderReview();
setupPicker($('#service-select'), 'Выберите услугу');
setupPicker($('#visit-time'), 'Выберите время');
setupPicker($('#barber-select'), 'Выберите мастера');
initMenu();
initForm();
initAppointments();
$('#review-prev')?.addEventListener('click', () => { reviewIndex = (reviewIndex - 1 + BARBERSHOP_CONFIG.reviews.length) % BARBERSHOP_CONFIG.reviews.length; renderReview(); });
$('#review-next')?.addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % BARBERSHOP_CONFIG.reviews.length; renderReview(); });
$('#year').textContent = new Date().getFullYear();
$('.back-top').addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
