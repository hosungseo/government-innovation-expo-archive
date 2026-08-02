(() => {
  const siteHeader = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress span');
  let progressFrame = 0;

  const updateProgress = () => {
    progressFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
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
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  const mobileMenuQuery = window.matchMedia('(max-width: 840px)');
  const headerFocusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const isMenuOpen = () => menuButton?.getAttribute('aria-expanded') === 'true';
  const setPageContentInert = (isInert) => {
    [main, footer].forEach((element) => {
      if (!element) return;
      if (isInert) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    });
  };

  const setMenuOpen = (isOpen, { restoreFocus = false } = {}) => {
    const shouldOpen = Boolean(isOpen && mobileMenuQuery.matches);
    menuButton?.setAttribute('aria-expanded', String(shouldOpen));
    nav?.classList.toggle('is-open', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
    setPageContentInert(shouldOpen);
    if (menuLabel) menuLabel.textContent = shouldOpen ? '메뉴 닫기' : '메뉴 열기';

    if (shouldOpen) {
      window.requestAnimationFrame(() => nav?.querySelector('a')?.focus());
    } else if (restoreFocus) {
      menuButton?.focus();
    }
  };

  menuButton?.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) {
      setMenuOpen(false, { restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab' || !isMenuOpen() || !mobileMenuQuery.matches || !siteHeader) return;
    const focusable = [...siteHeader.querySelectorAll(headerFocusableSelector)]
      .filter((element) => !element.hasAttribute('hidden') && element.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (!mobileMenuQuery.matches && isMenuOpen()) setMenuOpen(false);
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
        if (section === visibleEntry.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
    linkedSections.forEach(({ section }) => navObserver.observe(section));
  }

  const deadlineCard = document.querySelector('[data-deadline-start][data-deadline-end]');
  const deadlineText = document.querySelector('#deadline-text');
  const surveyTimeline = document.querySelector('[data-survey-timeline]');
  const surveyStatus = document.querySelector('#survey-status');
  const dayMilliseconds = 86400000;
  const kstOffsetMilliseconds = 9 * 60 * 60 * 1000;
  const dateToKstDay = (date) => Math.floor((date.getTime() + kstOffsetMilliseconds) / dayMilliseconds);
  const isoDateToKstDay = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return Math.floor((Date.UTC(year, month - 1, day) + kstOffsetMilliseconds) / dayMilliseconds);
  };
  const appendDeadlineText = (prefix, emphasis) => {
    if (!deadlineText) return;
    const strong = document.createElement('strong');
    strong.textContent = emphasis;
    deadlineText.replaceChildren(document.createTextNode(prefix), strong);
  };

  if (deadlineCard) {
    const startDay = isoDateToKstDay(deadlineCard.dataset.deadlineStart);
    const endDay = isoDateToKstDay(deadlineCard.dataset.deadlineEnd);
    const today = dateToKstDay(new Date());
    const daysUntilStart = startDay - today;
    const daysUntilDeadline = endDay - today;

    if (daysUntilStart > 0) {
      appendDeadlineText('수요조사 시작까지 ', `${daysUntilStart}일`);
      surveyTimeline?.classList.remove('active');
      if (surveyStatus) surveyStatus.textContent = '예정';
    } else if (daysUntilDeadline > 1) {
      appendDeadlineText('마감일까지 ', `${daysUntilDeadline}일`);
      surveyTimeline?.classList.add('active');
      if (surveyStatus) surveyStatus.textContent = '진행 중';
    } else if (daysUntilDeadline === 1) {
      appendDeadlineText('마감일까지 ', '1일');
      surveyTimeline?.classList.add('active');
      if (surveyStatus) surveyStatus.textContent = '진행 중';
    } else if (daysUntilDeadline === 0) {
      appendDeadlineText('오늘 ', '마감');
      surveyTimeline?.classList.add('active');
      if (surveyStatus) surveyStatus.textContent = '오늘 마감';
    } else {
      appendDeadlineText('', '수요조사가 마감되었습니다');
      surveyTimeline?.classList.remove('active');
      if (surveyStatus) surveyStatus.textContent = '마감';
    }
  }

  const mailUser = 'tigercastle';
  const mailDomain = 'korea.kr';
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
  const copyStatus = document.querySelector('#copy-status');
  let copyResetTimer = 0;
  const announceCopyResult = (buttonLabel, message) => {
    if (!copyButton) return;
    window.clearTimeout(copyResetTimer);
    copyButton.textContent = buttonLabel;
    if (copyStatus) copyStatus.textContent = message;
    copyResetTimer = window.setTimeout(() => {
      copyButton.textContent = '주소 복사';
      if (copyStatus) copyStatus.textContent = '';
    }, 1800);
  };

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      announceCopyResult('복사되었습니다', '메일 주소를 클립보드에 복사했습니다.');
    } catch {
      window.prompt('아래 메일 주소를 복사하세요.', email);
      announceCopyResult('주소를 표시했습니다', '메일 주소를 복사할 수 있도록 창에 표시했습니다.');
    }
  });

  const archiveControls = document.querySelector('#archive-controls');
  const archiveSearch = document.querySelector('#archive-search');
  const archiveClear = document.querySelector('#archive-clear');
  const archiveFilters = [...document.querySelectorAll('[data-archive-filter]')];
  const archiveRecords = [...document.querySelectorAll('[data-archive-record]')];
  const archiveEmpty = document.querySelector('#archive-empty');
  const archiveResults = document.querySelector('#archive-results');
  let activeArchiveFilter = 'all';

  const normalizeSearchText = (value) => value.normalize('NFC').toLocaleLowerCase('ko-KR').trim();
  const updateArchiveResults = () => {
    if (!archiveSearch || !archiveResults) return;
    const query = normalizeSearchText(archiveSearch.value);
    let shown = 0;

    archiveRecords.forEach((record) => {
      const matchesFilter = activeArchiveFilter === 'all' || record.dataset.status === activeArchiveFilter;
      const matchesQuery = !query || normalizeSearchText(record.dataset.search || '').includes(query);
      const isVisible = matchesFilter && matchesQuery;
      record.hidden = !isVisible;
      if (isVisible) shown += 1;
    });

    if (archiveEmpty) archiveEmpty.hidden = shown !== 0;
    archiveResults.textContent = shown
      ? `${shown}건의 기록을 표시하고 있습니다.`
      : '검색 조건에 맞는 기록이 없습니다.';
  };

  if (archiveControls && archiveSearch && archiveRecords.length) {
    archiveControls.hidden = false;
    archiveControls.addEventListener('submit', (event) => event.preventDefault());
    archiveSearch.addEventListener('input', updateArchiveResults);
    archiveClear?.addEventListener('click', () => {
      archiveSearch.value = '';
      archiveSearch.focus();
      updateArchiveResults();
    });
    archiveFilters.forEach((filter) => {
      filter.addEventListener('click', () => {
        activeArchiveFilter = filter.dataset.archiveFilter || 'all';
        archiveFilters.forEach((button) => {
          button.setAttribute('aria-pressed', String(button === filter));
        });
        updateArchiveResults();
      });
    });
    updateArchiveResults();
  }

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

/* Vanilla ports of component-library motion (split text, number ticker, timeline draw) */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const heroTitle = document.querySelector('#hero-title');
  if (heroTitle && !reduceMotion) {
    let charIndex = 0;
    heroTitle.querySelectorAll('span, em').forEach((part) => {
      const chars = [...part.textContent];
      part.textContent = '';
      chars.forEach((ch) => {
        const piece = document.createElement('i');
        piece.className = 'split-char';
        piece.style.setProperty('--i', charIndex++);
        piece.textContent = ch;
        part.appendChild(piece);
      });
    });
    heroTitle.classList.add('split-ready');
  }

  const ticks = document.querySelectorAll('[data-tick]');
  if (ticks.length && 'IntersectionObserver' in window && !reduceMotion) {
    const run = (el) => {
      const target = Number(el.dataset.tick);
      const started = performance.now();
      const duration = 1100;
      const frame = (now) => {
        const t = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const tickObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); tickObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    ticks.forEach((el) => tickObserver.observe(el));
  }

  const timeline = document.querySelector('.timeline');
  if (timeline && 'IntersectionObserver' in window && !reduceMotion) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { timeline.classList.add('is-drawn'); lineObserver.disconnect(); }
      });
    }, { threshold: 0.4 });
    lineObserver.observe(timeline);
  } else if (timeline) {
    timeline.classList.add('is-drawn');
  }
})();
