import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = 0;

export function initSite(): void {
	const header = document.querySelector<HTMLElement>("[data-header]");
	const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
	const nav = document.querySelector<HTMLElement>("[data-nav]");
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	let lenis: Lenis | null = null;

	if (!reduced) {
		lenis = new Lenis({
			autoRaf: false,
			duration: 1.05,
			stopInertiaOnNavigate: true,
		});
		lenis.on("scroll", ScrollTrigger.update);
		const onTick = (time: number) => {
			lenis?.raf(time * 1000);
		};
		gsap.ticker.add(onTick);
		gsap.ticker.lagSmoothing(0);
	}

	const clearMenuStyles = () => {
		if (!nav) return;
		gsap.set([nav, ...nav.querySelectorAll("a")], { clearProps: "all" });
	};

	const setMenu = (open: boolean) => {
		if (!nav || !toggle) return;
		nav.classList.toggle("is-open", open);
		header?.classList.toggle("is-menu", open);
		toggle.setAttribute("aria-expanded", String(open));
		document.body.classList.toggle("is-locked", open);
		if (open) lenis?.stop();
		else {
			lenis?.start();
			clearMenuStyles();
		}
	};

	toggle?.addEventListener("click", () => {
		const willOpen = !nav?.classList.contains("is-open");
		if (!nav || !toggle) return;
		gsap.killTweensOf(nav);

		if (willOpen) {
			setMenu(true);
			if (reduced) return;
			gsap.fromTo(nav, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
			gsap.fromTo(
				nav.querySelectorAll("a"),
				{ autoAlpha: 0, y: 16 },
				{ autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out", delay: 0.05 },
			);
			return;
		}

		toggle.setAttribute("aria-expanded", "false");
		header?.classList.remove("is-menu");
		document.body.classList.remove("is-locked");
		lenis?.start();

		const finish = () => {
			nav.classList.remove("is-open");
			clearMenuStyles();
		};

		if (reduced) {
			finish();
			return;
		}

		gsap.to(nav, {
			autoAlpha: 0,
			duration: 0.25,
			ease: "power2.in",
			onComplete: finish,
		});
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") setMenu(false);
	});

	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", (event) => {
			const hash = anchor.getAttribute("href");
			if (!hash || hash === "#") return;
			const target = document.querySelector<HTMLElement>(hash);
			if (!target) return;
			event.preventDefault();
			setMenu(false);
			if (lenis) {
				lenis.scrollTo(target, { offset: HEADER_OFFSET });
			} else {
				const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
				const top = target.getBoundingClientRect().top + window.scrollY - margin + HEADER_OFFSET;
				window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
			}
		});
	});

	window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
		if (!event.matches || !nav) return;
		setMenu(false);
		gsap.set([nav, ...nav.querySelectorAll("a")], { clearProps: "all" });
	});

	const hero = document.querySelector(".hero");
	const syncOverlay = () => {
		if (!header || !hero) return;
		const bottom = hero.getBoundingClientRect().bottom;
		header.classList.toggle("is-overlay", bottom > 72);
	};
	syncOverlay();
	ScrollTrigger.create({
		trigger: hero,
		start: "top top",
		end: "bottom 72px",
		onToggle: syncOverlay,
	});

	if (!reduced) {
		gsap.fromTo(
			"[data-hero-item]",
			{ autoAlpha: 0, y: 18 },
			{ autoAlpha: 1, y: 0, duration: 1.15, stagger: 0.1, ease: "power2.out", delay: 0.15 },
		);

		gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
			gsap.to(el, {
				autoAlpha: 1,
				duration: 0.8,
				ease: "power2.out",
				scrollTrigger: {
					trigger: el,
					start: "top 92%",
					once: true,
				},
			});
		});
	}

	window.addEventListener("load", () => ScrollTrigger.refresh());
}
