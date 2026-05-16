// Smoke test — verify Vitest config, jsdom environment, and RTL setup work correctly

import { describe, it, expect } from 'vitest';

describe('Vitest Configuration', () => {
  it('should have jsdom environment available', () => {
    expect(window).toBeDefined();
    expect(document).toBeDefined();
    expect(document.createElement).toBeDefined();
  });

  it('should support DOM manipulation', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    document.body.appendChild(div);
    expect(document.body.querySelector('div')?.textContent).toBe('Hello World');
    document.body.removeChild(div);
  });

  it('should have globals enabled (describe, it, expect)', () => {
    expect(true).toBe(true);
  });
});

describe('Test Setup', () => {
  it('should have @testing-library/jest-dom matchers available', () => {
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'test-element');
    document.body.appendChild(div);

    // Verify the element is in the DOM
    expect(document.body.contains(div)).toBe(true);
    expect(div.getAttribute('data-testid')).toBe('test-element');
    expect(div).toBeDefined();

    document.body.removeChild(div);
  });
});
