import './Profile.css';
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { FiEdit2, FiHome, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import DashboardCard from "../../../components/dashboard_components/card_component/DashboardCard";
import FormField from "../../../components/common_components/form_field/FormField";
import RoleBadge from "../../../components/common_components/role_badge/RoleBadge";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSessionUser } from "../../../hooks/useSessionUser";
import { getUserById, updateUser } from "../../api/user/UserApi";
import type { BackendUserRole, User, UserUpdatePayload } from "../../api/user/UserApi";
import { normalizeRole, setUser } from "../../../utils/authStorage";
import type { SessionUser } from "../../../utils/authStorage";
import { getErrorMessage } from "../../../utils/apiError";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS: { name: keyof UserUpdatePayload; label: string; type?: "email" | "textarea" }[] = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone_number", label: "Phone Number" },
  { name: "address", label: "Address", type: "textarea" },
];

const toSessionUser = (user: User): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  institution: user.institution,
});

interface ProfileFormProps {
  user: User;
  onSaved: (user: User) => void;
  onCancel: () => void;
}

const ProfileForm = ({ user, onSaved, onCancel }: ProfileFormProps) => {
  const [values, setValues] = useState<UserUpdatePayload>({
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    address: user.address,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserUpdatePayload, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    FIELDS.forEach((field) => {
      if (!values[field.name].trim()) nextErrors[field.name] = `${field.label} is required`;
    });
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setSaving(true);
      setError("");
      const payload: UserUpdatePayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
        address: values.address.trim(),
      };
      await updateUser(user.id, payload);
      onSaved({ ...user, ...payload });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
      setSaving(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <div className="profile-form-grid">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "full-width" : ""}>
            <FormField
              name={field.name}
              label={field.label}
              type={field.type}
              value={values[field.name]}
              onChange={handleChange}
              error={errors[field.name]}
              disabled={saving}
              required
            />
          </div>
        ))}
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      <div className="profile-form-actions">
        <button type="button" className="btn-outline-grey" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn-primary-red" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: typeof FiMail; label: string; value?: string | null }) => (
  <div className="profile-detail">
    <Icon className="profile-detail-icon" />
    <div>
      <span className="profile-detail-label">{label}</span>
      <span className="profile-detail-value">{value || "-"}</span>
    </div>
  </div>
);

const Profile = () => {
  const sessionUser = useSessionUser();
  const isAdmin = sessionUser?.role === "admin";
  const userId = sessionUser?.id;

  // GET /user/{id} is admin only; other roles see what was saved at login
  const loadProfile = useCallback(async (): Promise<User | null> => {
    if (!isAdmin || !userId) return null;
    const { body } = await getUserById(userId);
    return body;
  }, [isAdmin, userId]);
  const { data: loadedUser, error, loading } = useAsyncData(loadProfile);

  const [savedUser, setSavedUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const user = savedUser ?? loadedUser;

  const handleSaved = (updated: User) => {
    setSavedUser(updated);
    setUser(toSessionUser(updated));
    setEditing(false);
    setMessage("Profile updated");
  };

  const name = user?.name ?? sessionUser?.name ?? "User";
  const role = (user?.role ?? sessionUser?.role.toUpperCase() ?? "OPERATOR") as BackendUserRole;

  return (
    <div className="profile-page">
      <h2 className="profile-title">My Profile</h2>

      {/* SUMMARY */}
      <div className="profile-hero">
        <div className="profile-hero-avatar">{name.charAt(0).toUpperCase()}</div>
        <div className="profile-hero-info">
          <span className="profile-hero-name">{name}</span>
          <RoleBadge role={role} />
        </div>
        {user && !editing && (
          <button
            className="btn-primary-red profile-edit-btn"
            onClick={() => {
              setMessage("");
              setEditing(true);
            }}
          >
            <FiEdit2 /> Edit profile
          </button>
        )}
      </div>

      {message && <p className="profile-success">{message}</p>}

      {/* DETAILS / EDIT */}
      <DashboardCard title={editing ? "Edit details" : "Details"} error={error}>
        {editing && user ? (
          <ProfileForm user={user} onSaved={handleSaved} onCancel={() => setEditing(false)} />
        ) : loading && isAdmin && !user ? (
          <p>Loading profile...</p>
        ) : (
          <div className="profile-details">
            <DetailRow icon={FiMail} label="Email" value={user?.email ?? sessionUser?.email} />
            <DetailRow icon={FiPhone} label="Phone Number" value={user?.phone_number} />
            <DetailRow icon={FiHome} label="Institution" value={(user?.institution ?? sessionUser?.institution)?.name} />
            <DetailRow icon={FiMapPin} label="Address" value={user?.address} />
          </div>
        )}

        {!isAdmin && (
          <p className="profile-note">
            Editing your profile is only available to admins right now. Please contact your administrator to update your details.
          </p>
        )}
      </DashboardCard>
    </div>
  );
};

export default Profile;
