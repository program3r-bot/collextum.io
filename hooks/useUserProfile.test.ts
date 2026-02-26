/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useUserProfile } from "./useUserProfile";

describe("useUserProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default profile", () => {
    const { result } = renderHook(() => useUserProfile());

    expect(result.current.profile).toEqual({
      displayName: "",
      preferredModel: "openai-gpt-4.1",
    });
  });

  it("updates display name", () => {
    const { result } = renderHook(() => useUserProfile());

    act(() => {
      result.current.updateProfile({ displayName: "Alice" });
    });

    expect(result.current.profile.displayName).toBe("Alice");
  });

  it("updates preferred model", () => {
    const { result } = renderHook(() => useUserProfile());

    act(() => {
      result.current.updateProfile({ preferredModel: "openai-gpt-4o-mini" });
    });

    expect(result.current.profile.preferredModel).toBe("openai-gpt-4o-mini");
  });

  it("persists profile to localStorage", () => {
    const { result } = renderHook(() => useUserProfile());

    act(() => {
      result.current.updateProfile({ displayName: "Bob" });
    });

    const stored = JSON.parse(localStorage.getItem("user-profile") || "{}");
    expect(stored.displayName).toBe("Bob");
  });

  it("loads profile from localStorage on mount", () => {
    localStorage.setItem(
      "user-profile",
      JSON.stringify({ displayName: "Carol", preferredModel: "openai-gpt-4o" })
    );

    const { result } = renderHook(() => useUserProfile());

    // After the useEffect runs
    act(() => {});

    expect(result.current.profile.displayName).toBe("Carol");
    expect(result.current.profile.preferredModel).toBe("openai-gpt-4o");
  });

  it("resets profile to defaults", () => {
    const { result } = renderHook(() => useUserProfile());

    act(() => {
      result.current.updateProfile({ displayName: "Dave" });
    });

    act(() => {
      result.current.resetProfile();
    });

    expect(result.current.profile.displayName).toBe("");
    expect(result.current.profile.preferredModel).toBe("openai-gpt-4.1");
    expect(localStorage.getItem("user-profile")).toBeNull();
  });

  it("merges partial updates without overwriting other fields", () => {
    const { result } = renderHook(() => useUserProfile());

    act(() => {
      result.current.updateProfile({
        displayName: "Eve",
        preferredModel: "openai-gpt-4o",
      });
    });

    act(() => {
      result.current.updateProfile({ displayName: "Eve Updated" });
    });

    expect(result.current.profile.displayName).toBe("Eve Updated");
    expect(result.current.profile.preferredModel).toBe("openai-gpt-4o");
  });
});
