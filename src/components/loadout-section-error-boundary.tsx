"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  /** Short label for console logs (e.g. "damage panel"). */
  label?: string;
};

type State = { hasError: boolean };

/** Prevents one bad loadout subsection from crashing the whole page. */
export class LoadoutSectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`Loadout ${this.props.label ?? "section"} render failed`, error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
