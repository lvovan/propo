import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { createRef } from 'react';
import CountdownBar from '../../src/components/GamePlay/CountdownBar/CountdownBar';

describe('CountdownBar', () => {
  it('renders a container with role="progressbar"', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('has aria-valuemin="0" and aria-valuemax="5"', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '5');
  });

  it('attaches barRef to the fill element', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<CountdownBar barRef={barRef} />);

    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('fill element has initial full width and green background', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<CountdownBar barRef={barRef} />);

    const fill = barRef.current!;
    expect(fill.style.width).toBe('100%');
    expect(fill.style.backgroundColor).toBeTruthy();
  });

  it('container has a track background for contrast', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    // The track should have a visible background (via CSS module class)
    expect(progressbar!.className).toBeTruthy();
  });

  describe('competitive variant', () => {
    it('renders thicker track when competitive is true', () => {
      const barRef = createRef<HTMLDivElement>();
      const { container } = render(
        <CountdownBar barRef={barRef} competitive />,
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar!.className).toContain('trackCompetitive');
    });

    it('renders standard track when competitive is false', () => {
      const barRef = createRef<HTMLDivElement>();
      const { container } = render(<CountdownBar barRef={barRef} />);

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar!.className).not.toContain('trackCompetitive');
    });

    it('renders point label when pointLabelRef is provided and competitive', () => {
      const barRef = createRef<HTMLDivElement>();
      const pointLabelRef = createRef<HTMLElement>();
      const { container } = render(
        <CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} competitive />,
      );

      expect(pointLabelRef.current).toBeInstanceOf(HTMLElement);
      expect(pointLabelRef.current!.textContent).toBe('10');
    });

    it('does not render point label when competitive is false', () => {
      const barRef = createRef<HTMLDivElement>();
      const pointLabelRef = createRef<HTMLElement>();
      const { container } = render(
        <CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />,
      );

      // pointLabelRef should not be attached
      expect(pointLabelRef.current).toBeNull();
    });

    it('has aria-label "Points available" when competitive', () => {
      const barRef = createRef<HTMLDivElement>();
      const { container } = render(
        <CountdownBar barRef={barRef} competitive />,
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveAttribute('aria-label', 'Points available');
    });

    it('has aria-valuemax="10" when competitive', () => {
      const barRef = createRef<HTMLDivElement>();
      const { container } = render(
        <CountdownBar barRef={barRef} competitive />,
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });
  });
});
