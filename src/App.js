import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  DOC_INDEX,
  fetchDoc,
  preloadAllDocs,
  SERVER_BASE,
  syncLiveDocs,
  getNav,
  API_BASE,
} from "./useGithubDocs";
import SupportPortal from "./components/SupportPortal";
import SearchBar from "./components/SearchBar";
import ceLogoFull from "./assets/ce-logo-full.png";

// ── Theme ─────────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("light", !dark);
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(t = "") {
  let text = String(t);

  // Convert raw HTML links accidentally stored in documentation content
  text = text.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi,
    (_, href, label) => `[${label}](${href})`
  );

  text = esc(text);

  return text
    .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '<a href="#" data-doc="$2" class="doc-lnk">$1 →</a>')
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/g, '<a href="mailto:$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="#" data-doc="$2" class="doc-lnk">$1 →</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}
function normalizeDocumentLeftovers(text = "") {
  const lines = String(text).split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const isPageFooter =
      /^(?:copyright\s*)?[©Â©]\s*cellular\s+expert\s*,?\s*20\d{2}\s+page\s*\\?\|\s*\d+$/i.test(trimmed) ||
      /^page\s*\\?\|\s*\d+$/i.test(trimmed);

    const isCopyrightBlockStart =
      /^copyright\s*[©Â©]\s*20\d{2}\s+uab\s+cellular\s+expert/i.test(trimmed);

    if (isPageFooter) {
      continue;
    }

    if (isCopyrightBlockStart) {
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !/^#{1,6}\s/.test(lines[i].trim())
      ) {
        i++;
      }

      if (i < lines.length && /^#{1,6}\s/.test(lines[i].trim())) {
        i--;
      }

      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}
function isMarkdownImageLine(line = "") {
  const s = String(line).trim();

  return /^!\[[^\]]*\]\\?\(.*\)$/.test(s);
}

function normalizeInterruptedImages(text = "") {
  const lines = String(text).split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!isMarkdownImageLine(line)) {
      out.push(line);
      continue;
    }

    const images = [];

    while (
      i < lines.length &&
      (lines[i].trim() === "" || isMarkdownImageLine(lines[i]))
    ) {
      if (isMarkdownImageLine(lines[i])) images.push(lines[i]);
      i++;
    }

    const prev = [...out].reverse().find((x) => x.trim() !== "") || "";
    const next = lines[i] || "";

    const imageInterruptedSentence =
      prev.trim() &&
      next.trim() &&
      !/[.!?:;]$/.test(prev.trim()) &&
      !/^#{1,6}\s/.test(next.trim()) &&
      !/^\|/.test(next.trim());

    if (imageInterruptedSentence) {
      out.push(next);
      out.push("");
      out.push(...images);
    } else {
      out.push(...images);
      if (next) out.push(next);
    }
  }

  return out.join("\n");
}
function normalizeBrokenTableRows(text = "") {
  const input = String(text).split("\n");
  const out = [];

  const isPipeTableLine = (line = "") =>
    line.includes("|") && line.trim().startsWith("|");

  const getCells = (line = "") =>
    line
      .trim()
      .split("|")
      .filter((_, i, a) => i > 0 && i < a.length - 1);

  const isFieldNameLine = (line = "") => {
    const s = line.trim();

    return (
      /^[a-z][a-z0-9_]{2,80}$/.test(s) &&
      !s.includes(" ") &&
      !/[.,:;!?)]$/.test(s)
    );
  };

  let canContinueTable = false;

  for (let i = 0; i < input.length; i++) {
    const line = input[i];
    const trimmed = line.trim();

    if (isPipeTableLine(line)) {
      out.push(line);
      canContinueTable = getCells(line).length >= 2;
      continue;
    }

    if (canContinueTable && isFieldNameLine(line)) {
      const field = trimmed;
      const descLines = [];

      i++;

      while (i < input.length) {
        const next = input[i];
        const nt = next.trim();

        if (
          isPipeTableLine(next) ||
          /^#{1,6}\s/.test(nt) ||
          /^---+$/.test(nt)
        ) {
          i--;
          break;
        }

        if (isFieldNameLine(next) && descLines.length > 0) {
          i--;
          break;
        }

        if (nt) {
          descLines.push(nt.replace(/^\s*[-*]\s+/, "• "));
        }

        i++;
      }

      const description = descLines.join(" ").replace(/\s+/g, " ").trim();
      out.push(`| ${field} | ${description} |`);
      canContinueTable = true;
      continue;
    }

    out.push(line);
    if (trimmed === "") canContinueTable = false;
  }

  return out.join("\n");
}

