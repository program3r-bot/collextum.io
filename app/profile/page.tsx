"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const AVAILABLE_MODELS = [
  { id: "openai-gpt-4.1", label: "GPT-4.1 (OpenAI)" },
  { id: "openai-gpt-4o", label: "GPT-4o (OpenAI)" },
  { id: "openai-gpt-4o-mini", label: "GPT-4o Mini (OpenAI)" },
  { id: "alibaba-qwen3-32b", label: "Qwen3 32B (Alibaba)" },
  { id: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 70B (DeepSeek)" },
  { id: "llama3.3-70b-instruct", label: "Llama 3.3 70B (Meta)" },
  { id: "mistral-nemo-instruct-2407", label: "Mistral Nemo 2407 (Mistral)" },
];

export default function ProfilePage() {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const [displayName, setDisplayName] = useState("");
  const [preferredModel, setPreferredModel] = useState("openai-gpt-4.1");
  const [saved, setSaved] = useState(false);

  // Sync local state when profile loads from localStorage
  useEffect(() => {
    setDisplayName(profile.displayName);
    setPreferredModel(profile.preferredModel);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName: displayName.trim(), preferredModel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetProfile();
    setDisplayName("");
    setPreferredModel("openai-gpt-4.1");
  };

  return (
    <div className="min-h-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <UserCircleIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Personalise your experience with the AI Chat interface.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                How you&apos;ll appear in the chat interface.
              </p>
            </div>

            {/* Preferred Model */}
            <div>
              <label
                htmlFor="preferredModel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Model
              </label>
              <select
                id="preferredModel"
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The model selected by default when you open the chat.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Reset to defaults
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {saved ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
