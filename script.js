(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const toast = document.querySelector(".toast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function startPreloader() {
    const loader = document.querySelector(".preloader");
    const counter = document.querySelector(".boot-percent span");
    const duration = prefersReducedMotion.matches ? 100 : 1250;
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      counter.textContent = String(Math.round(progress * 100)).padStart(2, "0");
      if (progress >= 1) window.clearInterval(progressTimer);
    }, 40);
    window.setTimeout(() => {
      window.clearInterval(progressTimer);
      counter.textContent = "100";
      loader.classList.add("is-done");
    }, duration + 180);
  }

  function setupTheme() {
    const toggle = document.querySelector(".theme-toggle");
    const label = toggle.querySelector(".theme-label");
    const icon = toggle.querySelector(".theme-icon");
    const saved = localStorage.getItem("somanath-theme");

    function setTheme(theme) {
      const isLight = theme === "light";
      root.dataset.theme = isLight ? "light" : "dark";
      toggle.setAttribute("aria-pressed", String(isLight));
      toggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
      label.textContent = isLight ? "DARK" : "LIGHT";
      icon.textContent = isLight ? "☼" : "◐";
      localStorage.setItem("somanath-theme", isLight ? "light" : "dark");
    }

    setTheme(saved === "light" ? "light" : "dark");
    toggle.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light"));
  }

  function setupNavigation() {
    const menu = document.querySelector(".menu-toggle");
    const navPanel = document.querySelector(".nav-right");
    const navLinks = [...document.querySelectorAll(".nav-links a")];
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    menu.addEventListener("click", () => {
      const isOpen = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(isOpen));
      menu.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      navPanel.classList.toggle("open", isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menu.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-label", "Open navigation");
        navPanel.classList.remove("open");
      });
    });

    if ("IntersectionObserver" in window) {
      const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-28% 0px -62% 0px", threshold: 0 });
      sections.forEach((section) => activeObserver.observe(section));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navPanel.classList.contains("open")) {
        menu.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-label", "Open navigation");
        navPanel.classList.remove("open");
        menu.focus();
      }
    });
  }

  function setupFieldScan() {
    const control = document.querySelector(".scan-control");
    const status = control.querySelector("[data-scan-status]");
    let scanTimer;

    control.addEventListener("click", () => {
      if (control.classList.contains("scanning")) return;
      window.clearTimeout(scanTimer);
      control.classList.add("scanning");
      control.setAttribute("aria-busy", "true");
      status.textContent = "SCANNING FIELD...";
      scanTimer = window.setTimeout(() => {
        status.textContent = "SIGNAL LOCKED";
        showToast("Field scan complete — signal looks clear.");
        scanTimer = window.setTimeout(() => {
          control.classList.remove("scanning");
          control.removeAttribute("aria-busy");
          status.textContent = "NETWORK READY";
        }, 1800);
      }, prefersReducedMotion.matches ? 0 : 1100);
    });
  }

  function setupScrollEffects() {
    const progress = document.querySelector(".scroll-progress span");
    const backToTop = document.querySelector(".back-to-top");
    let scheduled = false;

    function update() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      progress.style.width = `${percentage}%`;
      backToTop.classList.toggle("visible", window.scrollY > 650);
      scheduled = false;
    }

    window.addEventListener("scroll", () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "instant" : "smooth" }));

    const revealTargets = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealTargets.forEach((target) => revealObserver.observe(target));
    } else {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    }

    const timeline = document.querySelector(".timeline");
    if ("IntersectionObserver" in window && timeline) {
      const timelineObserver = new IntersectionObserver(([entry], observer) => {
        if (entry.isIntersecting) {
          timeline.classList.add("is-drawn");
          observer.disconnect();
        }
      }, { threshold: 0.12 });
      timelineObserver.observe(timeline);
    } else if (timeline) {
      timeline.classList.add("is-drawn");
    }

    const stats = document.querySelector(".stats-row");
    const counters = [...document.querySelectorAll("[data-count]")];
    function countUp(element) {
      const target = Number(element.dataset.count);
      const duration = prefersReducedMotion.matches ? 1 : 900;
      const start = performance.now();
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window && stats) {
      const statObserver = new IntersectionObserver(([entry], observer) => {
        if (entry.isIntersecting) {
          counters.forEach(countUp);
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      statObserver.observe(stats);
    } else {
      counters.forEach(countUp);
    }
  }

  function setupTyping() {
    const target = document.querySelector(".typing-role");
    const roles = ["Python Developer", "Backend Engineer", "Cybersecurity Learner", "FastAPI Builder"];
    if (prefersReducedMotion.matches) {
      target.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;

    function tick() {
      const current = roles[roleIndex];
      target.textContent = current.slice(0, characterIndex);
      if (deleting) {
        characterIndex -= 1;
        if (characterIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          window.setTimeout(tick, 220);
          return;
        }
        window.setTimeout(tick, 42);
      } else {
        characterIndex += 1;
        if (characterIndex > roles[roleIndex].length) {
          deleting = true;
          window.setTimeout(tick, 1550);
          return;
        }
        window.setTimeout(tick, 68);
      }
    }

    window.setTimeout(tick, 2100);
  }

  function setupCanvas() {
    const canvas = document.querySelector(".ambient-canvas");
    const context = canvas.getContext("2d");
    if (!context || prefersReducedMotion.matches) return;

    const points = [];
    const pointer = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let animationFrame;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(60, Math.floor((width * height) / 24000));
      points.length = 0;
      for (let index = 0; index < count; index += 1) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * 0.16,
          dy: (Math.random() - 0.5) * 0.16,
          radius: Math.random() * 1.3 + 0.5
        });
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
      points.forEach((point, index) => {
        const dx = pointer.x - point.x;
        const dy = pointer.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 150 && distance > 0) {
          point.x -= (dx / distance) * 0.18;
          point.y -= (dy / distance) * 0.18;
        }
        point.x += point.dx;
        point.y += point.dy;
        if (point.x < 0 || point.x > width) point.dx *= -1;
        if (point.y < 0 || point.y > height) point.dy *= -1;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = accent;
        context.globalAlpha = 0.27;
        context.fill();
        for (let next = index + 1; next < points.length; next += 1) {
          const neighbor = points[next];
          const gap = Math.hypot(point.x - neighbor.x, point.y - neighbor.y);
          if (gap < 105) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(neighbor.x, neighbor.y);
            context.strokeStyle = accent;
            context.globalAlpha = (1 - gap / 105) * 0.075;
            context.stroke();
          }
        }
      });
      context.globalAlpha = 1;
      animationFrame = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { pointer.x = -1000; pointer.y = -1000; });
    resize();
    draw();
    window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame), { once: true });
  }

  function setupCursorAndParallax() {
    const cursor = document.querySelector(".cursor-glow");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const imageFrame = document.querySelector("[data-parallax]");
    if (!finePointer) return;

    window.addEventListener("pointermove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add("visible");
    }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.remove("visible"));
    document.querySelectorAll("a, button, [role='button'], .cert-card").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("hovering"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("hovering"));
    });

    if (imageFrame && !prefersReducedMotion.matches) {
      imageFrame.addEventListener("pointermove", (event) => {
        const bounds = imageFrame.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        imageFrame.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
      });
      imageFrame.addEventListener("pointerleave", () => { imageFrame.style.transform = ""; });
    }
  }

  function setupMagneticAndRipple() {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    document.querySelectorAll(".magnetic").forEach((element) => {
      if (finePointer && !prefersReducedMotion.matches) {
        element.addEventListener("pointermove", (event) => {
          const bounds = element.getBoundingClientRect();
          const dx = event.clientX - bounds.left - bounds.width / 2;
          const dy = event.clientY - bounds.top - bounds.height / 2;
          element.style.transform = `translate(${dx * 0.08}px, ${dy * 0.1}px)`;
        });
        element.addEventListener("pointerleave", () => { element.style.transform = ""; });
      }
    });

    document.querySelectorAll("button, .action").forEach((element) => {
      element.addEventListener("click", (event) => {
        const bounds = element.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${event.clientX ? event.clientX - bounds.left : bounds.width / 2}px`;
        ripple.style.top = `${event.clientY ? event.clientY - bounds.top : bounds.height / 2}px`;
        element.append(ripple);
        window.setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  const projects = {
    erp: {
      title: "Smart ERP System",
      description: "A role-aware campus dashboard for student records, attendance, and academic data. Built around Flask REST endpoints, structured database storage, and separate admin and student experiences.",
      tags: ["Python", "Flask", "REST API", "MySQL", "SQLite", "HTML", "CSS", "JavaScript"],
      caseStudy: [
        ["Scope", "Manage student records, attendance, and academic data in a web-based ERP."],
        ["Structure", "Flask REST APIs connect the dashboard to a MySQL or SQLite database."],
        ["Access model", "Admin and student roles use role-based access control."],
        ["Build focus", "Responsive dashboard, session management, and a structured database schema."]
      ]
    },
    events: {
      title: "Event Management System",
      description: "A complete event flow covering organizer event creation, attendee registration, and bookings. Flask and MySQL support the application data and role-aware workflows.",
      tags: ["Python", "Flask", "MySQL", "HTML", "CSS", "JavaScript", "Authentication"],
      caseStudy: [
        ["Scope", "Bring event creation, registration, and booking into one web platform."],
        ["Structure", "Flask handles backend workflows and MySQL stores event, user, and booking records."],
        ["Access model", "Authentication and role-based access distinguish organizers and attendees."],
        ["Build focus", "Connecting the organizer and attendee journeys through a complete booking flow."]
      ]
    },
    kali: {
      title: "Kali Linux Cybersecurity Toolkit",
      description: "Python-based helpers for authorized network reconnaissance and security testing in a controlled lab. Project work includes Nmap scanning, Wi-Fi security practice with Aircrack-ng, and traffic analysis with Wireshark.",
      tags: ["Python", "Kali Linux", "Nmap", "Aircrack-ng", "Wireshark", "Networking"],
      caseStudy: [
        ["Scope", "Practice network reconnaissance and vulnerability-scanning concepts in an authorized lab."],
        ["Structure", "Python command-line helpers work with Nmap, Aircrack-ng, and Wireshark."],
        ["Safety boundary", "Wi-Fi security testing and traffic analysis are for owned or explicitly authorized lab environments."],
        ["Build focus", "Automating repeatable tool workflows while learning networking and security fundamentals."]
      ]
    },
    "python-tools": {
      title: "Python-based Tools",
      description: "A collection of practical Python scripts and experiments designed to make repeatable tasks easier to run, inspect, and improve.",
      tags: ["Python", "CLI", "Linux", "Automation", "Problem solving"],
      caseStudy: [
        ["Scope", "Build small Python helpers for practical, repeatable tasks."],
        ["Structure", "Command-line scripts keep workflows usable from a terminal."],
        ["Build focus", "Practice modular scripting, input handling, and clear output."],
        ["Next step", "Continue adding practical tools as projects are developed."]
      ]
    }
  };

  function setupProjects() {
    const filters = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");
    const dialog = document.querySelector(".project-dialog");
    const dialogTitle = dialog.querySelector("#dialog-title");
    const description = dialog.querySelector(".dialog-description");
    const tagList = dialog.querySelector(".dialog-tags");
    const caseStudyList = dialog.querySelector(".case-study-sections");
    const closeButton = dialog.querySelector(".dialog-close");
    const projectLinkButtons = dialog.querySelectorAll(".dialog-actions button");
    const search = document.querySelector("#project-search");
    const caseModeButton = document.querySelector(".case-mode-toggle");
    const projectGrid = document.querySelector(".project-grid");
    const emptyMessage = document.querySelector(".project-empty");
    let activeFilter = "all";

    function updateCards() {
      const query = search.value.trim().toLowerCase();
      cards.forEach((card) => {
        const categoryMatches = activeFilter === "all" || card.dataset.category.split(/\s+/).includes(activeFilter);
        const queryMatches = !query || card.textContent.toLowerCase().includes(query);
        card.classList.toggle("is-hidden", !(categoryMatches && queryMatches));
      });
      emptyMessage.hidden = [...cards].some((card) => !card.classList.contains("is-hidden"));
    }

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        activeFilter = filter.dataset.filter;
        filters.forEach((button) => {
          const active = button === filter;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        updateCards();
      });
    });

    search.addEventListener("input", updateCards);
    caseModeButton.addEventListener("click", () => {
      const enabled = caseModeButton.getAttribute("aria-pressed") !== "true";
      caseModeButton.setAttribute("aria-pressed", String(enabled));
      projectGrid.classList.toggle("case-study-mode", enabled);
      caseModeButton.setAttribute("aria-label", enabled ? "Switch to portfolio mode" : "Switch to case study mode");
    });

    function openProject(card) {
      const project = projects[card.dataset.project];
      if (!project) return;
      dialogTitle.textContent = project.title;
      description.textContent = project.description;
      tagList.replaceChildren(...project.tags.map((tag) => {
        const element = document.createElement("span");
        element.textContent = tag;
        return element;
      }));
      caseStudyList.replaceChildren(...project.caseStudy.map(([heading, copy]) => {
        const section = document.createElement("section");
        section.className = "case-study-section";
        const title = document.createElement("h3");
        title.textContent = heading;
        const text = document.createElement("p");
        text.textContent = copy;
        section.append(title, text);
        return section;
      }));
      dialog.showModal();
    }

    cards.forEach((card) => {
      card.addEventListener("click", () => openProject(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject(card);
        }
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion.matches) {
        card.addEventListener("pointermove", (event) => {
          if (card.classList.contains("is-hidden")) return;
          const bounds = card.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          card.style.setProperty("--spot-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
          card.style.setProperty("--spot-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
          card.style.transform = `rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
        });
        card.addEventListener("pointerleave", () => {
          card.style.transform = "";
          card.style.removeProperty("--spot-x");
          card.style.removeProperty("--spot-y");
        });
      }
    });

    closeButton.addEventListener("click", () => dialog.close());
    projectLinkButtons.forEach((button) => {
      button.addEventListener("click", () => showToast("Add the published project URL in the project details."));
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function setupSkills() {
    const nodes = document.querySelectorAll(".skill-node");
    const noteTitle = document.querySelector(".skill-note > span");
    const note = document.querySelector(".skill-note p");
    nodes.forEach((node) => {
      node.addEventListener("click", () => {
        nodes.forEach((item) => item.classList.toggle("selected", item === node));
        noteTitle.textContent = node.dataset.skill.toUpperCase();
        note.textContent = node.dataset.note;
      });
    });
  }

  function setupCareerPath() {
    const nodes = document.querySelectorAll(".path-node");
    const title = document.querySelector("[data-path-title]");
    const copy = document.querySelector("[data-path-copy]");
    const evidence = document.querySelector("[data-path-evidence]");
    const number = document.querySelector("[data-path-number]");
    const link = document.querySelector("[data-path-link]");
    const pathDetails = {
      python: ["01", "Python", "Python is the foundation for backend practice, practical scripts, and the cybersecurity tools in my project work.", "Python training · Smart ERP · Event Management · Kali toolkit", "#projects", "See related projects"],
      backend: ["02", "Backend", "Backend development connects application logic, APIs, data storage, and role-aware user flows.", "Flask internship · Smart ERP · Event Management", "#projects", "See backend projects"],
      fastapi: ["03", "FastAPI", "FastAPI is part of my current backend learning focus, alongside Python and REST API fundamentals.", "Current learning focus · Python backend development", "#about", "Read my current focus"],
      data: ["04", "Databases", "MySQL and SQLite feature in the project work for structured application records.", "Smart ERP · Event Management", "#projects", "See database projects"],
      security: ["05", "Security", "Cybersecurity is a long-term direction supported by coursework, Linux practice, and an introductory toolkit project.", "Google Cybersecurity Course · Kali Linux Toolkit", "#lab", "Explore the learning lab"],
      projects: ["06", "Projects", "Project work is how I connect what I learn in Python, backend development, data, and security.", "ERP · Event Management · Python tools · Kali toolkit", "#projects", "Browse project work"],
      api: ["07", "REST APIs", "REST API design is a backend skill I have practiced through Flask-based application projects.", "Smart ERP · Flask backend development", "#projects", "See backend projects"],
      tools: ["08", "Python tools", "CLI scripts help turn repeatable tasks into practical exercises in Python and automation.", "Python-based tools · Kali toolkit", "#projects", "See tool projects"],
      course: ["09", "Coursework", "Coursework supports foundational study in cybersecurity, computer networks, and artificial intelligence.", "Google · Coursera · IBM", "#certifications", "View certifications"]
    };
    nodes.forEach((node) => {
      node.addEventListener("click", () => {
        const detail = pathDetails[node.dataset.path];
        if (!detail) return;
        nodes.forEach((item) => {
          const selected = item === node;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        number.textContent = detail[0];
        title.textContent = detail[1];
        copy.textContent = detail[2];
        evidence.textContent = detail[3];
        link.href = detail[4];
        link.replaceChildren(document.createTextNode(`${detail[5]} `));
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↘";
        link.append(arrow);
      });
      node.setAttribute("aria-pressed", "false");
    });
    nodes[0]?.setAttribute("aria-pressed", "true");
  }

  function setupTerminal() {
    const form = document.querySelector(".terminal-form");
    const input = document.querySelector("#terminal-input");
    const output = document.querySelector(".terminal-output");
    const clearButton = document.querySelector(".terminal-clear");
    const commands = ["help", "about", "skills", "projects", "learning", "contact", "resume", "cv", "whoami", "sudo hire-me", "clear"];
    const history = [];
    let historyIndex = 0;
    const responses = {
      help: "Available: help, about, skills, projects, learning, contact, resume, cv, whoami, clear, sudo hire-me",
      about: "Somanath Nayak — Python & backend developer, final-year CSE student at GIET. Bhubaneswar, Odisha.",
      skills: "Python · FastAPI · Flask · Django REST Framework · DSA · Linux · Networking · MySQL · SQLite",
      projects: "Smart ERP System · Event Management System · Python tools · Kali Linux cybersecurity toolkit",
      learning: "Current focus: Python fundamentals, backend development, FastAPI, REST APIs, databases, Linux, and cybersecurity foundations.",
      contact: "Email: somanathnayak455@gmail.com | LinkedIn: linkedin.com/in/somanath-nayak-11297829b/",
      resume: "Resume download: use the Download resume button in the hero. The file is available as Somanath_resume.pdf.",
      cv: "CV download: use the Download CV button in the hero. The file is available as Somanath_CV.pdf.",
      whoami: "guest@field — browsing Somanath Nayak's portfolio. No shell access; just a friendly profile console.",
      "sudo coffee": "A good build starts with a clear question. Coffee status: entirely up to you.",
      "sudo hire-me": "Permission granted. I’m open to campus and off-campus placements. Send a message from the contact section."
    };

    function runCommand(rawCommand) {
      const command = rawCommand.trim().toLowerCase();
      if (!command) return;
      history.push(rawCommand);
      historyIndex = history.length;
      if (command === "clear") {
        output.replaceChildren();
        return;
      }
      const line = document.createElement("p");
      line.className = "terminal-line";
      const echo = document.createElement("span");
      echo.className = "command";
      echo.textContent = `guest@field:~$ ${rawCommand}`;
      const response = document.createElement("span");
      response.className = "response";
      response.textContent = responses[command] || `Command not found: ${command}. Try "help".`;
      line.append(echo, response);
      output.append(line);
      output.scrollTop = output.scrollHeight;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      runCommand(input.value);
      input.value = "";
      input.focus();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" && history.length) {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex];
      } else if (event.key === "ArrowDown" && history.length) {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = historyIndex === history.length ? "" : history[historyIndex];
      } else if (event.key === "Tab") {
        event.preventDefault();
        const partial = input.value.trim().toLowerCase();
        if (!partial) return;
        const matches = commands.filter((command) => command.startsWith(partial));
        if (matches.length === 1) input.value = matches[0];
        else if (matches.length > 1) {
          const commonPrefix = matches.reduce((prefix, command) => {
            let length = 0;
            while (length < prefix.length && prefix[length] === command[length]) length += 1;
            return prefix.slice(0, length);
          });
          if (commonPrefix.length > partial.length) input.value = commonPrefix;
        }
      }
    });
    clearButton.addEventListener("click", () => {
      output.replaceChildren();
      input.focus();
    });
    output.addEventListener("click", (event) => {
      if (event.target.matches("[data-command]")) {
        runCommand(event.target.dataset.command);
        input.focus();
      }
    });
  }

  function setupCertificates() {
    document.querySelectorAll(".cert-card").forEach((card) => {
      card.addEventListener("click", () => card.classList.toggle("flipped"));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.classList.toggle("flipped");
        }
      });
    });
  }

  function setupContact() {
    const copyButton = document.querySelector(".copy-email");
    const form = document.querySelector(".contact-form");
    const error = document.querySelector(".form-error");

    copyButton.addEventListener("click", async () => {
      const address = copyButton.dataset.copy;
      try {
        await navigator.clipboard.writeText(address);
        showToast("Email address copied.");
      } catch {
        const helper = document.createElement("textarea");
        helper.value = address;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (copied) showToast("Email address copied.");
        else showToast(`Email: ${address}`);
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      error.textContent = "";
      if (!form.reportValidity()) return;
      const formData = new FormData(form);
      const name = String(formData.get("name")).trim();
      const email = String(formData.get("email")).trim();
      const message = String(formData.get("message")).trim();
      if (name.length < 2 || message.length < 10) {
        error.textContent = "Please add your name and a message of at least 10 characters.";
        return;
      }
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const bodyText = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
      window.location.href = `mailto:somanathnayak455@gmail.com?subject=${subject}&body=${bodyText}`;
    });
  }

  function setupPortraitFallbacks() {
    document.querySelectorAll(".portrait-frame img").forEach((image) => {
      image.addEventListener("error", () => {
        image.hidden = true;
        const fallback = image.nextElementSibling;
        if (fallback) fallback.hidden = false;
      }, { once: true });
    });
  }

  function setupEasterEgg() {
    const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let typed = [];
    window.addEventListener("keydown", (event) => {
      const target = event.target;
      if (target instanceof Element && target.matches("input, textarea, [contenteditable='true']")) return;
      typed.push(event.key.toLowerCase());
      typed = typed.slice(-sequence.length);
      if (sequence.every((key, index) => key.toLowerCase() === typed[index])) {
        body.classList.toggle("easter-egg");
        showToast("Hidden channel unlocked — keep asking better questions.");
        typed = [];
      }
    });

    const mark = document.querySelector(".mark");
    let clicks = 0;
    let clickTimer;
    mark.addEventListener("click", () => {
      clicks += 1;
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => { clicks = 0; }, 1800);
      if (clicks === 5) {
        body.classList.toggle("easter-egg");
        showToast("Signal variation unlocked. The original palette is one click away.");
        clicks = 0;
      }
    });
  }

  function setYear() {
    document.querySelector("#year").textContent = new Date().getFullYear();
  }

  startPreloader();
  setYear();
  setupTheme();
  setupNavigation();
  setupScrollEffects();
  setupTyping();
  setupCanvas();
  setupCursorAndParallax();
  setupMagneticAndRipple();
  setupProjects();
  setupSkills();
  setupCareerPath();
  setupFieldScan();
  setupTerminal();
  setupCertificates();
  setupContact();
  setupPortraitFallbacks();
  setupEasterEgg();
})();