function renderMD(text) {
  if (!text) return "";
  const lines = normalizeBrokenTableRows(
  normalizeInterruptedImages(normalizeDocumentLeftovers(text)),
).split("\n");
  let html = "",
    inCode = false,
    inTable = false,
    inList = false,
    lt = "",
    inBq = false;
  const closeL = () => {
    if (inList) {
      html += `</${lt}>`;
      inList = false;
    }
  };
  const closeBq = () => {
    if (inBq) {
      html += "</blockquote>";
      inBq = false;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html += "</code></pre>";
        inCode = false;
      } else {
        closeL();
        closeBq();
        html += "<pre><code>";
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html += esc(line) + "\n";
      continue;
    }
    if (inList && !/^\s*[-*]\s|^\d+\.\s/.test(line) && line.trim()) closeL();
    if (inBq && !line.startsWith(">")) closeBq();
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .trim()
        .split("|")
        .filter((_, i2, a) => i2 > 0 && i2 < a.length - 1);
      const isSep = cells.every(
        (c) => c.trim().replace(/[-:]/g, "").trim() === "",
      );
      if (isSep) {
        if (!inTable) {
          html += "<table>";
          inTable = true;
        }
        continue;
      }
      if (!inTable) {
        html += "<table>";
        inTable = true;
      }
      const isH = lines[i + 1]?.includes("---");
      html += `<tr>${cells.map((c) => `<${isH ? "th" : "td"}>${inline(c.trim())}</${isH ? "th" : "td"}>`).join("")}</tr>`;
      continue;
    } else if (inTable) {
      html += "</table>";
      inTable = false;
    }
    const hm = line.match(/^(#{1,6})\s(.+)/);
    if (hm) {
      closeL();
      closeBq();
      const lvl = hm[1].length;
      const id = hm[2]
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      const displayText = hm[2].replace(/^\d+(?:\\?\.\d+)*\\?\.?\s+/, "");
      html += `<h${lvl} id="${id}">${inline(displayText)}</h${lvl}>`;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      closeL();
      closeBq();
      html += "<hr/>";
      continue;
    }
    if (line.startsWith("> ")) {
      if (!inBq) {
        html += "<blockquote>";
        inBq = true;
      }
      html += `<p>${inline(line.slice(2))}</p>`;
      continue;
    }
    if (/^\s*[-*]\s/.test(line)) {
      if (!inList || lt !== "ul") {
        closeL();
        html += "<ul>";
        inList = true;
        lt = "ul";
      }
      html += `<li>${inline(line.trim().slice(2))}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s/.test(line)) {
      if (!inList || lt !== "ol") {
        closeL();
        html += "<ol>";
        inList = true;
        lt = "ol";
      }
      html += `<li>${inline(line.replace(/^\s*\d+\.\s/, "").trim())}</li>`;
      continue;
    }
    if (line.trim() === "") {
      closeL();
      closeBq();
      html += '<div class="sp"></div>';
      continue;
    }
    html += `<p>${inline(line)}</p>`;
  }
  if (inCode) html += "</code></pre>";
  if (inTable) html += "</table>";
  if (inList) html += `</${lt}>`;
  if (inBq) html += "</blockquote>";
  return html;
}

// Builds the HTML for one image/icon figure (shared by inline placement and fallback).
function buildFigureHtml(img) {
  const isIcon =
    /\.svg(\?.*)?$/i.test(img.image_url) ||
    /icons?\//i.test(img.image_url) ||
    /-?(16|24|32)\.(png|svg)(\?.*)?$/i.test(img.image_url);
  const caption = (img.caption || "").replace(/</g, "&lt;");
  const imgStyle = isIcon
    ? "width:32px;height:32px;min-width:32px;flex-shrink:0;object-fit:contain;display:block;"
    : "max-width:100%;height:auto;border-radius:8px;display:block;";
  const figureStyle = isIcon
    ? "margin:16px 0;padding:14px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;gap:14px;"
    : "margin:16px 0;padding:14px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;";
  const capStyle = isIcon
    ? "font-size:12px;color:var(--text-dim);font-style:italic;text-align:left;"
    : "margin-top:8px;font-size:12px;color:var(--text-dim);font-style:italic;text-align:center;";
  return `<figure style="${figureStyle}" data-img-fig="1"><img src="${img.image_url}" alt="${caption}" style="${imgStyle}" onerror="this.closest('figure').style.display='none'" />${
    caption ? `<figcaption style="${capStyle}">${caption}</figcaption>` : ""
  }</figure>`;
}

// Inserts each image right after the heading whose id matches its section_anchor.
// Images with no matching heading (or no section_anchor) are appended at the end
// as a fallback, so nothing silently disappears.
function injectImages(contentHtml, images) {
  if (!images || images.length === 0) return contentHtml;
  let html = contentHtml;
  const leftover = [];
  for (const img of images) {
    const anchor = (img.section_anchor || "").trim();
    const figureHtml = buildFigureHtml(img);
    if (!anchor) {
      leftover.push(figureHtml);
      continue;
    }
    const headingRe = new RegExp(
      `(<h[1-6] id="${anchor}"[^>]*>.*?</h[1-6]>)`,
      "i",
    );
    if (headingRe.test(html)) {
      html = html.replace(headingRe, `$1${figureHtml}`);
    } else {
      leftover.push(figureHtml);
    }
  }
  if (leftover.length > 0) {
    html += `<div style="margin-top:24px">${leftover.join("")}</div>`;
  }
  return html;
}
function extractTOC(c) {
  return (c || "")
    .split("\n")
    .filter((l) => /^#{2,4}\s/.test(l))
    .map((l) => {
      const m = l.match(/^(#{2,4})\s(.+)/);
      return {
        level: m[1].length,
        text: m[2].replace(/^\d+(\.\d+)*\.?\s+/, ""), // strip PDF-style numbering for display only
        id: m[2]
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      };
    });
}

const PC = {
  "CE Express": ["#5b4feb", "rgba(91,79,235,0.1)"],
  "CE Pro": ["#e94fc9", "rgba(233,79,201,0.1)"],
  Both: ["#f59e0b", "rgba(245,158,11,0.1)"],
  Training: ["#8b5cf6", "rgba(139,92,246,0.1)"],
};
const PI = { "CE Express": "🌐", "CE Pro": "🖥", Both: "🗺", Training: "🎓" };

const ART_CSS = `
  .art h1{font-size:26px;font-weight:700;color:var(--text-bright);letter-spacing:-0.02em;margin:0 0 8px}
  .art h2{font-size:18px;font-weight:600;color:var(--text-bright);margin:32px 0 12px;padding-top:10px;border-top:1px solid var(--border)}
  .art h3{font-size:15px;font-weight:600;color:var(--text-bright);margin:22px 0 8px}
  .art h4{font-size:12px;font-weight:600;color:var(--text-dim);margin:16px 0 5px;text-transform:uppercase;letter-spacing:.06em}
  .art p{margin:0 0 10px;line-height:1.75;color:var(--text)}
  .art .sp{height:6px}
  .art a{color:var(--accent);font-weight:500}
  .art a:hover{text-decoration:underline}
  .art img{max-width:100%;height:auto;display:block;border-radius:8px;margin:12px 0}
  .art p:has(img){margin:14px 0}
  .art strong{font-weight:600;color:var(--text-bright)}
  .art code{font-family:var(--font-mono);font-size:12px;background:var(--bg3);color:var(--accent);padding:2px 6px;border-radius:4px;border:1px solid var(--border)}
  .art pre{background:var(--bg3);color:var(--text-bright);padding:18px 20px;border-radius:10px;overflow-x:auto;margin:14px 0;font-size:12px;line-height:1.65;border:1px solid var(--border)}
  .art pre code{background:transparent;color:var(--accent2);padding:0;border:none;font-size:inherit}
  .art table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
  .art th{background:var(--bg3);font-weight:600;color:var(--text-bright);text-align:left;padding:9px 12px;border:1px solid var(--border)}
  .art td{padding:8px 12px;border:1px solid var(--border);color:var(--text);vertical-align:top;line-height:1.6}
  .art tr:nth-child(even) td{background:var(--bg2)}
  .art ul,.art ol{padding-left:22px;margin:0 0 12px}
  .art li{margin:5px 0;line-height:1.65;color:var(--text)}
  .art blockquote{border-left:3px solid var(--accent);background:var(--accent-l);padding:12px 16px;margin:12px 0;border-radius:0 8px 8px 0;font-size:13px}
  .art blockquote p{margin:0;color:var(--text)}
  .art hr{border:none;border-top:1px solid var(--border);margin:24px 0}
  .doc-lnk{color:var(--accent);font-weight:500}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

  @media print {
    .no-print, nav, aside { display: none !important; }
    body { background: #fff !important; }
    .art { color: #000 !important; max-width: 100% !important; }
    .art h1, .art h2, .art h3, .art h4 { color: #000 !important; }
    .art p, .art li, .art td, .art th { color: #000 !important; }
  }
`;

// ── CE Logo SVG ───────────────────────────────────────────────────────────────
const Logo = ({ size = 32, color = "var(--accent)" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.2" />
    <path
      d="M8 16 Q16 6 24 16 Q16 26 8 16Z"
      fill="none"
      stroke={color}
      strokeWidth="1.4"
    />
    <circle cx="16" cy="16" r="3" fill={color} />
    <path
      d="M16 4L16 8M16 24L16 28M4 16L8 16M24 16L28 16"
      stroke={color}
      strokeWidth="0.8"
      opacity="0.5"
    />
  </svg>
);

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = React.memo(function Navbar({
  view,
  setView,
  dark,
  toggleDark,
  onDocsSelect,
  docsActive,
  currentUser,
  onLogout,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "solutions", label: "Solutions" },
    { id: "docs", label: "Documentation" },
    { id: "support", label: "Support" },
  ];

  const handleNav = (id) => {
    setMobileOpen(false);
    if (id === "docs") {
      setView("docs");
      onDocsSelect(null);
      return;
    }
    if (id === "support") {
      setView("support");
      return;
    }
    if (view !== "main") {
      setView("main");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "var(--nav-h)",
background:
          scrolled || view !== "main" ? "var(--bg2)" : "transparent",
        backdropFilter: scrolled || view !== "main" ? "blur(20px)" : "none",
        borderBottom:
          scrolled || view !== "main" ? "1px solid var(--border)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        transition: "all 0.3s",
        gap: 20,
      }}
    >
      <div
        onClick={() => handleNav("home")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img
          src={ceLogoFull}
          alt="Cellular Expert"
          style={{
            height: 34,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {view === "docs" && (
        <div style={{ flex: 1, maxWidth: 420 }}>
          <SearchBar onSelectDoc={onDocsSelect} onSupportClick={() => setView("support")} />
        </div>
      )}

      <ul
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          listStyle: "none",
          margin: 0,
          marginLeft: "auto",
          flexShrink: 0,
        }}
      >
        {navLinks.map((link) => {
          const isActive =
            (link.id === "docs" && view === "docs") ||
            (link.id === "support" && view === "support");
          return (
            <li key={link.id}>
              <button
                onClick={() => handleNav(link.id)}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? (dark ? "#050e1a" : "#fff") : "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text)";
                }}
              >
                {link.label}
              </button>
            </li>
          );
        })}
        <li>
          <button
            onClick={toggleDark}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-dim)",
              cursor: "pointer",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </li>
        <li style={{ position: "relative" }}>
          {currentUser ? (
            <>
              <button
                onClick={() => setAccountMenuOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 4px",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {currentUser.avatar}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser.name}
                </span>
              </button>
              {accountMenuOpen && (
                <>
                  <div
                    onClick={() => setAccountMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 998 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      boxShadow: "0 12px 30px -8px rgba(0,0,0,0.25)",
                      minWidth: 160,
                      zIndex: 999,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => { setAccountMenuOpen(false); setView("support"); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        border: "none",
                        background: "transparent",
                        color: "var(--text)",
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      ◎ Profile
                    </button>
                    <button
                      onClick={() => { setAccountMenuOpen(false); onLogout(); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        border: "none",
                        borderTop: "1px solid var(--border)",
                        background: "transparent",
                        color: "#dc2626",
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      ⏻ Logout
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => setView("support")}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginLeft: 4,
              }}
            >
              Sign In
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
});

// ── Hero Section ──────────────────────────────────────────────────────────────
const HeroSection = ({ onDocsClick, onSupportClick }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width,
      H = canvas.height;
    const cx = W / 2,
      cy = H / 2,
      R = Math.min(W, H) * 0.35;
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const t = frame * 0.008;
      // globe rings
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          R,
          R * Math.abs(Math.cos(a + t)),
          0,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = `rgba(0,180,255,${0.08 + i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,180,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // inner dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "var(--accent)";
      ctx.fill();
      // radar sweep
      const angle = t * 2;
      const grad = ctx.createConicalGradient ? null : null;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + 0.8);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,180,255,0.06)";
      ctx.fill();
      // dots on globe
      for (let i = 0; i < 8; i++) {
        const da = (i / 8) * Math.PI * 2 + t;
        const x = cx + Math.cos(da) * R * 0.7;
        const y = cy + Math.sin(da) * R * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,160,${0.4 + Math.sin(da * 3 + t) * 0.3})`;
        ctx.fill();
      }
      frame++;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "var(--nav-h)",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,180,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.04) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(0,180,255,0.08) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "0%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(0,212,160,0.06) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 48px",
          display: "flex",
          alignItems: "center",
          gap: 60,
          width: "100%",
        }}
      >
        {/* Left */}
        <div style={{ flex: 1, animation: "fadeUp 0.8s ease forwards" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px",
              border: "1px solid rgba(0,180,255,0.3)",
              borderRadius: 20,
              marginBottom: 24,
              background: "rgba(0,180,255,0.06)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent2)",
                display: "inline-block",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.1em",
              }}
            >
             DOCUMENTATION · AI SUPPORT PORTAL
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 700,
              color: "var(--text-bright)",
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: "-0.03em",
            }}
          >
            Documentation
            <br />
            <span style={{ color: "var(--accent)" }}>& AI Support</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--text)",
              lineHeight: 1.8,
              marginBottom: 36,
              maxWidth: 520,
            }}
          >
            Browse complete guides for CE Express, CE Desktop Pro,
            Inventory3D, and Geodata — or ask our{" "}
            <strong style={{ color: "var(--text-bright)" }}>
              AI assistant
            </strong>{" "}
            for an instant answer and open a support ticket in seconds if you
            need more help.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={onDocsClick}
              style={{
                padding: "12px 28px",
                background: "var(--accent)",
                border: "none",
                color: "#ffffff",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >
              Documentation
            </button>
            <button
              onClick={onSupportClick}
              style={{
                padding: "12px 28px",
                background: "transparent",
                border: "1px solid var(--border2)",
                color: "var(--accent)",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >
              Get Support
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
            {[
              [`${DOC_INDEX.length}+`, "Docs"],
              [`${new Set(DOC_INDEX.map((d) => d.product)).size}`, "Products"],
              ["24/7", "AI Support"],
            ].map(([n, l]) => (
              <div key={l}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right — canvas globe */}
        <div style={{ flex: "0 0 400px", height: 400, position: "relative" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
};

// ── Products Section ──────────────────────────────────────────────────────────
const ProductsSection = ({ onDocsClick }) => {
  const products = [
    {
      name: "CE Desktop Pro",
      tag: "ArcGIS Pro",
      icon: "🖥",
      color: "#00b4ff",
      desc: "Advanced radio planning extension for ArcGIS Pro. Supports RCP, RLP, Indoor, Sound, and EMF modules.",
      features: [
        "10 kHz – 350 GHz frequency range",
        "Sub-meter resolution GIS data",
        "Best server, SINR, throughput maps",
        "Drive-test data validation",
      ],
      docId: "ce-pro-overview",
    },
    {
      name: "CE Express",
      tag: "Web Platform",
      icon: "🌐",
      color: "#00d4a0",
      desc: "Multi-user web-based platform for radio planning, optimization and network inventory within ArcGIS Enterprise.",
      features: [
        "Browser-based, no local install",
        "Cloud or on-premise deployment",
        "CE Inventory3D integrated",
        "Full RF prediction suite",
      ],
      docId: "ce-express-overview-merged",
    },
    {
      name: "Inventory3D",
      tag: "Asset Management",
      icon: "🗄",
      color: "#a78bfa",
      desc: "Database component for network asset management. Runs standalone or as part of CE Express system.",
      features: [
        "Telecom tower asset tracking",
        "3D visualization support",
        "OSS/BSS integration",
        "SketchUp plug-in available",
      ],
      docId: "inventory3d-user-guide",
    },
    {
      name: "Geodata",
      tag: "Data Requirements",
      icon: "🗺",
      color: "#f59e0b",
      desc: "Geographic data foundation shared across CE Express and CE Desktop Pro — terrain, clutter, buildings, and antenna patterns.",
      features: [
        "DTM / terrain grid formats",
        "Clutter classes & heights",
        "Building & antenna pattern data",
        "Resolution & format requirements",
      ],
      docId: "geodata-requirements",
    },
  ];
  return (
    <section
      id="products"
      style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Products
        </div>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "var(--text-bright)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          CE Software Suite
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--text-dim)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          A complete family of GIS-based tools for telecom planning,
          optimization, and network management.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.name}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = p.color;
              e.currentTarget.style.boxShadow = `0 8px 32px ${p.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                padding: "24px 24px 0",
                borderBottom: `2px solid ${p.color}`,
                paddingBottom: 20,
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: p.color,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.tag}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-bright)",
                    }}
                  >
                    {p.name}
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-dim)",
                  lineHeight: 1.65,
                }}
              >
                {p.desc}
              </p>
            </div>
            <div style={{ padding: 24 }}>
              {p.features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: p.color, fontSize: 12, flexShrink: 0 }}>
                    ▸
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text)" }}>
                    {f}
                  </span>
                </div>
              ))}
              <button
                onClick={() => onDocsClick(p.docId)}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "9px",
                  border: `1px solid ${p.color}`,
                  borderRadius: 8,
                  background: "transparent",
                  color: p.color,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = p.color;
                  e.currentTarget.style.color = "#050e1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = p.color;
                }}
              >
                View Documentation →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Solutions Section ─────────────────────────────────────────────────────────
