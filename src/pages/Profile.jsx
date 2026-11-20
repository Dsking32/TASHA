import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { editProfile } from '../api/profile';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    gender: user?.gender || '',
    date_of_birth: user?.date_of_birth || '',
    residential_address: user?.residential_address || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setNotice('');
    setErrors({});
    setLoading(true);
    try {
      const payload = photoFile ? { ...form, profile_photo: photoFile } : form;
      await editProfile(payload);
      await refreshProfile();
      setNotice('Profile updated.');
    } catch (err) {
      setFormError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <PageHeader eyebrow="Account" title="Your profile" subtitle={user?.email} />

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-asphalt/15 bg-paper-dim">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-slate/50">
                No photo
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="inline-block rounded-full border border-asphalt/15 px-5 py-2.5 font-body text-sm font-semibold text-asphalt hover:border-rose hover:text-rose">
              Change photo
            </span>
            <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            error={errors.first_name?.[0]}
          />
          <Field
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={onChange}
            error={errors.last_name?.[0]}
          />
        </div>

        <Field
          label="Phone number"
          name="phone_number"
          type="tel"
          value={form.phone_number}
          onChange={onChange}
          error={errors.phone_number?.[0]}
        />

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
            Gender
          </span>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            className="w-full rounded-xl border border-transparent bg-paper-dim px-4 py-3.5 text-[15px] font-medium text-asphalt transition-[border-color,background-color,box-shadow] duration-200 focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <Field
          label="Date of birth"
          name="date_of_birth"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          value={form.date_of_birth}
          onChange={onChange}
          error={errors.date_of_birth?.[0]}
        />

        <Field
          label="Residential address"
          name="residential_address"
          value={form.residential_address}
          onChange={onChange}
          error={errors.residential_address?.[0]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Emergency contact name"
            name="emergency_contact_name"
            value={form.emergency_contact_name}
            onChange={onChange}
            error={errors.emergency_contact_name?.[0]}
          />
          <Field
            label="Emergency contact phone"
            name="emergency_contact_phone"
            type="tel"
            value={form.emergency_contact_phone}
            onChange={onChange}
            error={errors.emergency_contact_phone?.[0]}
          />
        </div>

        {formError && <p className="font-mono text-sm text-alert">{formError}</p>}
        {notice && <p className="font-mono text-sm text-signal">{notice}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Save changes
        </Button>
      </form>
    </div>
  );
}
