import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  X,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import EternalArcCanvas from "../components/EternalArcCanvas";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!user) {
      navigate("/signup");
      return;
    }
    navigate(`/search?repo=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleQuickPick = (repo) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    navigate(`/search?repo=${encodeURIComponent(repo)}`);
  };

  return (
    <div className="eternal-landing-viewport">
      {/* 3D BACKGROUND CANVAS */}
      <EternalArcCanvas />

      {/* TOP MINIMALIST NAV BAR */}
      <header className="eternal-header">
        <div className="header-left">
          <button
            type="button"
            className="icon-trigger-btn"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Quick search repository"
            title="Search Repository (Cmd/Ctrl + K)"
          >
            <Search size={18} />
          </button>

          <Link to="/" className="brand-minimal">
            <GitBranch size={17} className="brand-icon-subtle" />
            <span>RepoRadar</span>
          </Link>
        </div>

        {/* Center diamond glyph from Spline */}
        <div className="header-center">
          <span className="diamond-glyph">✦</span>
        </div>

        <div className="header-right">
          {user ? (
            <>
              <Link to="/dashboard" className="header-link user-pill">
                <span>@{user.username || "Account"}</span>
              </Link>
              <Link to="/dashboard" className="header-cta-btn">
                <span>Dashboard</span>
                <ArrowUpRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">
                Sign In
              </Link>
              <Link to="/signup" className="header-cta-btn">
                <span>Sign Up</span>
                <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION — EXACT COMPOSITION MATCHING SPLINE */}
      <main className="eternal-hero-main">
        <div className="eternal-content-column">
          <h1 className="eternal-headline">THE ETERNAL ARC.</h1>

          {/* Subtitle frame matching the exact Spline UI box */}
          <div className="eternal-subtitle-box">
            <p className="subtitle-primary">Engineered beyond symmetry.</p>
            <p className="subtitle-secondary">A revolution in form and function.</p>
          </div>

          {/* Call to action group with accent line */}
          <div className="eternal-cta-group">
            {user ? (
              <>
                <Link to="/dashboard" className="eternal-origin-btn">
                  <span>ENTER DASHBOARD</span>
                  <ArrowUpRight size={14} />
                </Link>

                <Link to="/search" className="eternal-workspace-btn">
                  <span>EXPLORE REPOSITORIES</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="eternal-origin-btn">
                  <span>SIGN UP</span>
                  <ArrowUpRight size={14} />
                </Link>

                <Link to="/login" className="eternal-workspace-btn">
                  <span>SIGN IN</span>
                </Link>
              </>
            )}

            <div className="cta-accent-line"></div>
          </div>
        </div>
      </main>

      {/* FOOTER BAR — NON-SCROLLABLE LOWER DECK */}
      <footer className="eternal-footer-deck">
        <div className="deck-left">
          <span className="explore-tagline">EXPLORE THE ARCHITECTURE</span>
        </div>

        <div className="deck-right">
          <div className="status-orb" title="Supabase & Gemini 2.5 Flash Connected">
            <span className="orb-ring"></span>
            <span className="orb-dot"></span>
          </div>
        </div>
      </footer>

      {/* FLOATING QUICK SEARCH MODAL */}
      {searchModalOpen && (
        <div
          className="search-modal-backdrop"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="search-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Explore Public GitHub Repository</span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSearchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="modal-search-form">
              <div className="modal-input-wrap">
                <Search size={18} className="modal-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. facebook/react, vercel/next.js, or full URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="modal-submit-btn">
                <span>Analyze</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="modal-suggestions">
              <span className="suggestions-label">Try:</span>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => handleQuickPick("facebook/react")}
              >
                facebook/react
              </button>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => handleQuickPick("vercel/next.js")}
              >
                vercel/next.js
              </button>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => handleQuickPick("tailwindlabs/tailwindcss")}
              >
                tailwindlabs/tailwindcss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
