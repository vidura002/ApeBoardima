import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Upload, X, Plus, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import LocationPicker from '../components/listings/LocationPicker';
import { ACTIVE_AREAS } from '../data/mockData';
import { upload as uploadApi, properties as propertiesApi } from '../services/api';
import type { GenderPolicy, ListingType, OccupancyType } from '../types';

const STEPS = ['Basic info', 'Details', 'Amenities', 'Photos', 'Review'];
const AMENITY_OPTIONS = [
  'WiFi', 'Air Conditioning', 'Parking', 'Kitchen', 'Attached Bathroom',
  'Study Desk', 'Wardrobe', 'Balcony', 'Ceiling Fan', 'Security',
  'CCTV', 'Hot Water', 'Washing Machine', 'Meals Available', 'Common Kitchen',
  'Common Room', 'Study Area', 'Laundry', 'Water 24/7', 'Caretaker',
];

const ROOM_TYPES: ListingType[] = ['room', 'boarding', 'annex', 'hostel', 'apartment', 'shared'];

interface FormData {
  title: string;
  type: ListingType;
  area: string;
  address: string;
  latitude: string;
  longitude: string;
  googleMapUrl: string;
  price: string;
  priceUnit: 'monthly' | 'weekly';
  gender: GenderPolicy;
  occupancy: OccupancyType;
  bathrooms: string;
  description: string;
  furnished: boolean;
  amenities: string[];
  availableFrom: string;
  contactName: string;
  contactPhone: string;
  contactWhatsApp: string;
  nearbyLandmarks: string[];
}

const INITIAL: FormData = {
  title: '',
  type: 'room',
  area: '',
  address: '',
  latitude: '',
  longitude: '',
  googleMapUrl: '',
  price: '',
  priceUnit: 'monthly',
  gender: 'any',
  occupancy: 'single',
  bathrooms: '1',
  description: '',
  furnished: true,
  amenities: [],
  availableFrom: '',
  contactName: '',
  contactPhone: '',
  contactWhatsApp: '',
  nearbyLandmarks: [],
};

function parseMapCoordinates(value: string) {
  const decoded = decodeURIComponent(value.trim());
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return { latitude: String(latitude), longitude: String(longitude) };
    }
  }

  return null;
}