const SolutionsSection = () => {
  const solutions = [
    {
      icon: "📡",
      title: "5G & Mobile Networks",
      desc: "Coverage planning, interference analysis, capacity optimization for 4G/5G NR networks.",
    },
    {
      icon: "🔗",
      title: "Microwave Backhaul",
      desc: "Point-to-point and mesh link design, path profiles, rain fade, ITU-R availability.",
    },
    {
      icon: "🛡",
      title: "Defense & Public Safety",
      desc: "Tactical radio coverage, electronic warfare, communication network planning for defense.",
    },
    {
      icon: "🏢",
      title: "Indoor Planning",
      desc: "In-building signal propagation, DAS design, floor-level coverage analysis.",
    },
    {
      icon: "📻",
      title: "Broadcast & IoT",
      desc: "Broadcasting coverage analysis, IoT network planning, spectrum management.",
    },
    {
      icon: "🔊",
      title: "Sound & Light Modelling",
      desc: "Siren audibility (ISO 9613), lux calculations, EMF exposure zone analysis.",
    },
  ];
  return (
    <section
      id="solutions"
      style={{
        padding: "100px 48px",
        background: "var(--bg2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Solutions
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "var(--text-bright)",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Industry Verticals
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-dim)",
              maxWidth: 500,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            CE software serves telecom operators, defense organizations,
            regulators, and infrastructure companies worldwide.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 14,
          }}
        >
          {solutions.map((s) => (
            <div
              key={s.title}
              style={{
                padding: "24px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "var(--accent-l)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg)";
              }}
            >
              <span
                style={{ fontSize: 26, display: "block", marginBottom: 12 }}
              >
                {s.icon}
              </span>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-bright)",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  lineHeight: 1.65,
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── About Section ─────────────────────────────────────────────────────────────
const AboutSection = () => (
  <section
    id="about"
    style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}
  >
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--accent)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        How It Works
      </div>
      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "var(--text-bright)",
          letterSpacing: "-0.02em",
          marginBottom: 18,
        }}
      >
        How This Documentation Platform Works
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-dim)",
          lineHeight: 1.8,
          marginBottom: 28,
        }}
      >
        This platform converts Cellular Expert PDF manuals into structured
        web documentation.
      </p>

      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          marginBottom: 32,
        }}
      >
        {[
          "Documentation content, sections, images, and metadata are organized and stored in the database.",
          "The website displays this content as searchable documentation pages.",
          'Users can browse by product, use the sidebar, and use "On this page" to navigate inside each article.',
          "If users cannot find an answer, they can ask the AI assistant.",
          "The AI uses the documentation content to answer questions and logs useful insights.",
          "Admins can review AI questions, low-confidence answers, and unclear topics to improve the documentation.",
          "If the issue still cannot be solved, the user can contact support.",
        ].map((step, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--accent-l)",
                border: "1px solid var(--border2)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "var(--text)",
                lineHeight: 1.7,
                paddingTop: 2,
              }}
            >
              {step}
            </div>
          </li>
        ))}
      </ol>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        The Full Flow
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 16px",
        }}
      >
        {[
          "PDF manuals",
          "Structured documentation",
          "PostgreSQL database",
          "Website documentation pages",
          "AI assistant",
          "AI insights / admin review",
          "Support (if needed)",
        ].map((step, i, arr) => (
          <React.Fragment key={step}>
            <div
              style={{
                padding: "8px 13px",
                borderRadius: 20,
                background: "var(--bg)",
                border: "1px solid var(--border2)",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-bright)",
                whiteSpace: "nowrap",
              }}
            >
              {step}
            </div>
            {i < arr.length - 1 && (
              <span style={{ color: "var(--accent)", fontSize: 14, flexShrink: 0 }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

// ── Docs Sidebar ──────────────────────────────────────────────────────────────
const DocsSidebar = React.memo(function DocsSidebar({ activeDocId, onSelect, nav }) {
  const [openSecs, setOpenSecs] = useState({});
  const isOpen = (key) => openSecs[key] !== false;
  const toggle = (key) => setOpenSecs((p) => ({ ...p, [key]: !isOpen(key) }));
  return (
    <nav
      style={{
        width: 260,
        flexShrink: 0,
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        position: "fixed",
        top: "var(--nav-h)",
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <div style={{ padding: "16px 12px 8px" }}>
        <div
          onClick={() => onSelect(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            borderRadius: 8,
            background: !activeDocId ? "var(--accent-l)" : "transparent",
            color: !activeDocId ? "var(--accent)" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 6,
            border: !activeDocId
              ? "1px solid var(--border2)"
              : "1px solid transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M3 9.5 12 3l9 6.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
          <span>Documentation Home</span>
        </div>
      </div>
      {Object.entries(nav).map(([section, cats]) => (
        <div key={section} style={{ padding: "4px 0 8px" }}>
          <div
            style={{
              padding: "6px 16px 4px",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            {section}
          </div>
          {Object.entries(cats)
            .filter(([, items]) => items.length > 0)
            .map(([cat, items]) => {
              const key = `${section}::${cat}`;
              const open = isOpen(key);
              const multi = items.length > 1;
              return (
                <div key={cat}>
                  {multi && (
                    <div
                      onClick={() => toggle(key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 16px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: open ? "var(--accent)" : "var(--text)",
                        userSelect: "none",
                        transition: "color 0.1s",
                      }}
                    >
                      <span>{cat}</span>
                      <span style={{ fontSize: 10, opacity: 0.5 }}>
                        {open ? "▼" : "▶"}
                      </span>
                    </div>
                  )}
                  {open &&
                    items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        style={{
                          padding: `5px 14px 5px ${multi ? 26 : 14}px`,
                          fontSize: 12.5,
                          lineHeight: 1.4,
                          cursor: "pointer",
                          color:
                            activeDocId === item.id
                              ? "var(--accent)"
                              : "var(--text)",
                          background:
                            activeDocId === item.id
                              ? "var(--accent-l)"
                              : "transparent",
                          borderLeft: `2px solid ${activeDocId === item.id ? "var(--accent)" : "transparent"}`,
                          transition: "all .1s",
                          marginBottom: 1,
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                </div>
              );
            })}
        </div>
      ))}
      <div style={{ height: 32 }} />
    </nav>
  );
});

const TOC = React.memo(function TOC({ toc }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!toc.length) return;
    const headingEls = toc
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    if (!headingEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the heading closest to the top of the viewport among the
        // ones currently visible, so "active" tracks scroll position
        // instead of only updating when the user clicks a link.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActive(topMost.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;
  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        padding: "36px 16px 36px 0",
        position: "sticky",
        top: "var(--nav-h)",
        height: "calc(100vh - var(--nav-h))",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: "var(--font-mono)",
        }}
      >
        On this page
      </div>
      {toc.map((h) => (
        <div
          key={h.id}
          onClick={() => {
            document
              .getElementById(h.id)
              ?.scrollIntoView({ behavior: "smooth" });
            setActive(h.id);
          }}
          style={{
            padding: `4px 0 4px ${10 + (h.level - 2) * 10}px`,
            fontSize: 12,
            lineHeight: 1.4,
            cursor: "pointer",
            color: active === h.id ? "var(--accent)" : "var(--text-dim)",
            borderLeft: `1px solid ${active === h.id ? "var(--accent)" : "var(--border)"}`,
            transition: "all .1s",
            marginBottom: 2,
          }}
        >
          {h.text}
        </div>
      ))}
    </aside>
  );
});

// ── Docs Home ─────────────────────────────────────────────────────────────────
const DocsHome = React.memo(function DocsHome({ onSelect, onSupportClick }) {
  // Count documents per actual product value — no fallback bucket, so a
  // product that doesn't match one of the known keys below just won't be
  // shown, instead of silently being lumped into the wrong card.
  const counts = {};
  DOC_INDEX.forEach((d) => {
    counts[d.product] = (counts[d.product] || 0) + 1;
  });

  const cards = [
    {
      key: "CE Express",
      product: "CE Express",
      icon: "🌐",
      color: "#00b4ff",
      desc: "Web-based RF planning — browser access, multi-user, CE Inventory3D integrated.",
      firstDoc: "ce-express-overview-merged",
    },
    {
      key: "CE Desktop Pro",
      product: "CE Pro",
      icon: "🖥",
      color: "#00d4a0",
      desc: "ArcGIS Pro extension — RCP, RLP, Indoor, Sound, EMF modules. 10 kHz–350 GHz.",
      firstDoc: "ce-pro-overview",
    },
    {
      key: "Geodata & Data",
      product: "Both",
      icon: "🗺",
      color: "#f59e0b",
      desc: "DEM, clutter, buildings, antenna patterns — formats, resolutions, requirements.",
      firstDoc: "geodata-requirements",
    },
    {
      key: "Inventory3D",
      product: "Inventory3D",
      icon: "📦",
      color: "#a78bfa",
      desc: "3D indoor/outdoor asset inventory and visualization tool.",
      firstDoc: "inventory3d-user-guide",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Pick a product",
      desc: "Choose CE Express, CE Desktop Pro, Geodata, Inventory3D, or Training below.",
    },
    {
      n: "02",
      title: "Browse that product's docs only",
      desc: "The sidebar shows guides, references, and training for that product — nothing else mixed in.",
    },
    {
      n: "03",
      title: "Download or search",
      desc: "Grab the official PDF guide from any article, or use search to jump straight to a topic.",
    },
    {
      n: "04",
      title: "Still stuck? Contact Support",
      desc: "Can't find the answer in the docs? Open a ticket or browse FAQs in the Support section.",
    },
  ];

  return (
    <div style={{ padding: "48px", flex: 1, maxWidth: 960 }}>
      {/* ── Intro: what this platform is ──────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Documentation &amp; Support
        </div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "var(--text-bright)",
            letterSpacing: "-0.03em",
            marginBottom: 14,
          }}
        >
          Cellular Expert Docs &amp; Support Center
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-dim)",
            lineHeight: 1.75,
            maxWidth: 640,
            marginBottom: 14,
          }}
        >
          This is the dedicated documentation and support platform for the
          Cellular Expert product family — separate from the main marketing
          site. It covers{" "}
          <strong style={{ color: "var(--text-bright)" }}>CE Express</strong>{" "}
          (web),{" "}
          <strong style={{ color: "var(--text-bright)" }}>
            CE Desktop Pro
          </strong>{" "}
          (ArcGIS Pro — RCP, RLP, Indoor, Sound, EMF),{" "}
          <strong style={{ color: "var(--text-bright)" }}>Inventory3D</strong>,
          and shared{" "}
          <strong style={{ color: "var(--text-bright)" }}>Geodata</strong>{" "}
          requirements.
        </p>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-dim)",
            lineHeight: 1.75,
            maxWidth: 640,
            marginBottom: 32,
          }}
        >
          Here you'll find user guides, administrator guides, step-by-step
          training material, downloadable PDF manuals, and full-text search —
          each product's documentation kept in its own separate section rather
          than mixed together. Need help beyond the docs? Head to the{" "}
          <span
            onClick={onSupportClick}
            style={{
              color: "var(--accent)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Support
          </span>{" "}
          area to open a ticket or check FAQs.
        </p>
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 14,
            fontFamily: "var(--font-mono)",
          }}
        >
          How it works
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 14,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: 12,
                padding: "16px 18px",
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: "var(--bg2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-bright)",
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product picker (near the end, on purpose) ────────────────────── */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 4,
            fontFamily: "var(--font-mono)",
          }}
        >
          Choose a product to get started
        </div>
        <div
          style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 14 }}
        >
          Each product opens its own dedicated set of docs — nothing from other
          products is mixed in.
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 14,
          marginBottom: 40,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.key}
            onClick={() => onSelect(c.firstDoc)}
            style={{
              padding: "22px",
              border: `1px solid var(--border)`,
              borderRadius: 12,
              cursor: "pointer",
              background: "var(--bg2)",
              transition: "all .18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.color;
              e.currentTarget.style.boxShadow = `0 4px 24px ${c.color}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-bright)",
                  }}
                >
                  {c.key}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: c.color,
                    letterSpacing: "0.08em",
                  }}
                >
                  {counts[c.product] || 0}{" "}
                  {(counts[c.product] || 0) === 1 ? "article" : "articles"}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-dim)",
                lineHeight: 1.65,
              }}
            >
              {c.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          Popular Topics
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {[
            ["ce-express-v73-3-1-1-workspaces", "Creating Workspaces"],
            ["ce-express-v73-3-1-18-rf-prediction", "RF Prediction"],
            ["ce-express-v73-3-1-9-prediction-models", "Propagation Models"],
            ["ce-express-v73-3-1-3-networks", "Network Objects"],
            ["geodata-requirements", "Geodata Requirements"],
            ["geodata-network-objects", "Network Object Requirements"],
            ["ce-express-v73-3-1-37-link-prediction", "Microwave Link Planning"],
            ["ce-express-admin-guide", "CE Express Installation"],
            ["ce-pro-tr-install", "CE Pro Installation"],
            ["ce-pro-workspace-merged", "CE Pro Workspace"],
          ].map(([id, label]) => (
            <div
              key={id}
              onClick={() => onSelect(id)}
              style={{
                padding: "5px 13px",
                border: "1px solid var(--border)",
                borderRadius: 20,
                fontSize: 12,
                color: "var(--accent)",
                cursor: "pointer",
                transition: "all .12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-l)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ── Doc Article ───────────────────────────────────────────────────────────────
const DocArticle = React.memo(function DocArticle({ doc, onSelect }) {
  const toc = extractTOC(doc.content);
  const [pc, bg] = PC[doc.product] || ["#64748b", "var(--bg3)"];
  return (
    <>
      <article
        style={{ flex: 1, maxWidth: 820, padding: "36px 44px", minWidth: 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--text-dim)",
            marginBottom: 16,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            style={{ cursor: "pointer", color: "var(--accent)" }}
            onClick={() => onSelect(null)}
          >
            Docs
          </span>
          <span style={{ color: "var(--border2)" }}>›</span>
          <span>{doc.product}</span>
          <span style={{ color: "var(--border2)" }}>›</span>
          <span>{doc.category}</span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 11px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            color: pc,
            background: bg,
            border: `1px solid ${pc}33`,
            marginBottom: 12,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          {PI[doc.product]}&nbsp;{doc.product}
          {doc.version && (
            <span
              style={{
                marginLeft: 6,
                paddingLeft: 6,
                borderLeft: `1px solid ${pc}55`,
                opacity: 0.95,
              }}
            >
              v{doc.version}
            </span>
          )}
        </div>
        {doc.version && (
          <div
            style={{
              fontSize: 11,
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginBottom: 14,
              marginTop: -6,
            }}
          >
            📌 You're reading documentation for{" "}
            <strong style={{ color: "var(--text-bright)" }}>
              {doc.product} v{doc.version}
            </strong>
            . Using a different version? Check with your admin which release
            your organization has deployed.
          </div>
        )}
        {doc.pdf_path && (
          <a
            href={`${SERVER_BASE}/downloads/${doc.pdf_path.split("/").map(encodeURIComponent).join("/")}`}
            download
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent)",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              marginBottom: 16,
              marginLeft: 10,
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
            }}
          >
            ⬇ Download PDF
          </a>
        )}
        <button
          onClick={() => window.print()}
          className="no-print"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text)",
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            marginBottom: 16,
            marginLeft: doc.pdf_path ? 8 : 10,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          🖶 Print / Save as PDF
        </button>
        <div
          className="art"
          dangerouslySetInnerHTML={{
            __html: injectImages(renderMD(doc.content), doc.images),
          }}
        />

        {doc.related?.filter(
          (r) => r.trim() && DOC_INDEX.find((d) => d.id === r.trim()),
        ).length > 0 && (
          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-dim)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              Related Articles
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {doc.related
                .filter(
                  (r) => r.trim() && DOC_INDEX.find((d) => d.id === r.trim()),
                )
                .map((r) => {
                  const rel = DOC_INDEX.find((d) => d.id === r.trim());
                  return rel ? (
                    <div
                      key={r}
                      onClick={() => onSelect(r.trim())}
                      style={{
                        padding: "7px 14px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12.5,
                        color: "var(--accent)",
                        cursor: "pointer",
                        background: "var(--bg2)",
                        transition: "all .12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                      }
                    >
                      {rel.title} →
                    </div>
                  ) : null;
                })}
            </div>
          </div>
        )}
        <div
          style={{
            marginTop: 24,
            paddingTop: 14,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{doc.path}</span>
        </div>
      </article>
      <TOC toc={toc} />
    </>
  );
});

// ── Support (marketing) ──────────────────────────────────────────────────────
const SupportSection = ({ onSupportClick }) => {
  const items = [
    {
      icon: "✦",
      color: "#5b4feb",
      title: "AI Chat Assistant",
      desc: "A documentation-aware chatbot that instantly answers questions about CE Express, CE Desktop Pro, Geodata, and Inventory3D — pulling the exact article you need straight into the conversation, no digging through pages required.",
    },
    {
      icon: "◉",
      color: "#e94fc9",
      title: "Ticket System",
      desc: "For account-specific or technical issues — licensing, installation problems, data errors — open a ticket and a real support engineer picks it up, with full status tracking from Open to Resolved.",
    },
    {
      icon: "✉",
      color: "#f59e0b",
      title: "Direct Email",
      desc: "Need a human straight away? Email support@cellular-expert.com any time — every request is tracked and answered by our team.",
    },
  ];

  return (
    <section
      id="support-info"
      style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Support
        </div>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "var(--text-bright)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Get help whenever you need it
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-dim)",
            lineHeight: 1.8,
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          The Support Portal gives every Cellular Expert user three ways to get
          unstuck — an instant AI assistant for documentation questions, a
          ticket system for account-specific issues, and direct email for
          anything urgent.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 24,
          marginBottom: 48,
        }}
      >
        {items.map((it) => (
          <div
            key={it.title}
            style={{
              padding: 28,
              border: "1px solid var(--border)",
              borderRadius: 14,
              background: "var(--bg2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${it.color}18`,
                border: `1px solid ${it.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                color: it.color,
                marginBottom: 16,
              }}
            >
              {it.icon}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-bright)",
                marginBottom: 10,
              }}
            >
              {it.title}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-dim)",
                lineHeight: 1.75,
              }}
            >
              {it.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Deep dive on the AI Assistant specifically */}
      <div
        style={{
          padding: "32px 36px",
          border: "1px solid var(--border)",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, var(--accent-l), var(--accent2-l))",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-bright)",
            marginBottom: 14,
          }}
        >
          What can the AI Assistant actually do?
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                marginBottom: 8,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              How it works
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-dim)",
                lineHeight: 1.8,
              }}
            >
              Ask it in plain English — "how do I create a workspace" or "which
              prediction model works above 6 GHz." It searches the full
              documentation knowledge base across every CE product and training
              guide, then either surfaces the matching article directly in the
              chat, or — if it genuinely doesn't know — says so honestly and
              offers to open a ticket or email the team. It never guesses.
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent2)",
                marginBottom: 8,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Best used for
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-dim)",
                lineHeight: 1.8,
              }}
            >
              Fast answers to "how do I…" and "what is…" questions about product
              features, prediction models, workspace setup, and training steps.
              For anything tied to your specific account — licensing,
              installation errors on your machine, or data issues — open a
              ticket instead so a real engineer can investigate.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={onSupportClick}
          style={{
            padding: "13px 30px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Open Support Portal →
        </button>
      </div>
    </section>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer
    style={{
      borderTop: "1px solid var(--border)",
      padding: "40px 48px",
      marginTop: "auto",
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={ceLogoFull}
          alt="Cellular Expert"
          style={{
            height: 26,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
      <div
        style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}
      >
        © 2026 UAB Cellular Expert · Reg. 303012352 · A. Vivulskio g. 7,
        Vilnius, Lithuania
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
        <a
          href="mailto:info@cellular-expert.com"
          style={{ color: "var(--accent)" }}
        >
          info@cellular-expert.com
        </a>
        <a
          href="https://www.cellular-expert.com"
          target="_blank"
          rel="noopener"
          style={{ color: "var(--text-dim)" }}
        >
          cellular-expert.com
        </a>
      </div>
    </div>
  </footer>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, toggleDark] = useTheme();
  // view: 'main' | 'docs' | 'support'
  const [view, setViewRaw] = useState("main");
  const [activeDocId, setActiveDocId] = useState(null);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  // Account state lives here (not inside SupportPortal) so the top navbar
  // can show who's logged in too, instead of that info only existing deep
  // inside the Support page.
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) setCurrentUser(u); })
      .catch(() => {});
  }, []);
  const logout = useCallback(() => {
    fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setCurrentUser(null);
  }, []);
  const [navVersion, setNavVersion] = useState(0);

  // Documents created directly from the admin panel live only in Postgres —
  // pull them into DOC_INDEX once on load so they show up in the sidebar too,
  // not just in the admin's own document list.
  useEffect(() => {
    syncLiveDocs().then((changed) => {
      if (changed) setNavVersion((v) => v + 1);
    });
  }, []);
  const nav = useMemo(() => getNav(), [navVersion]);

  // Preload all docs in background so search has full-text data to work with
  useEffect(() => {
    preloadAllDocs();
  }, []);

  // Handle doc-link clicks inside rendered markdown
  useEffect(() => {
    const h = (e) => {
      const a = e.target.closest("a[data-doc]");
      if (!a) return;
      e.preventDefault();
      const target = a.dataset.doc;

      // Smart keyword links use prefix "kw:slug:docId" — try in-page anchor first
      if (target.startsWith("kw:")) {
        const [, slug, fallbackDocId] = target.split(":");
        const localEl = document.getElementById(slug);
        if (localEl) {
          localEl.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (fallbackDocId && fallbackDocId !== "none") {
          loadDoc(fallbackDocId);
        }
        return;
      }

      // Plain in-page anchor (#some-heading)
      const localEl = document.getElementById(target);
      if (localEl) {
        localEl.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Otherwise treat as a doc id navigation
      loadDoc(target);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const loadDoc = useCallback(async (id, anchorId, skipHistory) => {
    if (!id) {
      setDoc(null);
      setActiveDocId(null);
      return;
    }
    setViewRaw("docs");
    setActiveDocId(id);
    setLoading(true);
    setDoc(null);
    window.scrollTo(0, 0);
    if (!skipHistory) {
      window.history.pushState({ view: "docs", docId: id }, "", `/docs/${encodeURIComponent(id)}`);
    }
    const result = await fetchDoc(id);
    setDoc(result);
    setLoading(false);
    if (anchorId) {
      // Wait a tick for the article HTML to actually be in the DOM before
      // trying to scroll to a heading inside it.
      setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, []);

  // Every view change (Home / Docs list / Support) is funneled through this
  // single wrapper so the browser's Back/Forward buttons always land the
  // user back where they actually were, instead of doing nothing (which is
  // what happens when an app changes what it shows without ever touching
  // the URL). Kept under the name "setView" so every existing call site
  // (Navbar, DocsHome, SupportSection, etc.) keeps working unchanged.
  const setView = useCallback((newView, skipHistory) => {
    setViewRaw(newView);
    if (newView !== "docs") {
      setActiveDocId(null);
      setDoc(null);
    }
    if (!skipHistory) {
      const path = newView === "support" ? "/support" : newView === "docs" ? "/docs" : "/";
      window.history.pushState({ view: newView, docId: null }, "", path);
    }
  }, []);

  // Respond to the browser's Back/Forward buttons, and support opening a
  // direct link to a specific doc or the Support view.
  useEffect(() => {
    const onPopState = (e) => {
      const state = e.state;
      if (state && state.view === "docs" && state.docId) {
        loadDoc(state.docId, null, true);
      } else if (state && state.view === "support") {
        setView("support", true);
      } else {
        setView("main", true);
      }
    };
    window.addEventListener("popstate", onPopState);

    // On first load, honor a direct URL (e.g. someone bookmarked or shared
    // a /docs/:id link) and establish a matching history entry.
    const path = window.location.pathname;
    const docMatch = path.match(/^\/docs\/(.+)/);
    if (docMatch) {
      loadDoc(decodeURIComponent(docMatch[1]), null, true);
      window.history.replaceState({ view: "docs", docId: decodeURIComponent(docMatch[1]) }, "", path);
    } else if (path === "/support") {
      setView("support", true);
      window.history.replaceState({ view: "support", docId: null }, "", path);
    } else {
      window.history.replaceState({ view: "main", docId: null }, "", "/");
    }

    return () => window.removeEventListener("popstate", onPopState);
  }, [loadDoc, setView]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <style>{ART_CSS}</style>

      <Navbar
        view={view}
        setView={setView}
        dark={dark}
        toggleDark={toggleDark}
        onDocsSelect={loadDoc}
        docsActive={view === "docs"}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* MAIN SITE */}
      {view === "main" && (
        <>
          <HeroSection
            onDocsClick={() => {
              setView("docs");
              setActiveDocId(null);
              window.scrollTo(0, 0);
            }}
            onSupportClick={() => setView("support")}
          />
<ProductsSection onDocsClick={loadDoc} />
          <SolutionsSection />
          <SupportSection onSupportClick={() => setView("support")} />
          <AboutSection />
          <Footer />
        </>
      )}

      {/* DOCS VIEW */}
      {view === "docs" && (
        <div
          style={{
            display: "flex",
            marginTop: "var(--nav-h)",
            minHeight: "calc(100vh - var(--nav-h))",
          }}
        >
          <DocsSidebar activeDocId={activeDocId} onSelect={loadDoc} nav={nav} />
          <div style={{ marginLeft: 260, flex: 1, display: "flex" }}>
            {loading ? (
              <div style={{ padding: "80px", textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: "3px solid var(--border)",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Loading...
                </div>
              </div>
            ) : !activeDocId ? (
              <DocsHome
                onSelect={loadDoc}
                onSupportClick={() => setView("support")}
              />
            ) : doc ? (
              <DocArticle doc={doc} onSelect={loadDoc} />
            ) : null}
          </div>
        </div>
      )}

      {/* SUPPORT VIEW */}
      {view === "support" && (
        <div style={{ marginTop: "var(--nav-h)", flex: 1, display: "flex" }}>
          <SupportPortal
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onViewDocs={() => {
              setView("docs");
              setActiveDocId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
