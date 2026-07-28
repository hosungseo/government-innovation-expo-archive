(() => {
  const siteHeader = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
    siteHeader?.classList.toggle('is-compact', window.scrollY > 72);
  };
  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate);
  updateProgress();

  const menuButton = document.querySelector('.menu-button');
  const menuLabel = menuButton?.querySelector('.sr-only');
  const nav = document.querySelector('.site-nav');
  const setMenuOpen = (isOpen) => {
    menuButton?.setAttribute('aria-expanded', String(isOpen));
    nav?.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    if (menuLabel) menuLabel.textContent = isOpen ? '메뉴 닫기' : '메뉴 열기';
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
    setMenuOpen(false);
    menuButton.focus();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840 && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
    }
  });

  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const linkedSections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (!visibleEntry) return;
      linkedSections.forEach(({ link, section }) => {
        if (section === visibleEntry.target) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
    linkedSections.forEach(({ section }) => navObserver.observe(section));
  }

  const deadline = new Date('2026-08-12T00:00:00+09:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((deadline - today) / 86400000);
  const deadlineText = document.querySelector('#deadline-text');
  if (deadlineText) {
    deadlineText.innerHTML = days > 1
      ? `마감일까지 <strong>${days}일</strong>`
      : days === 1
        ? '마감일까지 <strong>1일</strong>'
        : days === 0
          ? '오늘 <strong>마감</strong>'
          : '<strong>수요조사가 마감되었습니다</strong>';
  }

  const mailUser = ['tigercastle'].join('');
  const mailDomain = ['korea', 'kr'].join('.');
  const email = `${mailUser}@${mailDomain}`;
  const subject = '[2026 정부혁신박람회] 수요조사 문의 -';
  const body = ['기관명:', '문의 유형: (참여 대상 / 콘텐츠 요건 / 제출 방법 / 기타)', '문의 내용:'].join('\n');
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const emailLink = document.querySelector('#contact-email');
  const emailButton = document.querySelector('#email-button');
  if (emailLink && emailButton) {
    emailLink.textContent = email;
    emailLink.href = mailto;
    emailButton.href = mailto;
  }

  const copyButton = document.querySelector('#copy-email');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = '복사되었습니다';
    } catch {
      window.prompt('아래 메일 주소를 복사하세요.', email);
    }
    window.setTimeout(() => { copyButton.textContent = '주소 복사'; }, 1800);
  });

  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 55}ms`;
      observer.observe(item);
    });
  } else {
    items.forEach((item) => item.classList.add('is-visible'));
  }
})();
