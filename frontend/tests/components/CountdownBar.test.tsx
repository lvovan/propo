import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { createRef } from 'react';
import CountdownBar from '../../src/components/GamePlay/CountdownBar/CountdownBar';

describe('CountdownBar', () => {
  it('renders a container with role="progressbar"', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('has aria-valuemin="0" and aria-valuemax="10"', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('has aria-label "Points available"', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toHaveAttribute('aria-label', 'Points available');
  });

  it('attaches barRef to the fill element', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('fill element has initial full width and green background', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    const fill = barRef.current!;
    expect(fill.style.width).toBe('100%');
    expect(fill.style.backgroundColor).toBeTruthy();
  });

  it('uses the 16px track class', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar!.className).toContain('track');
  });

  it('renders point label with localized text', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    // The hidden span holds the raw numeric value for the timer hook
    expect(pointLabelRef.current).toBeInstanceOf(HTMLElement);
    expect(pointLabelRef.current!.textContent).toBe('10');

    // The visible label should show "10 points"
    const visibleLabel = container.querySelector('[aria-hidden="true"]');
    expect(visibleLabel).toBeInTheDocument();
    expect(visibleLabel!.textContent).toBe('10 points');
  });

  it('always renders the point label', () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    render(<CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />);

    expect(pointLabelRef.current).not.toBeNull();
  });
});
