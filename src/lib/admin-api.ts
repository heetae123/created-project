import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { compressImage } from './compress';

// =========================================================
// SHARED KEYS (mirrors 1.html SHARED_KEYS, strips mai_ prefix for Firestore)
// =========================================================
const SHARED_KEYS = [
  'mai_hero', 'mai_hero_text', 'mai_brochure', 'mai_team',
  'mai_service_images', 'mai_inquiries', 'mai_seo', 'mai_kakao', 'mai_email',
  'mai_map', 'mai_service_styles', 'mai_about_styles', 'mai_landing_texts'
];

function toFirestoreKey(key: string): string {
  return key.replace('mai_', '');
}

// =========================================================
// Settings (SHARED_KEYS → Firestore settings/{key})
// =========================================================
export async function adminGetSettings(key: string): Promise<any> {
  const fsKey = SHARED_KEYS.includes(key) ? toFirestoreKey(key) : key;
  const snap = await getDoc(doc(db, 'settings', fsKey));
  return snap.exists() ? snap.data().value : null;
}

export async function adminSaveSettings(key: string, value: any): Promise<void> {
  const fsKey = SHARED_KEYS.includes(key) ? toFirestoreKey(key) : key;
  await setDoc(doc(db, 'settings', fsKey), { value });
}

// Admin password: managed via Firebase Auth (signInWithEmailAndPassword).

// =========================================================
// Board
// =========================================================
export async function toggleBoardPin(id: string, pinned: boolean): Promise<void> {
  await updateDoc(doc(db, 'board', String(id)), { pinned });
}

export async function getBoardPosts(): Promise<any[]> {
  const snapshot = await getDocs(collection(db, 'board'));
  const posts: any[] = [];
  snapshot.forEach(d => posts.push(d.data()));
  posts.sort((a, b) => (b.id || 0) - (a.id || 0));
  return posts;
}

export async function saveBoardPost(data: {
  title: string;
  content: string;
  blocks?: any[];
  thumbnail: string;
  category: string;
  isNotice: boolean;
  editId?: string | null;
}): Promise<void> {
  if (data.editId) {
    await updateDoc(doc(db, 'board', data.editId), {
      title: data.title,
      content: data.content,
      blocks: data.blocks ?? [],
      thumbnail: data.thumbnail,
      isNotice: data.isNotice,
      category: data.category,
    });
  } else {
    const id = Date.now();
    await setDoc(doc(db, 'board', String(id)), {
      id,
      title: data.title,
      author: '관리자',
      content: data.content,
      blocks: data.blocks ?? [],
      thumbnail: data.thumbnail,
      isNotice: data.isNotice,
      category: data.category,
      password: '',
      views: 0,
      date: (() => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; })(),
      createdAt: new Date().toISOString(),
    });
  }
}

export async function deleteBoardPost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'board', String(id)));
}

// =========================================================
// Inquiries
// =========================================================
export async function getInquiries(): Promise<any[]> {
  try {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, 'inquiries'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, 'inquiries', id), { status });
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'inquiries', id));
}

// =========================================================
// Cloudinary: direct browser upload (unsigned preset)
// Settings > Upload > Upload presets > Add unsigned preset "mai_unsigned"
// =========================================================
const CLOUDINARY_CLOUD_NAME = 'dtebg5vmp';
const CLOUDINARY_UPLOAD_PRESET = 'mai_unsigned';

export async function uploadToCloudinary(file: File, folder = 'mai-services', resourceType: 'image' | 'raw' | 'auto' = 'image'): Promise<string> {
  // Compress images in-browser before upload (5MB → ≤1MB, no server changes needed)
  const uploadFile = (resourceType === 'image' && file.type.startsWith('image/'))
    ? await compressImage(file)
    : file;

  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const type = resourceType === 'raw' ? 'raw' : 'image';
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || '업로드 실패');
  }

  const data = await res.json();
  return data.secure_url;
}

