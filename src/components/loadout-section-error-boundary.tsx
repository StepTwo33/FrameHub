"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  /** Short label for console logs (e.g. "damage panel"). */
  label?: string;
  /** When this changes, retry rendering after a prior error. */
  resetKey?: string | number;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; message?: string };

/** Prevents one bad loadout subsection from crashing the whole page. */
export class LoadoutSectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: undefined });
    }
  }

  componentDidCatch(error: unknown) {
    console.warn(`Loadout ${this.props.label ?? "section"} render failed`, error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return null;
    }
    return this.props.children;
  }
}
