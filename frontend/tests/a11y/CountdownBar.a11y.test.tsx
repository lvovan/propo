import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import { createRef } from 'react';
import CountdownBar from '../../src/components/GamePlay/CountdownBar/CountdownBar';

describe('CountdownBar competitive accessibility', () => {
  it('passes axe check for standard variant', async () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check for competitive variant with point label', async () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(
      <CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} competitive />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
