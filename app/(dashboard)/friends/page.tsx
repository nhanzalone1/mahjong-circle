import { ChevronLeft, Users, Copy } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFriendsWithProfiles } from "./actions";
import AddFriendForm from "./add-friend-form";
import RemoveFriendButton from "./remove-friend-button";
import CopyCodeButton from "../profile/copy-code-button";

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-cyan-600",
  "bg-orange-600",
];

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getOrCreateProfile(user);
  const friends = await getFriendsWithProfiles(user.id);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-[#0D1F17]">Friends</h1>
        <div className="w-11" />
      </div>

      {/* Your Invite Code */}
      <section>
        <p className="section-title mb-3">Your Invite Code</p>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-3xl font-bold text-[#C9A84C] tracking-[0.2em]">
              {profile.inviteCode}
            </p>
            <CopyCodeButton code={profile.inviteCode} />
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Share this code with friends so they can add you
          </p>
        </div>
      </section>

      {/* Add Friend */}
      <section>
        <p className="section-title mb-3">Add a Friend</p>
        <AddFriendForm />
      </section>

      {/* Friends List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">Your Friends</p>
          <span className="text-sm text-gray-500">{friends.length}</span>
        </div>

        {friends.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-gray-500 mb-2">No friends yet</p>
            <p className="text-sm text-gray-400">
              Enter a friend's invite code above to connect
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend, i) => {
              const initials = friend.displayName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={friend.id}
                  className="card p-5 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-semibold text-white`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0D1F17] truncate">
                      {friend.displayName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {friend.rankTitle || "Novice"}
                    </p>
                  </div>
                  <RemoveFriendButton friendshipId={friend.friendshipId!} friendName={friend.displayName} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
