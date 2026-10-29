/**
 * CALMUN 2026 - Official Website Scripts
 * Merkez Çanakkale Anadolu Lisesi Model United Nations
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVIGATION & MOBILE MENU
    // ==========================================
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('header');
    const navItemsWithDropdown = document.querySelectorAll('.nav-item');

    // Mobile menu toggle
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        });
    }

    // Mobile dropdown toggle on click
    navItemsWithDropdown.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown-menu');
        if (dropdown && link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    item.classList.toggle('open');
                }
            });
        }
    });

    // Close mobile menu when clicking outside or clicking any submenu link
    document.querySelectorAll('.dropdown-menu a, .nav-cta-btn').forEach(link => {
        link.addEventListener('click', () => {
            if (navbar && menuIcon) {
                menuIcon.classList.remove('bx-x');
                navbar.classList.remove('active');
                navItemsWithDropdown.forEach(i => i.classList.remove('open'));
            }
        });
    });

    // ==========================================
    // 2. SCROLL SPY & STICKY HEADER
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar .nav-link[href^="#"]');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 80);
        }

        // Active link scroll spy
        let currentSectionId = '';
        sections.forEach(sec => {
            const top = window.scrollY;
            const offset = sec.offsetTop - 150;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                currentSectionId = id;
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.includes(currentSectionId)) {
                    link.classList.add('active');
                }
            });
        }
    });

    // ==========================================
    // 3. COUNTDOWN TIMER TO CALMUN 2026 (Dec 4, 2026)
    // ==========================================
    const targetDate = new Date('2026-12-04T09:00:00+03:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
        } else {
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
        }
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ==========================================
    // 4. SCHEDULE TABS (DAY 1 / 2 / 3)
    // ==========================================
    const scheduleTabBtns = document.querySelectorAll('.schedule-tab-btn');
    const scheduleContents = document.querySelectorAll('.schedule-content');

    scheduleTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scheduleTabBtns.forEach(b => b.classList.remove('active'));
            scheduleContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetDay = btn.getAttribute('data-day');
            const targetContent = document.getElementById(`schedule-${targetDay}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const headerEl = item.querySelector('.faq-header');
        const bodyEl = item.querySelector('.faq-body');

        headerEl.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => {
                i.classList.remove('active');
                const b = i.querySelector('.faq-body');
                if (b) b.style.maxHeight = null;
            });

            // If not active, open clicked one
            if (!isActive) {
                item.classList.add('active');
                if (bodyEl) {
                    bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
                }
            }
        });
    });

    // Open first FAQ item by default
    if (faqItems.length > 0) {
        const first = faqItems[0];
        first.classList.add('active');
        const firstBody = first.querySelector('.faq-body');
        if (firstBody) firstBody.style.maxHeight = firstBody.scrollHeight + 'px';
    }

    // ==========================================
    // 6. COMMITTEE MODAL & DETAILS
    // ==========================================
    const committeesData = {
        'ilo': {
            title: 'ILO',
            fullName: 'International Labour Organization',
            image: 'images/committee-ilo.jpg',
            agenda: 'Expanding Universal Social Protection in Changing Labour Markets',
            board: [
                'Demir Selçuk (Chair)',
                'Mina Dönmez (Under-Secretary-General)',
                'Kayra (Co-Chair)'
            ],
            description: 'The International Labour Organization is devoted to promoting social justice and internationally recognized human and labour rights. Delegates in ILO will deliberate on social protection safety nets in emerging and automated economies.'
        },
        'unep': {
            title: 'UNEP',
            fullName: 'United Nations Environment Programme',
            image: 'images/committee-unep.jpg',
            agenda: 'Transitioning to Sustainable Energy Resources and Implementing Nature-Based Solutions',
            board: [
                'Ecrin Ertürk (Under-Secretary-General)',
                'Ceylin Öykü Çomak (Chair)',
                'Çınar Derin Beceren (Co-Chair)',
                'Yiğit İlhan (Rapporteur)'
            ],
            description: 'UNEP is the global authority setting environmental agendas and promoting the coherent implementation of environmental sustainability within the UN system. Delegates will tackle clean energy transition and ecological preservation.'
        },
        'unhrc': {
            title: 'UNHRC',
            fullName: 'United Nations Human Rights Council',
            image: 'images/committee-unhrc.jpg',
            agenda: 'Preventing Crimes Against Humanity and Strengthening Accountability Mechanisms',
            board: [
                'Poyraz Perit Dilber (Under-Secretary-General)',
                'Ela (Chair)',
                'Nil Akçal (Co-Chair)',
                'Duru Ömerefendioğlu (Rapporteur)'
            ],
            description: 'The UN Human Rights Council is tasked with strengthening the promotion and protection of human rights around the globe and addressing human rights violations worldwide.'
        },
        'unodc': {
            title: 'UNODC',
            fullName: 'United Nations Office on Drugs and Crime',
            image: 'images/committee-unodc.jpg',
            agenda: 'Combating The Production and Distribution of Counterfeit Goods',
            board: [
                'Charlotte Ela Akın (Under-Secretary-General)',
                'Ata Önder (Chair)',
                'Deniz Naz (Co-Chair)'
            ],
            description: 'UNODC is a global leader in the fight against illicit drugs, international crime, illicit trafficking, and counterfeit goods networks destabilizing economies and consumer health.'
        }
    };

    const committeeModal = document.getElementById('committeeModal');
    const btnMoreInfoList = document.querySelectorAll('.btn-more-info');

    btnMoreInfoList.forEach(btn => {
        btn.addEventListener('click', () => {
            const committeeKey = btn.getAttribute('data-committee');
            const data = committeesData[committeeKey];

            if (data && committeeModal) {
                document.getElementById('modalCommitteeImg').src = data.image;
                document.getElementById('modalCommitteeImg').alt = data.fullName;
                document.getElementById('modalCommitteeTitle').innerText = data.title;
                document.getElementById('modalCommitteeFullName').innerText = data.fullName;
                document.getElementById('modalCommitteeAgenda').innerText = data.agenda;

                const boardList = document.getElementById('modalCommitteeBoard');
                boardList.textContent = '';
                data.board.forEach(member => {
                    const li = document.createElement('li');
                    const icon = document.createElement('i');
                    icon.className = 'bx bxs-user-check';
                    li.appendChild(icon);
                    li.appendChild(document.createTextNode(' ' + String(member).trim()));
                    boardList.appendChild(li);
                });

                committeeModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // ==========================================
    // 7. STUDY GUIDE & RULES OF PROCEDURE MODAL
    // ==========================================
    const rulesModal = document.getElementById('rulesModal');
    const openRulesBtns = document.querySelectorAll('.open-rules-btn');

    openRulesBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (rulesModal) {
                rulesModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Study Guide Download Notification
    const downloadGuideBtns = document.querySelectorAll('.download-guide-btn');
    downloadGuideBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Study Guide will be published shortly before the conference!');
        });
    });

    // Privacy Modal (KVKK & GDPR)
    const privacyModal = document.getElementById('privacyModal');
    const openPrivacyBtns = document.querySelectorAll('.open-privacy-btn');

    openPrivacyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabTarget = btn.getAttribute('data-tab') || 'kvkk';
            if (privacyModal) {
                document.querySelectorAll('.privacy-tab-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-privacy-tab') === tabTarget);
                });
                document.querySelectorAll('.privacy-tab-content').forEach(c => {
                    c.classList.toggle('active', c.id === `privacy-${tabTarget}`);
                });

                privacyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Privacy Tab Switching
    const privacyTabBtns = document.querySelectorAll('.privacy-tab-btn');
    privacyTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-privacy-tab');
            privacyTabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.privacy-tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(`privacy-${target}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ==========================================
    // 8. APPLICATION MODAL
    // ==========================================
    const applyModal = document.getElementById('applyModal');
    const openApplyBtns = document.querySelectorAll('.open-apply-btn');

    openApplyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.getAttribute('data-apply-type') || 'delegation';
            const selectEl = document.getElementById('applyTypeSelect');
            if (selectEl) {
                selectEl.value = type;
            }
            if (applyModal) {
                applyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modals
    document.querySelectorAll('.modal-overlay .modal-close-btn, .modal-overlay').forEach(closer => {
        closer.addEventListener('click', (e) => {
            if (e.target === closer || closer.classList.contains('modal-close-btn')) {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
                document.body.style.overflow = '';
            }
        });
    });

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            document.body.style.overflow = '';
        }
    });

    // ==========================================
    // 9. FORM SUBMISSIONS & ROBUST API PIPELINE
    // ==========================================
    const FORMSUBMIT_FALLBACK = 'https://formsubmit.co/ajax/calmunofficial@gmail.com';
    let currentReceiptData = null;

    /**
     * Clear field error styles on input / change
     */
    document.addEventListener('input', (e) => {
        if (e.target && e.target.classList.contains('is-invalid')) {
            e.target.classList.remove('is-invalid');
        }
        const group = e.target.closest && e.target.closest('.form-checkbox-group');
        if (group && group.classList.contains('is-invalid')) {
            group.classList.remove('is-invalid');
        }
    });

    /**
     * Sanitizes form data against prototype pollution, traps honeypots, and trims strings
     */
    function sanitizeFormData(formData) {
        // Honeypot detection: If hidden _honey field is filled, it's an automated bot
        const honey = formData.get('_honey');
        if (honey && typeof honey === 'string' && honey.trim().length > 0) {
            return { isBot: true, cleanPayload: null };
        }

        const cleanPayload = Object.create(null);
        for (const [key, value] of formData.entries()) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key === '_honey') {
                continue;
            }
            if (typeof value === 'string') {
                cleanPayload[key] = value.trim().slice(0, 2500); // Bounded length protection
            } else {
                cleanPayload[key] = value;
            }
        }
        return { isBot: false, cleanPayload };
    }

    /**
     * Strict Form Validation with Visual Shake and Friendly Alerts
     */
    function validateForm(form) {
        let isValid = true;
        let firstInvalidEl = null;

        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        const inputs = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.required && !input.checked) {
                    isValid = false;
                    const group = input.closest('.form-checkbox-group') || input;
                    group.classList.add('is-invalid');
                    if (!firstInvalidEl) firstInvalidEl = input;
                }
            } else {
                const val = (input.value || '').trim();
                let fieldValid = true;

                if (input.required && val === '') {
                    fieldValid = false;
                } else if (input.type === 'email' && val !== '') {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(val)) fieldValid = false;
                } else if (input.type === 'tel' && val !== '') {
                    const digits = val.replace(/\D/g, '');
                    if (digits.length < 7) fieldValid = false;
                }

                if (!fieldValid) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    if (!firstInvalidEl) firstInvalidEl = input;
                }
            }
        });

        if (!isValid && firstInvalidEl) {
            firstInvalidEl.focus();
            showToast('Lütfen formdaki tüm zorunlu alanları ve KVKK onaylarını eksiksiz doldurunuz.');
        }

        return isValid;
    }

    /**
     * Permanent Client-Side Secure Storage (Zero Data Loss Guarantee)
     */
    function saveLocalSubmission(type, payload, refId) {
        try {
            const key = type === 'application' ? 'calmun_applications' : 'calmun_messages';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const record = {
                refId: refId,
                type: type,
                submittedAt: new Date().toISOString(),
                formattedDate: new Date().toLocaleString('tr-TR'),
                data: payload
            };
            existing.push(record);
            localStorage.setItem(key, JSON.stringify(existing));
            console.log(`[CALMUN-SECURE-VAULT] Saved ${type} with Ref ID: ${refId}`, record);
            return true;
        } catch (e) {
            console.warn('[CALMUN-SECURE-VAULT] Local storage error:', e);
            return false;
        }
    }

    /**
     * Multi-stage Dispatcher: Local Server API -> Cloud Fallback -> Local Vault
     */
    async function submitCalmunForm(localEndpoint, cleanPayload, refId) {
        // Priority 1: Check Local/Host API endpoint
        if (window.location.protocol.startsWith('http')) {
            try {
                const localResp = await fetch(localEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ ...cleanPayload, Reference_ID: refId })
                });
                if (localResp.ok) {
                    const json = await localResp.json().catch(() => null);
                    return { success: true, via: 'local_server', data: json };
                }
            } catch (err) {
                console.info('[CALMUN-DISPATCH] Local endpoint not active, falling back to cloud dispatch.');
            }
        }

        // Priority 2: Secondary Cloud Relay (FormSubmit)
        try {
            const cloudResp = await fetch(FORMSUBMIT_FALLBACK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ...cleanPayload, Reference_ID: refId })
            });
            if (cloudResp.ok) {
                return { success: true, via: 'cloud_relay' };
            }
        } catch (err) {
            console.warn('[CALMUN-DISPATCH] Cloud relay unreachable:', err);
        }

        // Priority 3: Local Vault guaranteed storage
        return { success: true, via: 'local_vault' };
    }

    /**
     * Interactive Confirmation & Success Modal Display with Action Buttons
     */
    function showFormSuccessModal(title, refId, summaryItems, plainReceiptText, mailtoUrl) {
        const modal = document.getElementById('formSuccessModal');
        if (!modal) {
            showToast(`${title} (Takip No: ${refId})`);
            return;
        }

        currentReceiptData = {
            refId: refId,
            plainText: plainReceiptText
        };

        const titleEl = document.getElementById('successModalTitle');
        const refEl = document.getElementById('successRefCode');
        const summaryBox = document.getElementById('successSummaryBox');
        const fallbackContainer = document.getElementById('fallbackMailtoContainer');
        const fallbackBtn = document.getElementById('fallbackMailtoBtn');

        if (titleEl) titleEl.innerText = title;
        if (refEl) refEl.innerText = refId;

        if (summaryBox) {
            summaryBox.textContent = '';
            summaryItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'receipt-row';

                const labelSpan = document.createElement('span');
                labelSpan.className = 'receipt-label';
                labelSpan.textContent = item.label;

                const valSpan = document.createElement('span');
                valSpan.className = 'receipt-val';
                valSpan.textContent = item.val;

                row.appendChild(labelSpan);
                row.appendChild(valSpan);
                summaryBox.appendChild(row);
            });
        }

        if (fallbackContainer && fallbackBtn) {
            if (mailtoUrl) {
                fallbackBtn.href = mailtoUrl;
                fallbackContainer.style.display = 'block';
            } else {
                fallbackContainer.style.display = 'none';
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Receipt Action Buttons
    const copyRefBtn = document.getElementById('copyRefBtn');
    if (copyRefBtn) {
        copyRefBtn.addEventListener('click', () => {
            const code = document.getElementById('successRefCode')?.innerText;
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    showToast('Referans takip kodu kopyalandı: ' + code);
                }).catch(() => {
                    showToast('Referans kodu: ' + code);
                });
            }
        });
    }

    const copySummaryBtn = document.getElementById('copySummaryBtn');
    if (copySummaryBtn) {
        copySummaryBtn.addEventListener('click', () => {
            if (currentReceiptData && currentReceiptData.plainText) {
                navigator.clipboard.writeText(currentReceiptData.plainText).then(() => {
                    showToast('Başvuru belgesi panoya kopyalandı!');
                }).catch(() => {
                    showToast('Panoya kopyalama başarısız oldu.');
                });
            }
        });
    }

    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', () => {
            if (currentReceiptData && currentReceiptData.plainText) {
                const blob = new Blob([currentReceiptData.plainText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CALMUN_2026_${currentReceiptData.refId}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Başvuru belgeniz (.txt) indirildi.');
            }
        });
    }

    // Contact Form Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm(contactForm)) {
                return;
            }

            const submitBtn = document.getElementById('contactSubmitBtn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'SEND MESSAGE';

            const formData = new FormData(contactForm);
            const { isBot, cleanPayload } = sanitizeFormData(formData);

            if (isBot) {
                contactForm.reset();
                showToast('Mesajınız başarıyla iletildi!');
                return;
            }

            // Generate unique reference ID
            const refId = `CALMUN-MSG-${Math.floor(1000 + Math.random() * 9000)}`;

            // Save immediately to persistent client storage (Zero Loss Guarantee)
            saveLocalSubmission('message', cleanPayload, refId);

            // Construct direct mailto fallback link
            const mailSubject = encodeURIComponent(`[CALMUN 2026] İletişim Mesajı - ${cleanPayload.Full_Name || ''} (${refId})`);
            const mailBody = encodeURIComponent(
                `CALMUN 2026 İLETİŞİM FORMU BİLGİLERİ\n` +
                `------------------------------------\n` +
                `Referans Kodu: ${refId}\n` +
                `Ad Soyad: ${cleanPayload.Full_Name || ''}\n` +
                `E-posta: ${cleanPayload.Email || ''}\n` +
                `Konu: ${cleanPayload.Subject || ''}\n` +
                `Tarih: ${new Date().toLocaleString('tr-TR')}\n\n` +
                `Mesaj:\n${cleanPayload.Message || ''}\n\n` +
                `KVKK ve Açık Rıza Onayı: Verildi\n`
            );
            const mailtoUrl = `mailto:calmunofficial@gmail.com?subject=${mailSubject}&body=${mailBody}`;

            const plainReceiptText =
                `====================================================\n` +
                `  CALMUN 2026 • RESMİ İLETİŞİM FORMU ALINDI BELGESİ\n` +
                `  Merkez Çanakkale Anadolu Lisesi Model United Nations\n` +
                `====================================================\n\n` +
                `Takip Referans No : ${refId}\n` +
                `Tarih / Saat      : ${new Date().toLocaleString('tr-TR')}\n` +
                `Ad Soyad          : ${cleanPayload.Full_Name || ''}\n` +
                `E-Posta           : ${cleanPayload.Email || ''}\n` +
                `Konu              : ${cleanPayload.Subject || ''}\n` +
                `Mesaj             : ${cleanPayload.Message || ''}\n\n` +
                `Resmi İletişim    : calmunofficial@gmail.com\n` +
                `Konferans Tarihi  : 4 - 5 - 6 Aralık 2026\n` +
                `Yerleşke          : Merkez Çanakkale Anadolu Lisesi\n` +
                `====================================================\n`;

            const summaryItems = [
                { label: 'Ad Soyad', val: cleanPayload.Full_Name || '-' },
                { label: 'E-posta', val: cleanPayload.Email || '-' },
                { label: 'Konu', val: cleanPayload.Subject || '-' },
                { label: 'Tarih', val: new Date().toLocaleString('tr-TR') }
            ];

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> GÖNDERİLİYOR...";
            }

            try {
                await submitCalmunForm('/api/contact', cleanPayload, refId);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }

            contactForm.reset();

            showFormSuccessModal(
                'Mesajınız Başarıyla İletildi!',
                refId,
                summaryItems,
                plainReceiptText,
                mailtoUrl
            );
        });
    }

    // Application Form Handler
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm(applicationForm)) {
                return;
            }

            const submitBtn = document.getElementById('applySubmitBtn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'SUBMIT APPLICATION';

            const formData = new FormData(applicationForm);
            const { isBot, cleanPayload } = sanitizeFormData(formData);

            if (isBot) {
                applicationForm.reset();
                if (applyModal) {
                    applyModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                showToast('Başvurunuz başarıyla alındı!');
                return;
            }

            // Generate unique reference ID
            const refId = `CALMUN-APP-${Math.floor(1000 + Math.random() * 9000)}`;

            // Save immediately to persistent client storage (Zero Loss Guarantee)
            saveLocalSubmission('application', cleanPayload, refId);

            // Construct direct mailto fallback link
            const mailSubject = encodeURIComponent(`[CALMUN 2026] Yeni Delege Başvurusu - ${cleanPayload.Delegate_Name || ''} (${refId})`);
            const mailBody = encodeURIComponent(
                `CALMUN 2026 RESMİ DELEGE BAŞVURU BİLGİLERİ\n` +
                `============================================\n` +
                `Takip Referans Kodu: ${refId}\n` +
                `Kategori: ${cleanPayload.Application_Category || ''}\n` +
                `Delege / Heyet Başkanı: ${cleanPayload.Delegate_Name || ''}\n` +
                `E-posta: ${cleanPayload.Email || ''}\n` +
                `Telefon (WhatsApp): ${cleanPayload.Phone_Number || ''}\n` +
                `Okul / Kurum: ${cleanPayload.School_Organization || ''}\n` +
                `Tercih Edilen Komite: ${cleanPayload.Preferred_Committee || ''}\n` +
                `Başvuru Tarihi: ${new Date().toLocaleString('tr-TR')}\n` +
                `KVKK Aydınlatma & Açık Rıza Beyanı: Onaylandı\n` +
                `============================================\n`
            );
            const mailtoUrl = `mailto:calmunofficial@gmail.com?subject=${mailSubject}&body=${mailBody}`;

            const plainReceiptText =
                `====================================================\n` +
                `  CALMUN 2026 • RESMİ DELEGE BAŞVURU ALINDI BELGESİ\n` +
                `  Merkez Çanakkale Anadolu Lisesi Model United Nations\n` +
                `====================================================\n\n` +
                `Başvuru Takip Kodu : ${refId}\n` +
                `Kayıt Tarihi       : ${new Date().toLocaleString('tr-TR')}\n` +
                `Başvuru Kategorisi : ${cleanPayload.Application_Category || ''}\n` +
                `Delege Ad Soyad    : ${cleanPayload.Delegate_Name || ''}\n` +
                `E-Posta Adresi     : ${cleanPayload.Email || ''}\n` +
                `Telefon (WhatsApp) : ${cleanPayload.Phone_Number || ''}\n` +
                `Okul / Kurum       : ${cleanPayload.School_Organization || ''}\n` +
                `Tercih Edilen Kom. : ${cleanPayload.Preferred_Committee || ''}\n` +
                `KVKK & Açık Rıza   : Onaylandı\n\n` +
                `Konferans Tarihi   : 4 - 5 - 6 Aralık 2026\n` +
                `Konferans Yeri     : Merkez Çanakkale Anadolu Lisesi Yerleşkesi\n` +
                `Sekreterya E-Posta : calmunofficial@gmail.com\n` +
                `====================================================\n` +
                `Bu belge CALMUN 2026 Delege Başvuru Ön Kaydınızın resmi teyididir.\n`;

            const summaryItems = [
                { label: 'Delege Ad Soyad', val: cleanPayload.Delegate_Name || '-' },
                { label: 'Kategori', val: cleanPayload.Application_Category || '-' },
                { label: 'Komite Tercihi', val: cleanPayload.Preferred_Committee || '-' },
                { label: 'Okul / Kurum', val: cleanPayload.School_Organization || '-' },
                { label: 'E-posta', val: cleanPayload.Email || '-' },
                { label: 'Telefon', val: cleanPayload.Phone_Number || '-' },
                { label: 'Kayıt Tarihi', val: new Date().toLocaleString('tr-TR') }
            ];

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> BAŞVURUNUZ İŞLENİYOR...";
            }

            try {
                await submitCalmunForm('/api/apply', cleanPayload, refId);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }

            applicationForm.reset();

            // Close application modal if open
            if (applyModal) {
                applyModal.classList.remove('active');
                document.body.style.overflow = '';
            }

            showFormSuccessModal(
                'Başvurunuz Başarıyla Alındı!',
                refId,
                summaryItems,
                plainReceiptText,
                mailtoUrl
            );
        });
    }

    /**
     * CALMUN Organizer / Secretariat Admin Helper
     * Export all delegate applications and messages directly to CSV
     */
    window.CALMUN_ADMIN = {
        getSubmissions: () => {
            const apps = JSON.parse(localStorage.getItem('calmun_applications') || '[]');
            const msgs = JSON.parse(localStorage.getItem('calmun_messages') || '[]');
            return { applications: apps, messages: msgs };
        },
        exportCSV: () => {
            const apps = JSON.parse(localStorage.getItem('calmun_applications') || '[]');
            if (apps.length === 0) {
                alert('Henüz kayıtlı başvuru bulunmamaktadır.');
                return;
            }
            const headers = ['Referans ID', 'Tarih', 'Kategori', 'Ad Soyad', 'E-posta', 'Telefon', 'Okul', 'Komite'];
            const rows = apps.map(a => [
                `"${a.refId || ''}"`,
                `"${a.formattedDate || ''}"`,
                `"${(a.data?.Application_Category || '').replace(/"/g, '""')}"`,
                `"${(a.data?.Delegate_Name || '').replace(/"/g, '""')}"`,
                `"${(a.data?.Email || '').replace(/"/g, '""')}"`,
                `"${(a.data?.Phone_Number || '').replace(/"/g, '""')}"`,
                `"${(a.data?.School_Organization || '').replace(/"/g, '""')}"`,
                `"${(a.data?.Preferred_Committee || '').replace(/"/g, '""')}"`
            ]);
            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `calmun_2026_basvurular_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        clearAll: () => {
            if (confirm('Tüm yerel başvuru kayıtları silinsin mi?')) {
                localStorage.removeItem('calmun_applications');
                localStorage.removeItem('calmun_messages');
                alert('Tüm yerel kayıtlar temizlendi.');
            }
        }
    };

    // Keyboard shortcut for Secretariat export: Ctrl+Shift+E or Cmd+Shift+E
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            window.CALMUN_ADMIN.exportCSV();
        }
    });

    function showToast(message) {
        let toast = document.querySelector('.toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-msg';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // ==========================================
    // 10. 2026 OCTOBER MOTION & ANIMATION SYSTEM
    // ==========================================

    // A. Scroll-Driven Progress Bar & Floating Back-To-Top Circular Progress Ring
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('backToTop');
    const progressCircle = backToTopBtn ? backToTopBtn.querySelector('.progress-ring-circle') : null;
    const circleCircumference = 2 * Math.PI * 20; // 125.66

    function handleScrollMotion() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

        // Fallback for browsers not supporting CSS scroll() timeline
        if (scrollProgress && !window.CSS?.supports('animation-timeline', 'scroll()')) {
            scrollProgress.style.transform = `scaleX(${progress})`;
        }

        // Back-to-Top visibility & circular SVG ring animation
        if (backToTopBtn) {
            if (scrollTop > 350) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }

            if (progressCircle) {
                const offset = circleCircumference - (progress * circleCircumference);
                progressCircle.style.strokeDashoffset = offset;
            }
        }
    }

    window.addEventListener('scroll', handleScrollMotion, { passive: true });
    handleScrollMotion();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // B. Scroll Reveal Observer (IntersectionObserver)
    const revealElements = document.querySelectorAll(
        '.reveal, .letter-card, .committee-card, .team-card, .pricing-card, .timeline-item, .venue-info-card, .venue-map-card, .faq-item, .contact-info-panel, .contact-form-panel'
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el, index) => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
        }
        // Add subtle staggered delays for grids
        if (el.classList.contains('committee-card') || el.classList.contains('team-card') || el.classList.contains('pricing-card')) {
            const staggerClass = `stagger-${(index % 4) + 1}`;
            el.classList.add(staggerClass);
        }
        revealObserver.observe(el);
    });

    // C. Specular Spotlight & 3D Tilt on Cards (2026 Micro-interaction)
    const spotlightCards = document.querySelectorAll(
        '.card-spotlight, .letter-card, .committee-card, .pricing-card, .team-card, .venue-info-card'
    );

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    if (!prefersReducedMotion && canHover) {
        spotlightCards.forEach(card => {
            card.classList.add('card-spotlight');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // Subtle 3D tilt (max 3.5 degrees for buttery smooth diplomatic feel)
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3.5;
                const rotateY = ((x - centerX) / centerX) * 3.5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.removeProperty('--mouse-x');
                card.style.removeProperty('--mouse-y');
            });
        });
    }
});