function mapUrls(latitude: string, longitude: string) {
  if (!latitude || !longitude) return null;
  const query = `${latitude},${longitude}`;
  return {
    embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`,
    open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  };
}

function googleMapsUrl(latitude: string, longitude: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

export default function CreateListingPage() {
  const { currentUser, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [landmark, setLandmark] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loadingListing, setLoadingListing] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [locationError, setLocationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    setLoadingListing(true);
    propertiesApi.get(id)
      .then(listing => {
        setForm({
          title: listing.title,
          type: listing.type,
          area: listing.area,
          address: listing.address,
          latitude: listing.latitude !== undefined ? String(listing.latitude) : '',
          longitude: listing.longitude !== undefined ? String(listing.longitude) : '',
          googleMapUrl: listing.googleMapUrl || '',
          price: String(listing.price),
          priceUnit: listing.priceUnit,
          gender: listing.gender,
          occupancy: listing.occupancy,
          bathrooms: String(listing.bathrooms),
          description: listing.description,
          furnished: listing.furnished,
          amenities: listing.amenities,
          availableFrom: listing.availableFrom ? listing.availableFrom.slice(0, 10) : '',
          contactName: listing.contactName,
          contactPhone: listing.contactPhone,
          contactWhatsApp: listing.contactWhatsApp || '',
          nearbyLandmarks: listing.nearbyLandmarks,
        });
        setExistingImages(listing.images || []);
        setPreviews(listing.images || []);
      })
      .catch(err => setSubmitError(err instanceof Error ? err.message : 'Failed to load listing'))
      .finally(() => setLoadingListing(false));
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    navigate('/auth?mode=login');
    return null;
  }

  const update = (k: keyof FormData, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const toggleAmenity = (am: string) =>
    update('amenities', form.amenities.includes(am)
      ? form.amenities.filter(a => a !== am)
      : [...form.amenities, am]);

  const addLandmark = () => {
    if (landmark.trim()) {
      update('nearbyLandmarks', [...form.nearbyLandmarks, landmark.trim()]);
      setLandmark('');
    }
  };

  const handleMapInput = (value: string) => {
    setLocationError('');
    const coordinates = parseMapCoordinates(value);
    setForm(prev => ({
      ...prev,
      googleMapUrl: value,
      latitude: coordinates?.latitude || '',
      longitude: coordinates?.longitude || '',
    }));
  };

  const handleMapPick = (latitude: string, longitude: string) => {
    setLocationError('');
    setForm(prev => ({
      ...prev,
      latitude,
      longitude,
      googleMapUrl: googleMapsUrl(latitude, longitude),
    }));
  };

  const handleNext = () => {
    if (step === 0 && (!form.latitude || !form.longitude)) {
      setLocationError('Please paste an exact Google Maps pin. If a short link does not show a preview, copy the pin numbers from Google Maps and paste them here.');
      return;
    }
    setStep(s => s + 1);
  };

  const handleFilesChange = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected).slice(0, 10 - files.length - existingImages.length);
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  };

  const removeFile = (i: number) => {
    if (i < existingImages.length) {
      setExistingImages(prev => prev.filter((_, idx) => idx !== i));
      setPreviews(prev => prev.filter((_, idx) => idx !== i));
      return;
    }

    URL.revokeObjectURL(previews[i]);
    const fileIndex = i - existingImages.length;
    setFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      let uploadedImageUrls: string[] = [];
      if (files.length > 0) {
        const res = await uploadApi.images(files);
        uploadedImageUrls = res.urls;
      }
      const payload = {
        title: form.title,
        type: form.type,
        area: form.area,
        address: form.address,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        googleMapUrl: form.googleMapUrl || undefined,
        price: Number(form.price),
        priceUnit: form.priceUnit,
        gender: form.gender,
        occupancy: form.occupancy,
        bathrooms: Number(form.bathrooms),
        description: form.description,
        furnished: form.furnished,
        amenities: form.amenities,
        availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : undefined,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactWhatsApp: form.contactWhatsApp || undefined,
        nearbyLandmarks: form.nearbyLandmarks,
        imageUrls: isEditMode ? [...existingImages, ...uploadedImageUrls] : uploadedImageUrls,
      };
      if (id) {
        await propertiesApi.update(id, payload);
      } else {
        await propertiesApi.create(payload);
      }
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard/landlord'), 2500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center max-w-sm mx-4 shadow-card">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B1220] mb-2">{isEditMode ? 'Listing updated!' : 'Listing submitted!'}</h2>
          <p className="text-[#64748B] text-sm leading-relaxed">
            {isEditMode
              ? 'Your changes have been saved.'
              : 'Your listing is under review. Our team will verify and publish it within 24 hours.'}
          </p>
          <div className="mt-4 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-[progress_2.5s_ease-out_forwards]" style={{ width: '100%', transition: 'width 2.5s' }} />
          </div>
        </div>
      </div>
    );
  }

  const locationPreview = mapUrls(form.latitude, form.longitude);

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-4 text-sm font-medium text-[#64748B] shadow-card">
          Loading listing...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard/landlord')}
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-bold text-[#0B1220]">{isEditMode ? 'Edit listing' : 'Post a listing'}</h1>
          <p className="text-xs text-[#94A3B8]">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F1F5F9]">
        <div
          className="h-full bg-[#0F172A] transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#F1F5F9] text-[#94A3B8]'
                }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#E5E7EB]" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
          {/* Step 0: Basic info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1220]">Basic information</h2>

              <Field label="Listing title" required>
                <input
                  type="text"
                  placeholder="e.g. Modern single room near SLIIT Junction"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Accommodation type" required>
                <div className="grid grid-cols-3 gap-2">
                  {ROOM_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update('type', t)}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
                        form.type === t
                          ? 'border-[#0F172A] bg-[#0F172A] text-white'
                          : 'border-[#E5E7EB] text-[#475569] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Area" required>
                  <select value={form.area} onChange={e => update('area', e.target.value)} className={inputCls}>
                    <option value="">Select area</option>
                    {ACTIVE_AREAS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </Field>

                <Field label="Rent amount" required>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#64748B]">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="12500"
                        value={form.price}
                        onChange={e => update('price', e.target.value)}
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                    <select
                      value={form.priceUnit}
                      onChange={e => update('priceUnit', e.target.value)}
                      className={inputCls}
                    >
                      <option value="monthly">Per month</option>
                      <option value="weekly">Per week</option>
                    </select>
                  </div>
                </Field>
              </div>

              <Field label="Full address" required>
                <input
                  type="text"
                  placeholder="No. 45/A, New Kandy Road, Malabe"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Property map location" required>
                <div className="space-y-3">
                  <LocationPicker
                    area={form.area}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onPick={handleMapPick}
                  />
                  <details className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-[#0F172A]">
                      Paste a Google Maps link instead
                    </summary>
                    <div className="relative mt-3">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="Paste Google Maps pin link"
                        value={form.googleMapUrl}
                        onChange={e => handleMapInput(e.target.value)}
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </details>
                  {locationError && (
                    <p className="text-xs font-medium text-red-600">{locationError}</p>
                  )}
                  {locationPreview && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Exact pin added
                      </p>
                      <a
                        href={locationPreview.open}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#475569]"
                      >
                        Open map
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Nearby landmarks">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. SLIIT, Cargills, Bus Stop"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLandmark())}
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={addLandmark} className="px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1e293b] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.nearbyLandmarks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.nearbyLandmarks.map(lm => (
                      <span key={lm} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-full">
                        {lm}
                        <button onClick={() => update('nearbyLandmarks', form.nearbyLandmarks.filter(l => l !== lm))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1220]">Room details</h2>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Gender policy">
                  <select value={form.gender} onChange={e => update('gender', e.target.value as GenderPolicy)} className={inputCls}>
                    <option value="any">Any</option>
                    <option value="male">Males only</option>
                    <option value="female">Females only</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </Field>

                <Field label="Occupancy">
                  <select value={form.occupancy} onChange={e => update('occupancy', e.target.value as OccupancyType)} className={inputCls}>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </Field>

                <Field label="Bathrooms">
                  <select value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} className={inputCls}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </Field>
              </div>

              <Field label="Available from" required>
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={e => update('availableFrom', e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Is the room furnished?">
                <div className="flex gap-3">
                  {[{ v: true, l: 'Furnished' }, { v: false, l: 'Unfurnished' }].map(opt => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => update('furnished', opt.v)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.furnished === opt.v
                          ? 'border-[#0F172A] bg-[#0F172A] text-white'
                          : 'border-[#E5E7EB] text-[#475569] hover:border-[#CBD5E1]'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Description" required>
                <textarea
                  placeholder="Describe the room, house, environment, rules, access to transport, etc."
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={5}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-[#94A3B8] mt-1">{form.description.length}/500 characters</p>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Contact name" required>
                  <input type="text" placeholder="Your name" value={form.contactName} onChange={e => update('contactName', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Phone number" required>
                  <input type="tel" placeholder="077 xxx xxxx" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} className={inputCls} />
                </Field>
                <Field label="WhatsApp (optional)">
                  <input type="tel" placeholder="077 xxx xxxx" value={form.contactWhatsApp} onChange={e => update('contactWhatsApp', e.target.value)} className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Amenities */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1220]">Amenities</h2>
              <p className="text-sm text-[#64748B]">Select all that are available in your property.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map(am => (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`text-left text-sm font-medium px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      form.amenities.includes(am)
                        ? 'border-[#0F172A] bg-[#0F172A] text-white'
                        : 'border-[#E5E7EB] text-[#475569] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {form.amenities.includes(am) && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                    {am}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#94A3B8]">{form.amenities.length} selected</p>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1220]">Photos</h2>
              <p className="text-sm text-[#64748B]">
                Upload real photos of the actual room. Stock photos are not allowed.
                Up to 10 photos, JPG/PNG up to 5MB each.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFilesChange(e.target.files)}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFilesChange(e.dataTransfer.files); }}
                className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-10 text-center hover:border-[#CBD5E1] transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
                <p className="font-semibold text-[#475569] text-sm">Drag & drop photos here</p>
                <p className="text-xs text-[#94A3B8] mt-1">or click to browse — JPG, PNG up to 5MB each</p>
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-[#0F172A] border border-[#E5E7EB] px-4 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  Choose files
                </button>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden bg-[#F1F5F9]" style={{ paddingBottom: '70%' }}>
                      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                      >
                        <X className="w-3 h-3 text-[#475569]" />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#0F172A]/70 text-white text-xs text-center py-1 font-medium">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-[#94A3B8]">{files.length}/10 photos selected</p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1220]">Review your listing</h2>
              <div className="bg-[#F8FAFC] rounded-2xl p-5 space-y-3 text-sm">
                {[
                  { label: 'Title', value: form.title || '—' },
                  { label: 'Type', value: form.type },
                  { label: 'Area', value: form.area || '—' },
                  { label: 'Address', value: form.address || '—' },
                  { label: 'Map location', value: form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : '—' },
                  { label: 'Price', value: form.price ? `Rs. ${Number(form.price).toLocaleString()}/${form.priceUnit}` : '—' },
                  { label: 'Gender policy', value: form.gender },
                  { label: 'Occupancy', value: form.occupancy },
                  { label: 'Furnished', value: form.furnished ? 'Yes' : 'No' },
                  { label: 'Available from', value: form.availableFrom || '—' },
                  { label: 'Amenities', value: form.amenities.length > 0 ? form.amenities.join(', ') : 'None selected' },
                  { label: 'Contact', value: form.contactName ? `${form.contactName} · ${form.contactPhone}` : '—' },
                ].map(row => (
                  <div key={row.label} className="flex gap-3">
                    <span className="text-[#94A3B8] w-28 flex-shrink-0 font-medium">{row.label}</span>
                    <span className="text-[#0F172A] capitalize">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 text-sm text-[#475569]">
                <p className="font-semibold mb-1 text-[#0F172A]">What happens next?</p>
                <p>{isEditMode ? 'Save your changes when everything looks correct.' : 'Our team will review your listing within 24 hours. Once approved, it will go live to all users. You will receive a notification when it is published.'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {submitError && (
          <p className="mt-4 text-sm text-red-600 text-center">{submitError}</p>
        )}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard/landlord')}
            className="flex items-center gap-2 text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <Button variant="primary" size="lg" onClick={handleNext}>
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save changes' : 'Submit listing')}
              {!submitting && <CheckCircle className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all placeholder-[#CBD5E1] bg-white';
