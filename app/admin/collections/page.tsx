"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/serializers";
import Link from "next/link";

type CollectionRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  order: number;
  _count?: { products: number };
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [editing, setEditing] = useState<CollectionRecord | null>(null);

  async function loadCollections() {
    const response = await fetch("/api/admin/collections");
    setCollections(await response.json());
  }

  useEffect(() => {
    void loadCollections();
  }, []);

  function startCreate() {
    setEditing({ id: "", name: "", slug: "", description: "", coverImage: "", order: collections.length });
  }

  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json();
    setEditing((current) => current ? { ...current, coverImage: data.url } : current);
  }

  async function saveCollection() {
    if (!editing) return;
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/admin/collections/${editing.id}` : "/api/admin/collections";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    await loadCollections();
  }

  async function deleteCollection() {
    if (!editing?.id || !confirm("Delete this collection?")) return;
    await fetch(`/api/admin/collections/${editing.id}`, { method: "DELETE" });
    setEditing(null);
    await loadCollections();
  }

  async function moveCollection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= collections.length) return;
    const next = [...collections];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    const normalized = next.map((collection, currentIndex) => ({ ...collection, order: currentIndex }));
    setCollections(normalized);
    await Promise.all(normalized.map((collection) =>
      fetch(`/api/admin/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collection),
      }),
    ));
    await loadCollections();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl">Collections</h2>
          <p className="font-sans text-bodytext">Control collection imagery, names, order, and product grouping.</p>
        </div>
        <button onClick={startCreate} className="btn-dark">Add New Collection</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection, index) => (
          <div key={collection.id} className="rounded-sm border border-taupe/20 bg-white overflow-hidden">
            {collection.coverImage ? <img src={collection.coverImage} alt="" className="h-52 w-full object-cover" /> : <div className="h-52 bg-cream" />}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-2xl">{collection.name}</h3>
                <p className="font-sans text-sm text-bodytext">{collection._count?.products || 0} products · order {collection.order}</p>
              </div>
              <div className="flex gap-3 text-sm font-sans">
                <button onClick={() => setEditing(collection)} className="text-coral underline">Edit</button>
                <Link href={`/admin/collections/${collection.id}/items`} className="text-coral underline">Manage Items</Link>
                <button onClick={() => void moveCollection(index, -1)} disabled={index === 0} className="underline disabled:opacity-40">Up</button>
                <button onClick={() => void moveCollection(index, 1)} disabled={index === collections.length - 1} className="underline disabled:opacity-40">Down</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 bg-deepbrown/40">
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl">{editing.id ? "Edit Collection" : "New Collection"}</h3>
              <button onClick={() => setEditing(null)} className="font-sans text-sm underline">Close</button>
            </div>
            <div className="mt-6 grid gap-4">
              <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value, slug: slugify(event.target.value) })} placeholder="Name" className="rounded-sm border border-taupe/30 px-3 py-2" />
              <input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} placeholder="Slug" className="rounded-sm border border-taupe/30 px-3 py-2" />
              <textarea value={editing.description || ""} onChange={(event) => setEditing({ ...editing, description: event.target.value })} placeholder="Description" className="min-h-24 rounded-sm border border-taupe/30 px-3 py-2" />
              {editing.coverImage ? <img src={editing.coverImage} alt="" className="h-48 w-full rounded-sm object-cover" /> : null}
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file);
              }} />
              <div className="flex gap-3">
                <button onClick={() => void saveCollection()} className="btn-dark flex-1">Save</button>
                {editing.id ? <button onClick={() => void deleteCollection()} className="btn-outline flex-1">Delete</button> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
