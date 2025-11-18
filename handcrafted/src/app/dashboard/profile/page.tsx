"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  bio?: string;
  story?: string;
  profilePic?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [bio, setBio] = useState("");
  const [story, setStory] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: { user: AuthUser | null }) => {
        if (!data.user) {
          router.replace("/login"); // redirect if not logged in
          return;
        }
        // Fetch profile
        fetch("/api/seller-profile")
          .then((res) => res.json())
          .then((data) => {
            setProfile(data.profile || {});
            setBio(data.profile?.bio || "");
            setStory(data.profile?.story || "");
            setLoading(false);
          });
      })
      .catch(() => {
        router.replace("/login"); // redirect if token invalid
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let profilePicBase64: string | undefined;

    if (profilePicFile) {
      const reader = new FileReader();
      reader.readAsDataURL(profilePicFile);
      profilePicBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
    }

    const res = await fetch("/api/seller-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, story, profilePicBase64 }),
    });

    const data = await res.json();
    if (data.profile) setProfile(data.profile);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Bio:
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>
        <label>
          Story:
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>
        <label>
          Profile Picture:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
          />
        </label>
        <button className="bg-yellow-400 px-4 py-2 rounded font-semibold">
          Save Profile
        </button>
      </form>
      {profile.profilePic && (
        <Image
          src={profile.profilePic}
          alt="Profile"
          width={128}
          height={128}
          className="mt-4 rounded-full object-cover"
        />
      )}
    </div>
  );
}
