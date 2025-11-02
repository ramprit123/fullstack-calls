import React, { useState } from "react";
import { useApi } from "@/hooks/useApi";

export const UserProfile = () => {
  const {
    useProfile,
    useUpdateProfile,
    useUpdatePreferences,
    useUpdateAddress,
  } = useApi();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const updateAddress = useUpdateAddress();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    preferences: {
      theme: "light",
      notifications: true,
    },
    address: {
      street: "",
      city: "",
      country: "",
    },
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        preferences: profile.preferences || {
          theme: "light",
          notifications: true,
        },
        address: profile.address || { street: "", city: "", country: "" },
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      await updatePreferences.mutateAsync(formData.preferences);
      await updateAddress.mutateAsync(formData.address);

      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {profile?.firstName || "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {profile?.lastName || "Not set"}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-gray-900">{profile?.email}</p>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <p className="mt-1 text-gray-900 capitalize">{profile?.role}</p>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Preferences</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              {editMode ? (
                <select
                  value={formData.preferences.theme}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        theme: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900 capitalize">
                  {profile?.preferences?.theme || "light"}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center">
                {editMode ? (
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          notifications: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                ) : (
                  <span className="mr-2">
                    {profile?.preferences?.notifications ? "✓" : "✗"}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-700">
                  Enable Notifications
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Address</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {profile?.address?.street || "Not set"}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {profile?.address?.city || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          country: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {profile?.address?.country || "Not set"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        {profile?._id && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Database Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Database ID: {profile._id}</p>
              <p>Clerk ID: {profile.id}</p>
              <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
              {profile.lastLoginAt && (
                <p>
                  Last Login:{" "}
                  {new Date(profile.lastLoginAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {editMode && (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
