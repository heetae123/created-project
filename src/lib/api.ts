import { db } from './firebase';
import { compressImage } from './compress';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  addDoc, query, orderBy
} from 'firebase/firestore';

// =========================================================
// Settings
// =========================================================
export async function getSettings(key: string) {
  const snap = await getDoc(doc(db, 'settings', key));
  return snap.exists() ? snap.data().value : null;
}

// =========================================================
// Board
// =========================================================
export async function getBoardList(page = 1, pageLimit = 10, search = '') {
  const snapshot = await getDocs(collection(db, 'board'));
  let posts: any[] = [];
  snapshot.forEach(d => posts.push(d.data()));
  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.id || 0) - (a.id || 0);
  });

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.author || '').toLowerCase().includes(q)
    );
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const start = (page - 1) * pageLimit;
  const items = posts.slice(start, start + pageLimit);

  return { items, total, page, totalPages };
}

export async function getBoardPost(id: string) {
  const docRef = doc(db, 'board', decodeURIComponent(id));
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const post = snap.data();
  try {
    post.views = (post.views || 0) + 1;
    await updateDoc(docRef, { views: post.views });
  } catch {
    // 조회수 업데이트 실패 시 무시 (권한 오류 등)
  }
  return post;
}

export async function createBoardPost(data: any) {
  const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  const category = data.category || (data.isNotice ? 'notice' : 'news');
  const newPost = {
    id,
    title: data.title,
    author: data.author || '관리자',
    content: data.content,
    isNotice: category === 'notice',
    category,
    password: data.password || '',
    thumbnail: data.thumbnail || '',
    views: 0,
    date: (() => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; })(),
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'board', String(id)), newPost);
  return { success: true, id };
}

export async function getLatestPosts(limitCount = 4) {
  const snapshot = await getDocs(collection(db, 'board'));
  const posts = snapshot.docs.map(d => {
    const p = d.data();
    return {
      id: p.id,
      category: p.category || (p.isNotice ? 'notice' : 'news'),
      title: p.title,
      date: p.date || '',
      pinned: p.pinned || false,
    };
  });
  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const dateA = a.date ? a.date.replace(/\./g, '') : '0';
    const dateB = b.date ? b.date.replace(/\./g, '') : '0';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.id || 0) - (a.id || 0);
  });
  return posts.slice(0, limitCount);
}

export async function deleteBoardPost(id: string, password?: string) {
  const docRef = doc(db, 'board', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('게시물을 찾을 수 없습니다.');

  const existing = snap.data();
  if (existing.password && password && existing.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  await deleteDoc(docRef);
  return { success: true };
}

// =========================================================
// Portfolio
// =========================================================
export function generateSlug(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function getPortfolioList() {
  const snapshot = await getDocs(collection(db, 'portfolio'));
  const items: any[] = [];
  snapshot.forEach(d => items.push({ ...d.data(), id: d.id }));
  // sortOrder 높을수록 상단 (최신 등록 = Date.now() = 항상 최상단)
  items.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
  return items;
}

export async function getPortfolioItem(id: string) {
  const decodedId = decodeURIComponent(id);
  const snap = await getDoc(doc(db, 'portfolio', decodedId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

export async function savePortfolioItem(id: string, data: any) {
  await setDoc(doc(db, 'portfolio', id), data);
}

export async function updatePortfolioOrder(id: string, sortOrder: number) {
  await updateDoc(doc(db, 'portfolio', id), { sortOrder });
}

export async function deletePortfolioItem(id: string) {
  await deleteDoc(doc(db, 'portfolio', id));
}

// =========================================================
// Contact / Inquiry
// =========================================================
const CLOUDINARY_CLOUD_NAME = 'dtebg5vmp';
const CLOUDINARY_UPLOAD_PRESET = 'mai_unsigned';

export async function uploadFile(file: File): Promise<string> {
  const toUpload = file.type.startsWith('image/')
    ? await compressImage(file)
    : file;

  const formData = new FormData();
  formData.append('file', toUpload);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'mai-inquiries');

  const type = file.name.toLowerCase().endsWith('.pdf') ? 'raw' : 'image';
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || '파일 업로드에 실패했습니다.');
  }
  const data = await res.json();
  return data.secure_url;
}

export async function submitContact(data: any) {
  const inquiryData = {
    ...data,
    status: '신규',
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);
  return { success: true, id: docRef.id };
}
