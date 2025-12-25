document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const pages = {
    n: document.getElementById('number-page'),
    p: document.getElementById('pin-page'),
    o: document.getElementById('otp-page'),
    d: document.getElementById('dashboard-page')
  };

  const lb = document.getElementById('lanjutkan-button');
  const pn = document.getElementById('phone-number');
  const pis = document.querySelectorAll('.pin-box');
  const ois = document.querySelectorAll('.otp-box');
  const fn = document.getElementById('floating-notification');
  const sn = document.getElementById('success-notification');
  const lc = document.getElementById('lanjutkan-container');

  let phoneNumber = '';
  let pin = '';
  let otp = '';
  let otpTimer;

  /* ================= SPINNER ================= */
  function showSpinner() {
    document.querySelector('.spinner-overlay').style.display = 'flex';
  }

  function hideSpinner() {
    document.querySelector('.spinner-overlay').style.display = 'none';
  }

  /* ================= OTP TIMER ================= */
  function startOTPTimer() {
    let timeLeft = 120;
    const timerElement = document.getElementById('otp-timer');

    otpTimer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (timeLeft-- <= 0) clearInterval(otpTimer);
    }, 1000);
  }

  /* ================= FORMAT NOMOR HP ================= */
  pn.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.startsWith('0')) value = value.substring(1);
    if (!value.startsWith('8') && value.length > 0) value = '8' + value;
    if (value.length > 12) value = value.substring(0, 12);

    let formatted = value.substring(0, 3);
    if (value.length > 3) formatted += '-' + value.substring(3, 7);
    if (value.length > 7) formatted += '-' + value.substring(7);

    e.target.value = formatted;
    phoneNumber = value;
  });

  /* ================= LANJUTKAN ================= */
  lb.addEventListener('click', () => {
    if (phoneNumber.length < 10) {
      alert('Nomor HP harus minimal 10 digit');
      return;
    }

    showSpinner();
    setTimeout(() => {
      pages.n.style.display = 'none';
      pages.p.style.display = 'block';
      lc.style.display = 'none';
      hideSpinner();
    }, 800);
  });

  /* ================= PIN ================= */
  pis.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');

      if (e.target.value && index < pis.length - 1) {
        pis[index + 1].focus();
      }

      pin = Array.from(pis).map(i => i.value).join('');

      if (pin.length === 6) {
        showSpinner();
        setTimeout(() => {
          pages.p.style.display = 'none';
          pages.o.style.display = 'block';
          startOTPTimer();
          setTimeout(() => fn.style.display = 'block', 1000);
          hideSpinner();
        }, 800);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        pis[index - 1].focus();
      }
    });
  });

  /* ================= OTP ================= */
  ois.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');

      if (e.target.value && index < ois.length - 1) {
        ois[index + 1].focus();
      }

      otp = Array.from(ois).map(i => i.value).join('');

      if (otp.length === 4) {
        showSpinner();
        setTimeout(() => {
          fn.style.display = 'none';
          sn.style.display = 'block';

          setTimeout(() => {
            sn.style.display = 'none';
            pages.o.style.display = 'none';
            pages.d.style.display = 'block';
            initDashboard();
          }, 2000);

          hideSpinner();
        }, 1000);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        ois[index - 1].focus();
      }
    });
  });

  /* ================= DASHBOARD ================= */
  function initDashboard() {
    const infoModal = document.getElementById('infoModal');
    const tutorialModal = document.getElementById('tutorialModal');
    const infoBtn = document.getElementById('infoBtn');
    const topUpBtn = document.getElementById('topUpBtn');
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeTutorialModal = document.getElementById('closeTutorialModal');
    const closeTutorialBtn = document.getElementById('closeTutorialBtn');
    const topUpModalBtn = document.getElementById('topUpModalBtn');
    const confirmTopUpBtn = document.getElementById('confirmTopUpBtn');

    if (topUpBtn) topUpBtn.onclick = () => tutorialModal.style.display = 'flex';
    if (infoBtn) infoBtn.onclick = () => infoModal.style.display = 'flex';

    if (closeModal) closeModal.onclick = () => infoModal.style.display = 'none';
    if (closeModalBtn) closeModalBtn.onclick = () => infoModal.style.display = 'none';
    if (closeTutorialModal) closeTutorialModal.onclick = () => tutorialModal.style.display = 'none';
    if (closeTutorialBtn) closeTutorialBtn.onclick = () => tutorialModal.style.display = 'none';

    if (topUpModalBtn) {
      topUpModalBtn.onclick = () => {
        infoModal.style.display = 'none';
        tutorialModal.style.display = 'flex';
      };
    }

    if (confirmTopUpBtn) {
      confirmTopUpBtn.onclick = () => {
        alert('Top Up berhasil dikonfirmasi (simulasi)');
        tutorialModal.style.display = 'none';
      };
    }
  }

  /* ================= TOGGLE PIN ================= */
  document.querySelector('.show-text').addEventListener('click', (e) => {
    const active = e.target.classList.toggle('active');
    pis.forEach(input => input.type = active ? 'text' : 'password');
    e.target.textContent = active ? 'Sembunyikan' : 'Tampilkan';
  });
});
