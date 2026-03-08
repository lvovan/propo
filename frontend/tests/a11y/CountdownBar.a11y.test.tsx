import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import { createRef } from 'react';
import CountdownBar from '../../src/components/GamePlay/CountdownBar/CountdownBar';

describe('CountdownBar accessibility', () => {
  it('passes axe check with point label', async () => {
    const barRef = createRef<HTMLDivElement>();
    const pointLabelRef = createRef<HTMLElement>();
    const { container } = render(
      <CountdownBar barRef={barRef} pointLabelRef={pointLabelRef} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
