/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useUserData } from './useUserData';

describe('useUserData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default user data', () => {
    const { result } = renderHook(() => useUserData());

    expect(result.current.userData).toEqual({
      selectedModel: 'openai-gpt-4.1',
    });
  });

  it('loads persisted data from localStorage on mount', () => {
    localStorage.setItem(
      'collextum-user-data',
      JSON.stringify({ selectedModel: 'anthropic-claude-3.5-sonnet' })
    );

    const { result } = renderHook(() => useUserData());

    expect(result.current.userData.selectedModel).toBe('anthropic-claude-3.5-sonnet');
  });

  it('persists data to localStorage when updated', () => {
    const { result } = renderHook(() => useUserData());

    act(() => {
      result.current.updateUserData({ selectedModel: 'openai-gpt-4o' });
    });

    const stored = JSON.parse(localStorage.getItem('collextum-user-data') || '{}');
    expect(stored.selectedModel).toBe('openai-gpt-4o');
  });

  it('merges updates with existing user data', () => {
    const { result } = renderHook(() => useUserData());

    act(() => {
      result.current.updateUserData({ selectedModel: 'openai-gpt-4o' });
    });

    act(() => {
      result.current.updateUserData({ parameters: { temperature: 0.5 } });
    });

    expect(result.current.userData.selectedModel).toBe('openai-gpt-4o');
    expect(result.current.userData.parameters?.temperature).toBe(0.5);
  });

  it('returns default data when localStorage contains invalid JSON', () => {
    localStorage.setItem('collextum-user-data', 'invalid-json{');

    const { result } = renderHook(() => useUserData());

    expect(result.current.userData).toEqual({
      selectedModel: 'openai-gpt-4.1',
    });
  });

  it('updates userData state after calling updateUserData', () => {
    const { result } = renderHook(() => useUserData());

    act(() => {
      result.current.updateUserData({ selectedModel: 'openai-o3' });
    });

    expect(result.current.userData.selectedModel).toBe('openai-o3');
  });
});
